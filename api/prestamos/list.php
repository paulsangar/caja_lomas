<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $pdo->query("
        SELECT p.*, u.nombre_completo as socio_nombre, s.numero_socio 
        FROM prestamos p 
        JOIN socios s ON p.socio_id = s.id 
        JOIN usuarios u ON s.usuario_id = u.id 
        ORDER BY p.fecha_solicitud DESC
    ");
    $prestamos = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $prestamos]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
