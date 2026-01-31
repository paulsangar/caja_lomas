<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $pdo->query("SELECT * FROM avisos ORDER BY fecha_publicacion DESC");
    $avisos = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $avisos]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
