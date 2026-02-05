<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/config/db.php';

function addColumnIfNotExists($pdo, $table, $column, $definition, &$messages, &$hasErrors)
{
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM $table LIKE '$column'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE $table ADD COLUMN $column $definition");
            $messages[] = "✅ Columna $column añadida a tabla $table.";
        } else {
            $messages[] = "ℹ️ Columna $column ya existe en tabla $table.";
        }
    } catch (PDOException $e) {
        $messages[] = "❌ Error verificando/añadiendo $table.$column: " . $e->getMessage();
        $hasErrors = true;
    }
}

header('Content-Type: application/json');
$messages = [];
$hasErrors = false;

try {
    // 1. Reparar Tabla PRESTAMOS
    $messages[] = "Verificando tabla PRESTAMOS...";
    addColumnIfNotExists($pdo, 'prestamos', 'monto', "DECIMAL(15, 2) NOT NULL AFTER socio_id", $messages, $hasErrors);
    addColumnIfNotExists($pdo, 'prestamos', 'monto_total_pagar', "DECIMAL(15, 2) NOT NULL AFTER monto", $messages, $hasErrors);
    addColumnIfNotExists($pdo, 'prestamos', 'pagado', "DECIMAL(15, 2) DEFAULT 0.00 AFTER monto_total_pagar", $messages, $hasErrors);
    addColumnIfNotExists($pdo, 'prestamos', 'plazo_semanas', "INT NOT NULL DEFAULT 12", $messages, $hasErrors);

    // 2. Reparar Tabla SOCIOS
    $messages[] = "Verificando tabla SOCIOS...";
    addColumnIfNotExists($pdo, 'socios', 'cupos', "INT DEFAULT 1", $messages, $hasErrors);

    // 3. Reparar Tabla MOVIMIENTOS
    $messages[] = "Verificando tabla MOVIMIENTOS...";
    addColumnIfNotExists($pdo, 'movimientos', 'prestamo_id', "INT NULL AFTER socio_id", $messages, $hasErrors);

    try {
        $pdo->exec("ALTER TABLE movimientos ADD CONSTRAINT fk_movimiento_prestamo FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE SET NULL");
        $messages[] = "✅ FK prestamo_id asegurada.";
    } catch (Exception $e) {
        // Ignorar si ya existe
        $messages[] = "ℹ️ FK prestamo_id ya existe o no se pudo crear (posiblemente ya existe con otro nombre).";
    }

    echo json_encode([
        'success' => !$hasErrors,
        'message' => $hasErrors ? 'Reparación de base de datos completada con advertencias/errores.' : 'Reparación de base de datos completada exitosamente.',
        'details' => $messages
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error CRÍTICO: ' . $e->getMessage(),
        'details' => $messages
    ]);
}
