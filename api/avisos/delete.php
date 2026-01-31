<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
        throw new Exception('ID de aviso es obligatorio');
    }

    $stmt = $pdo->prepare("DELETE FROM avisos WHERE id = ?");
    $stmt->execute([$data['id']]);

    echo json_encode(['success' => true, 'message' => 'Aviso eliminado']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
