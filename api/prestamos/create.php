<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['socio_id']) || empty($data['monto']) || empty($data['plazo'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO prestamos (socio_id, monto_solicitado, plazo_meses, estatus) VALUES (?, ?, ?, 'pendiente')");
    $stmt->execute([$data['socio_id'], $data['monto'], $data['plazo']]);

    echo json_encode(['success' => true, 'message' => 'Solicitud de préstamo enviada']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
