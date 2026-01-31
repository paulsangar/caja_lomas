<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

try {
    // Calculamos el monto pagado sumando los movimientos de tipo 'pago_prestamo' para el socio
    // NOTA: Esta versión es simplificada. En una versión real filtraríamos por ID de préstamo si existiera la relación directa en movimientos.
    $stmt = $pdo->query("
        SELECT 
            p.*, 
            u.nombre_completo as socio_nombre, 
            s.numero_socio,
            (SELECT COALESCE(SUM(monto), 0) FROM movimientos WHERE socio_id = p.socio_id AND tipo = 'pago_prestamo') as monto_pagado
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
