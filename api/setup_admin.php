<?php
/**
 * setup_admin.php - Crea el usuario administrador inicial
 * EJECUTAR UNA SOLA VEZ
 */

// Forzar visualización de errores para diagnóstico
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Iniciando proceso de creación de administrador...<br>";

// Usar ruta absoluta para evitar errores de inclusión
require_once __DIR__ . '/config/db.php';

$username = 'admin';
$password = 'CajaLomas2026!'; // Se recomienda cambiar esto después
$nombre = 'Administrador Sistema';
$rol = 'admin';
$email = 'admin@dryairbarbosa.com';

$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO usuarios (username, password_hash, nombre_completo, rol, email) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$username, $password_hash, $nombre, $rol, $email]);
    echo "Usuario admin creado con éxito.\n";
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo "El usuario admin ya existe.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
