<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/config/db.php';

echo "<h2>Iniciando Reparación Integral de Esquema V5.2</h2>";

function addColumnIfNotExists($pdo, $table, $column, $definition)
{
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM $table LIKE '$column'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE $table ADD COLUMN $column $definition");
            echo "✅ Columna <b>$column</b> añadida a tabla <b>$table</b>.<br>";
        } else {
            echo "ℹ️ Columna <b>$column</b> ya existe en tabla <b>$table</b>.<br>";
        }
    } catch (PDOException $e) {
        echo "❌ Error verificando/añadiendo $table.$column: " . $e->getMessage() . "<br>";
    }
}

try {
    // 1. Reparar Tabla PRESTAMOS
    echo "<h3>1. Tabla PRESTAMOS</h3>";
    // Asegurar que existan las columnas críticas que faltaban
    addColumnIfNotExists($pdo, 'prestamos', 'monto', "DECIMAL(15, 2) NOT NULL AFTER socio_id");
    addColumnIfNotExists($pdo, 'prestamos', 'monto_total_pagar', "DECIMAL(15, 2) NOT NULL AFTER monto");
    addColumnIfNotExists($pdo, 'prestamos', 'pagado', "DECIMAL(15, 2) DEFAULT 0.00 AFTER monto_total_pagar");
    addColumnIfNotExists($pdo, 'prestamos', 'plazo_semanas', "INT NOT NULL DEFAULT 12");

    // 2. Reparar Tabla SOCIOS
    echo "<h3>2. Tabla SOCIOS</h3>";
    addColumnIfNotExists($pdo, 'socios', 'cupos', "INT DEFAULT 1");

    // 3. Reparar Tabla MOVIMIENTOS
    echo "<h3>3. Tabla MOVIMIENTOS</h3>";
    addColumnIfNotExists($pdo, 'movimientos', 'prestamo_id', "INT NULL AFTER socio_id");

    // Verificar si existe la FK, si no, intentamos crearla (ignorando error si ya existe con otro nombre)
    try {
        $pdo->exec("ALTER TABLE movimientos ADD CONSTRAINT fk_movimiento_prestamo FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE SET NULL");
        echo "✅ FK prestamo_id creada en movimientos.<br>";
    } catch (Exception $e) {
        // Ignorar error de FK duplicada
    }

    echo "<h3>Diagnóstico Final</h3>";
    echo "La base de datos ha sido verificada. Por favor intenta realizar las operaciones de nuevo.";

} catch (PDOException $e) {
    die("Error CRÍTICO: " . $e->getMessage());
}
