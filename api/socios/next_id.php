<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

try {
    // Intentar obtener el máximo número de socio actual
    // Asumimos que son numéricos. Si son alfanuméricos complejos, esto requerirá regex
    // Por simplicidad para el usuario, usaremos enteros incrementales
    $stmt = $pdo->query("SELECT MAX(CAST(numero_socio AS UNSIGNED)) as max_id FROM socios");
    $row = $stmt->fetch();

    $nextId = ($row['max_id'] ?? 2024000) + 1; // Iniciar en 2024001 si está vacío

    echo json_encode(['success' => true, 'next_id' => $nextId]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
