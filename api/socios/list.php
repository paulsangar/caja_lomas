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

    $status = $_GET['status'] ?? null;

    if ($usuario_id) {
        $sql .= " WHERE u.id = ? ";
        // View for a specific user
        $query = "
            SELECT s.*, u.nombre_completo, u.email, u.rol, u.status
            FROM socios s 
            LEFT JOIN usuarios u ON s.usuario_id = u.id
            WHERE u.id = ?
            ORDER BY s.numero_socio ASC
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$usuario_id]);
    } else {
        // Admin View - All Socios
        // If status is specific 'pending' or 'active', filter by it. 
        // If no status param, return ALL so we don't return empty by mistake.

        $sql = "
            SELECT s.*, u.nombre_completo, u.email, u.rol, u.status
            FROM socios s 
            LEFT JOIN usuarios u ON s.usuario_id = u.id
        ";

        $params = [];
        if ($status) {
            $sql .= " WHERE u.status = ? ";
            $params[] = $status;
        } else {
            // Default: Show everything if no status requested, OR filter properly?
            // User says "when I add one, they all appear". This suggests the caching or the JOIN was weird.
            // Let's return ALL by default.
        }

        $sql .= " ORDER BY s.numero_socio ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }
    $socios = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $socios
    ]);
} catch (Exception $e) {
    file_put_contents(__DIR__ . '/error_log.txt', date('Y-m-d H:i:s') . " Error: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener socios: ' . $e->getMessage()
    ]);
}
