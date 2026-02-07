<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

// Verificar autenticación (simplificado para este paso)
// TODO: Implementar validación de token JWT o sesión

try {
    $usuario_id = $_GET['usuario_id'] ?? null;
    $sql = "
        SELECT s.*, u.nombre_completo, u.email, u.rol 
        FROM socios s 
        JOIN usuarios u ON s.usuario_id = u.id 
    ";

    if ($usuario_id) {
        $sql .= " WHERE u.id = ? ";
        // Updated query with aggregation for status
        $query = "
            SELECT s.*, u.nombre_completo, u.email, u.rol,
            (SELECT COUNT(*) FROM prestamos p WHERE p.socio_id = s.id AND p.estado = 'pendiente') as prestamos_activos,
            (SELECT MAX(fecha_pago) FROM abonos a WHERE a.socio_id = s.id) as ultimo_abono
            FROM socios s 
            JOIN usuarios u ON s.usuario_id = u.id
            WHERE u.id = ?
            ORDER BY s.numero_socio ASC
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$usuario_id]);
    } else {
        // Admin View - All Socios with status
        $query = "
            SELECT s.*, u.nombre_completo, u.email, u.rol,
            (SELECT COUNT(*) FROM prestamos p WHERE p.socio_id = s.id AND p.estado = 'pendiente') as prestamos_activos,
            (SELECT MAX(fecha_pago) FROM abonos a WHERE a.socio_id = s.id) as ultimo_abono
            FROM socios s 
            JOIN usuarios u ON s.usuario_id = u.id
            ORDER BY s.numero_socio ASC
        ";
        $stmt = $pdo->query($query);
    }
    $socios = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $socios
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener socios: ' . $e->getMessage()
    ]);
}
