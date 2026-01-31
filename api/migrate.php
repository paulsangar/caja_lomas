<?php
header('Content-Type: text/plain');
require_once __DIR__ . '/config/db.php';

echo "Iniciando migración de base de datos...\n";

try {
    $columnsToAdd = [
        'telefono' => "ALTER TABLE socios ADD COLUMN telefono VARCHAR(20) AFTER numero_socio",
        'numero_cuenta' => "ALTER TABLE socios ADD COLUMN numero_cuenta VARCHAR(30) AFTER telefono",
        'banco' => "ALTER TABLE socios ADD COLUMN banco VARCHAR(50) AFTER numero_cuenta",
        'cupos' => "ALTER TABLE socios ADD COLUMN cupos INT DEFAULT 1 AFTER banco",
        'fecha_nacimiento' => "ALTER TABLE socios ADD COLUMN fecha_nacimiento DATE AFTER cupos"
    ];

    foreach ($columnsToAdd as $column => $sql) {
        // Verificar si la columna ya existe
        $check = $pdo->query("SHOW COLUMNS FROM socios LIKE '$column'")->fetch();
        if (!$check) {
            $pdo->exec($sql);
            echo "Ejecutado: $sql\n";
        } else {
            echo "La columna '$column' ya existe, saltando...\n";
        }
    }

    echo "Migración completada con éxito.";

} catch (PDOException $e) {
    echo "Error en migración: " . $e->getMessage();
}
