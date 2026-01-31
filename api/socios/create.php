<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

$nombre = $data['nombre'] ?? '';
$email = $data['email'] ?? '';
$numero_socio = $data['numero_socio'] ?? '';
$telefono = $data['telefono'] ?? '';
$numero_cuenta = $data['numero_cuenta'] ?? '';
$banco = $data['banco'] ?? '';
$cupos = intval($data['cupos'] ?? 1);
$fecha_nacimiento = $data['fecha_nacimiento'] ?? null;
$password = $data['password'] ?? '123456'; // Contraseña por defecto

if (empty($nombre) || empty($numero_socio)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nombre y número de socio son obligatorios']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Crear el usuario
    $username = 'socio_' . $numero_socio;
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO usuarios (username, password_hash, nombre_completo, rol, email) VALUES (?, ?, ?, 'socio', ?)");
    $stmt->execute([$username, $password_hash, $nombre, $email]);
    $usuario_id = $pdo->lastInsertId();

    // 2. Crear el registro de socio con nuevos campos
    $stmt = $pdo->prepare("INSERT INTO socios (usuario_id, numero_socio, telefono, numero_cuenta, banco, cupos, fecha_nacimiento, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())");
    $stmt->execute([$usuario_id, $numero_socio, $telefono, $numero_cuenta, $banco, $cupos, $fecha_nacimiento]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Socio registrado con éxito',
        'data' => [
            'username' => $username,
            'temp_password' => $password
        ]
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar socio: ' . $e->getMessage()
    ]);
}
