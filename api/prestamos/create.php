<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['socio_id']) || empty($data['monto'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    $pdo->beginTransaction();

    $monto = $data['monto'];
    $interes = $data['tasa_interes'] ?? 10;
    $total = $monto * (1 + ($interes / 100));
    $plazo = $data['plazo_semanas'] ?? 1;

    // 1. Insertar Préstamo
    // Corrección V5.3: Incluir monto_total_pagar y plazo
    $stmt = $pdo->prepare("INSERT INTO prestamos (socio_id, monto, monto_total_pagar, pagado, estado, plazo_semanas, fecha_inicio) VALUES (?, ?, ?, 0, 'activo', ?, NOW())");
    $stmt->execute([
        $data['socio_id'],
        $monto,
        $total,
        $plazo
    ]);
    $prestamoId = $pdo->lastInsertId();

    // 2. Registrar Movimiento (Salida de dinero)
    // Nota: Vinculamos con prestamo_id para trazabilidad
    $stmtMov = $pdo->prepare("INSERT INTO movimientos (socio_id, prestamo_id, tipo, monto, descripcion, fecha_operacion) VALUES (?, ?, 'prestamo_otorgado', ?, ?, NOW())");
    $stmtMov->execute([
        $data['socio_id'],
        $prestamoId,
        $monto,
        "Préstamo #$prestamoId otorgado a " . $plazo . " semanas"
    ]);

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Préstamo creado exitosamente', 'id' => $prestamoId]);

} catch (PDOException $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
