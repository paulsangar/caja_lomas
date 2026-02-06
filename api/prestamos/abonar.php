<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['prestamo_id']) || empty($data['monto_abono'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    $pdo->beginTransaction();

    $prestamo_id = $data['prestamo_id'];
    $monto_abono = $data['monto_abono'];
    $usuario_id = $data['usuario_id'] ?? null; // Quien hace el movimiento

    // 1. Obtener datos del préstamo y socio
    $stmt = $pdo->prepare("SELECT socio_id, pagado, monto_total_pagar FROM prestamos WHERE id = ?");
    $stmt->execute([$prestamo_id]);
    $prestamo = $stmt->fetch();

    if (!$prestamo) {
        throw new Exception("Préstamo no encontrado");
    }

    $saldo_restante = $prestamo['monto_total_pagar'] - $prestamo['pagado'];

    // Validación V5.21: No permitir abonar más de la deuda
    if ($monto_abono > $saldo_restante) {
        throw new Exception("El abono ($" . number_format($monto_abono, 2) . ") excede el saldo restante ($" . number_format($saldo_restante, 2) . ")");
    }

    $socio_id = $prestamo['socio_id'];
    $nuevo_pagado = $prestamo['pagado'] + $monto_abono;
    // float comparison safety
    $estado = ($nuevo_pagado >= ($prestamo['monto_total_pagar'] - 0.01)) ? 'pagado' : 'activo';

    // 2. Registrar movimiento (entrada de dinero)
    $stmtMov = $pdo->prepare("INSERT INTO movimientos (socio_id, prestamo_id, tipo, monto, descripcion, fecha_operacion) VALUES (?, ?, 'pago_prestamo', ?, ?, NOW())");
    $stmtMov->execute([
        $socio_id,
        $prestamo_id,
        $monto_abono,
        "Abono a préstamo #$prestamo_id"
    ]);

    // 3. Actualizar préstamo
    $stmtUpdate = $pdo->prepare("UPDATE prestamos SET pagado = pagado + ?, estado = ? WHERE id = ?");
    $stmtUpdate->execute([$monto_abono, $estado, $prestamo_id]);

    // 4. Actualizar saldo del socio (Opcional: Si el abono cuenta como 'ahorro' o solo paga deuda? 
    // En Cajas de Ahorro, pagar préstamo NO suele aumentar el ahorro, es pagar deuda.
    // Solo registramos el movimiento para historial).

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Abono registrado']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
