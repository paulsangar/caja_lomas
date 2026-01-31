<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

// Verificar autenticación (simplificado para este paso)
// TODO: Implementar validación de token JWT o sesión

try {
    $stmt = $pdo->query("
        SELECT s.*, u.nombre_completo, u.email, u.rol 
        FROM socios s 
        JOIN usuarios u ON s.usuario_id = u.id 
        ORDER BY s.numero_socio ASC
    ");
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
