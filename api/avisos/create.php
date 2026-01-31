<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['titulo']) || !isset($data['contenido'])) {
        throw new Exception('Título y contenido son obligatorios');
    }

    $stmt = $pdo->prepare("INSERT INTO avisos (titulo, contenido, prioridad, fecha_publicacion) VALUES (?, ?, ?, NOW())");
    $stmt->execute([
        $data['titulo'],
        $data['contenido'],
        $data['prioridad'] ?? 'media'
    ]);

    echo json_encode(['success' => true, 'message' => 'Aviso publicado correctamente']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
