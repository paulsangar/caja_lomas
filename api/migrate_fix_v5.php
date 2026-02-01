<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/config/db.php';

echo "Iniciando migración de corrección V5...\n";

try {
    // 1. Corregir tabla Prestamos (Recrear para asegurar estructura limpia)
    $pdo->exec("DROP TABLE IF EXISTS prestamos");
    echo "Tabla prestamos eliminada.\n";

    $sqlPrestamos = "CREATE TABLE prestamos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        socio_id INT NOT NULL,
        monto DECIMAL(15, 2) NOT NULL,
        monto_total_pagar DECIMAL(15, 2) NOT NULL,
        pagado DECIMAL(15, 2) DEFAULT 0.00,
        estado ENUM('activo', 'pagado', 'vencido') DEFAULT 'activo',
        plazo_semanas INT NOT NULL,
        fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_fin TIMESTAMP NULL,
        FOREIGN KEY (socio_id) REFERENCES socios(id) ON DELETE CASCADE
    )";
    $pdo->exec($sqlPrestamos);
    echo "Tabla prestamos recreada con columnas correctas.\n";

    // 2. Modificar ENUM de movimientos para incluir 'prestamo_otorgado'
    // MySQL no soporta ALTER COLUMN para ENUM fácilmente sin redefinir toda la columna.
    // Ojo: Esto puede bloquear si la tabla es grande, pero aquí es pequeña.
    $sqlEnum = "ALTER TABLE movimientos MODIFY COLUMN tipo ENUM('aportacion', 'retiro', 'pago_prestamo', 'ajuste', 'prestamo_otorgado') NOT NULL";
    $pdo->exec($sqlEnum);
    echo "ENUM de movimientos actualizado.\n";

    echo "Migración completada con éxito.\n";

} catch (PDOException $e) {
    die("Error en migración: " . $e->getMessage() . "\n");
}
