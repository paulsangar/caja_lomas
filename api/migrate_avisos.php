<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/config/db.php';

echo "Iniciando migración de Avisos (Destinatarios)...\n";

try {
    // Agregar columna destinatario_id si no existe
    $stmt = $pdo->query("SHOW COLUMNS FROM avisos LIKE 'destinatario_id'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE avisos ADD COLUMN destinatario_id INT NULL DEFAULT NULL AFTER contenido");
        echo "Columna 'destinatario_id' agregada.\n";
    } else {
        echo "Columna 'destinatario_id' ya existe.\n";
    }

    echo "Migración completada con éxito.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
