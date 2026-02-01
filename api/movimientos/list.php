<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$usuario_id = $_GET['usuario_id'] ?? null;

try {
    $sql = "
        SELECT m.*, u.nombre_completo as socio_nombre, s.numero_socio 
        FROM movimientos m 
        JOIN socios s ON m.socio_id = s.id 
        JOIN usuarios u ON s.usuario_id = u.id 
    ";

    $params = [];
    if ($usuario_id) {
        $sql .= " WHERE u.id = ? ";
        $params[] = $usuario_id;
    }

    $sql .= " ORDER BY m.fecha_operacion DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $movimientos = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $movimientos]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
