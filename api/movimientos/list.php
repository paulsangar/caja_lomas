<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

try {
    // Para esta fase de prueba rápida, devolvemos todo con nombres de socios
    $stmt = $pdo->query("
        SELECT m.*, u.nombre_completo as socio_nombre, s.numero_socio 
        FROM movimientos m 
        JOIN socios s ON m.socio_id = s.id 
        JOIN usuarios u ON s.usuario_id = u.id 
        ORDER BY m.fecha_operacion DESC
    ");
    $movimientos = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $movimientos]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
