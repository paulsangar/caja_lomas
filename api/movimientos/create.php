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
    $stmt = $pdo->prepare("INSERT INTO movimientos (socio_id, tipo, monto, descripcion) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['socio_id'], $data['tipo'], $data['monto'], $data['descripcion'] ?? '']);

    // 2. Actualizar saldo en tabla socios
    $operador = ($data['tipo'] == 'aportacion' || $data['tipo'] == 'pago_prestamo') ? '+' : '-';
    $stmt = $pdo->prepare("UPDATE socios SET saldo_total = saldo_total $operador ? WHERE id = ?");
    $stmt->execute([$data['monto'], $data['socio_id']]);

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Movimiento registrado con éxito']);

} catch (PDOException $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
