<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID requerido']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM avisos WHERE id = ?");
    $stmt->execute([$data['id']]);

    echo json_encode(['success' => true, 'message' => 'Aviso eliminado']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al eliminar: ' . $e->getMessage()]);
}
