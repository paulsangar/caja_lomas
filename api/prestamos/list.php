<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$usuario_id = $_GET['usuario_id'] ?? null;

try {
    $sql = "
        SELECT 
            p.*, 
            u.nombre_completo as socio_nombre, 
            s.numero_socio,
            (SELECT COALESCE(SUM(monto), 0) FROM movimientos WHERE socio_id = p.socio_id AND tipo = 'pago_prestamo') as monto_pagado
        FROM prestamos p 
        JOIN socios s ON p.socio_id = s.id 
        JOIN usuarios u ON s.usuario_id = u.id 
    ";

    $params = [];
    if ($usuario_id) {
        $sql .= " WHERE u.id = ? ";
        $params[] = $usuario_id;
    }

    $sql .= " ORDER BY p.fecha_solicitud DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $prestamos = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $prestamos]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
