<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID requerido']);
    exit;
}

try {
    if (!empty($data['newPassword'])) {
        $hash = password_hash($data['newPassword'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET nombre_completo = ?, email = ?, password = ? WHERE id = ?");
        $stmt->execute([$data['nombre'], $data['email'], $hash, $data['id']]);
    } else {
        $stmt = $pdo->prepare("UPDATE usuarios SET nombre_completo = ?, email = ? WHERE id = ?");
        $stmt->execute([$data['nombre'], $data['email'], $data['id']]);
    }

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
