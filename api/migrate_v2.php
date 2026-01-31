<?php
header('Content-Type: text/plain');
require_once __DIR__ . '/config/db.php';

echo "Iniciando migración de base de datos V2...\n";

try {
    $columnsToAdd = [
        'telefono' => "ALTER TABLE socios ADD COLUMN telefono VARCHAR(20) AFTER numero_socio",
        'numero_cuenta' => "ALTER TABLE socios ADD COLUMN numero_cuenta VARCHAR(30) AFTER telefono",
        'banco' => "ALTER TABLE socios ADD COLUMN banco VARCHAR(50) AFTER numero_cuenta",
        'cupos' => "ALTER TABLE socios ADD COLUMN cupos INT DEFAULT 1 AFTER banco",
        'fecha_nacimiento' => "ALTER TABLE socios ADD COLUMN fecha_nacimiento DATE AFTER cupos"
    ];

    foreach ($columnsToAdd as $column => $sql) {
        try {
            // Verificar si la columna ya existe
            $check = $pdo->query("SHOW COLUMNS FROM socios LIKE '$column'")->fetch();
            if (!$check) {
                // Intentar agregar la columna
                $pdo->exec($sql);
                echo "SUCCESS: Columna '$column' agregada correctamente.\n";
            } else {
                echo "INFO: La columna '$column' ya existe, no es necesario hacer nada.\n";
            }
        } catch (PDOException $e) {
            // Si falla específicamente una columna, lo reportamos y seguimos
            echo "ERROR al procesar '$column': " . $e->getMessage() . "\n";
        }
    }

    echo "\n --- Migración V2 Finalizada ---";

} catch (PDOException $e) {
    echo "CRITICAL ERROR: " . $e->getMessage();
}
