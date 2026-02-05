<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['socio_id']) || empty($data['tipo']) || empty($data['monto'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Registrar movimiento
    $prestamo_id = $data['prestamo_id'] ?? null;
    $stmt = $pdo->prepare("INSERT INTO movimientos (socio_id, prestamo_id, tipo, monto, descripcion) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['socio_id'],
        $prestamo_id,
        $data['tipo'],
        $data['monto'],
        $data['descripcion'] ?? ''
    ]);

    // 2. Actualizar saldo en tabla socios (solo si no es préstamo otorgado, que no sale del ahorro)
    // Pero si es pago_prestamo, sí debe abonar al ahorro (o no, depende de la lógica de negocio, normalmente el pago de préstamo no es ahorro)
    // En esta aplicación, 'pago_prestamo' se suma al saldo_total del socio? 
    // Revisando el código original: el operador era '+' para 'pago_prestamo'.
    if ($data['tipo'] !== 'prestamo_otorgado') {
        $operador = ($data['tipo'] == 'aportacion' || $data['tipo'] == 'pago_prestamo') ? '+' : '-';
        $stmt = $pdo->prepare("UPDATE socios SET saldo_total = saldo_total $operador ? WHERE id = ?");
        $stmt->execute([$data['monto'], $data['socio_id']]);
    }

    // 3. Si es pago de préstamo, actualizar la tabla prestamos
    if ($data['tipo'] == 'pago_prestamo' && $prestamo_id) {
        $stmt = $pdo->prepare("UPDATE prestamos SET pagado = pagado + ? WHERE id = ?");
        $stmt->execute([$data['monto'], $prestamo_id]);

        // Opcional: Marcar como pagado si el total se alcanza
        $stmtCheck = $pdo->prepare("SELECT monto_total_pagar, pagado FROM prestamos WHERE id = ?");
        $stmtCheck->execute([$prestamo_id]);
        $loan = $stmtCheck->fetch();
        if ($loan && $loan['pagado'] >= $loan['monto_total_pagar']) {
            $pdo->prepare("UPDATE prestamos SET estado = 'pagado' WHERE id = ?")->execute([$prestamo_id]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Movimiento registrado con éxito']);

} catch (PDOException $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
