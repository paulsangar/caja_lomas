<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/config/db.php';

echo "Iniciando migración de corrección V5.2 (Vinculación de Préstamos)...\n";

try {
    // 1. Añadir columna prestamo_id a movimientos
    // Usamos NULL por defecto para movimientos que no son préstamos (aportaciones, retiros)
    $sql = "ALTER TABLE movimientos ADD COLUMN prestamo_id INT NULL AFTER socio_id";
    $pdo->exec($sql);
    echo "Columna prestamo_id añadida a tabla movimientos.\n";

    // 2. Añadir Foreign Key (opcional pero recomendado para integridad)
    $sqlFK = "ALTER TABLE movimientos ADD CONSTRAINT fk_movimiento_prestamo FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE SET NULL";
    $pdo->exec($sqlFK);
    echo "Restricción de llave foránea añadida.\n";

    echo "Migración completada con éxito.\n";

} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "La columna prestamo_id ya existe. Continuando...\n";
    } else {
        die("Error en migración: " . $e->getMessage() . "\n");
    }
}
