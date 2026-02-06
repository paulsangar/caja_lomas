<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de socio requerido']);
    exit;
}

try {
    // Basic validation
    $fields = [];
    $params = [];

    if (isset($data['telefono'])) {
        $fields[] = "telefono = ?";
        $params[] = $data['telefono'];
    }
    if (isset($data['email'])) {
        // Update ONLY in usuarios table? Or assume readonly there? 
        // Socios table doesn't have email usually, it's in usuarios.
        // Let's check structure. create.php puts email in usuarios.
        // So we need to update usuarios table too if email changes.
    }
    if (isset($data['banco'])) {
        $fields[] = "banco = ?";
        $params[] = $data['banco'];
    }
    if (isset($data['numero_cuenta'])) {
        $fields[] = "numero_cuenta = ?";
        $params[] = $data['numero_cuenta'];
    }
    if (isset($data['cupos'])) {
        $fields[] = "cupos = ?";
        $params[] = $data['cupos'];
    }

    // Logic for Email update in Usuarios table
    if (isset($data['email'])) {
        $stmtUser = $pdo->prepare("UPDATE usuarios u JOIN socios s ON s.usuario_id = u.id SET u.email = ? WHERE s.id = ?");
        $stmtUser->execute([$data['email'], $data['id']]);
    }

    // Logic for Socios table update
    if (!empty($fields)) {
        $sql = "UPDATE socios SET " . implode(', ', $fields) . " WHERE id = ?";
        $params[] = $data['id'];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    echo json_encode(['success' => true, 'message' => 'Socio actualizado correctamente']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
}
