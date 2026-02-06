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
        $stmt = $pdo->prepare($sql . " ORDER BY s.numero_socio ASC");
        $stmt->execute([$usuario_id]);
    } else {
        $stmt = $pdo->query($sql . " ORDER BY s.numero_socio ASC");
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
