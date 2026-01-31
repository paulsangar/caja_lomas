<?php
header('Content-Type: text/plain');
require_once __DIR__ . '/config/db.php';

echo "Iniciando migración V3 (Tabla Avisos)...\n";

try {
    $sql = "CREATE TABLE IF NOT EXISTS avisos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        contenido TEXT NOT NULL,
        fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
        creado_por INT
    )";

    $pdo->exec($sql);
    echo "SUCCESS: Tabla 'avisos' verificada/creada correctamente.\n";

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
