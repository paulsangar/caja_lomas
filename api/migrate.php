<?php
header('Content-Type: text/plain');
require_once __DIR__ . '/config/db.php';

echo "Iniciando migración de base de datos...\n";

try {
    $queries = [
        "ALTER TABLE socios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20) AFTER numero_socio",
        "ALTER TABLE socios ADD COLUMN IF NOT EXISTS numero_cuenta VARCHAR(30) AFTER telefono",
        "ALTER TABLE socios ADD COLUMN IF NOT EXISTS banco VARCHAR(50) AFTER numero_cuenta",
        "ALTER TABLE socios ADD COLUMN IF NOT EXISTS cupos INT DEFAULT 1 AFTER banco",
        "ALTER TABLE socios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE AFTER cupos"
    ];

    foreach ($queries as $sql) {
        $pdo->exec($sql);
        echo "Ejecutado: $sql\n";
    }

    echo "Migración completada con éxito.";

} catch (PDOException $e) {
    echo "Error en migración: " . $e->getMessage();
}
