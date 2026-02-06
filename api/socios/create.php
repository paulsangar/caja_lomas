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
    // 0. GENERACIÓN ROBUSTA DE ID (Auto-retry)
    // Ignoramos el numero_socio enviado si es 'Auto', o intentamos usarlo pero si falla generamos uno nuevo.
    // La estrategia más segura es calcular el ID *dentro* de la transacción o justo antes, con un loop de reintento.

    $maxRetries = 5;
    $attempt = 0;
    $assigned_socio_id = null;

    // Si el usuario envió un n_socio específico (no auto), intentamos usar ese primero.
    $requested_id = isset($data['numero_socio']) && is_numeric($data['numero_socio']) ? $data['numero_socio'] : null;

    if ($requested_id) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM socios WHERE numero_socio = ?");
        $stmt->execute([$requested_id]);
        if ($stmt->fetchColumn() == 0) {
            $assigned_socio_id = $requested_id;
        }
    }

    // Si no se pudo usar el solicitado o no hubo, buscamos el siguiente disponible
    if (!$assigned_socio_id) {
        while ($attempt < $maxRetries) {
            $stmt = $pdo->query("SELECT MAX(CAST(numero_socio AS UNSIGNED)) FROM socios");
            $max = $stmt->fetchColumn();
            $candidate = ($max ?? 1000) + 1; // Start at 1001 if empty

            // Check validity (concurrency check)
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM socios WHERE numero_socio = ?");
            $stmt->execute([$candidate]);
            if ($stmt->fetchColumn() == 0) {
                $assigned_socio_id = $candidate;
                break;
            }
            $attempt++;
        }
    }

    if (!$assigned_socio_id) {
        throw new Exception("No se pudo asignar un número de socio único después de varios intentos. Intente nuevamente.");
    }

    // Check duplication again just to be safe (though logic above handles it)
    // ...

    $username = 'socio_' . $assigned_socio_id;
    // Check User existence logic (same as before but using assigned_socio_id)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetchColumn() > 0) {
        $username = $username . '_' . time();
    }

    $pdo->beginTransaction();

    // 1. Crear el usuario
    // Use $assigned_socio_id instead of $numero_socio down below

    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO usuarios (username, password_hash, nombre_completo, rol, email) VALUES (?, ?, ?, 'socio', ?)");
    $stmt->execute([$username, $password_hash, $nombre, $email]);
    $usuario_id = $pdo->lastInsertId();

    // 2. Crear el registro de socio con nuevos campos
    $stmt = $pdo->prepare("INSERT INTO socios (usuario_id, numero_socio, telefono, numero_cuenta, banco, cupos, fecha_nacimiento, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())");
    $stmt->execute([$usuario_id, $assigned_socio_id, $telefono, $numero_cuenta, $banco, $cupos, $fecha_nacimiento]);

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
