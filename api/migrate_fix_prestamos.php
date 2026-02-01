<?php
require_once __DIR__ . '/config/db.php';

echo "<pre>Migrating Prestamos Table...\n";

try {
    $pdo->exec("DROP TABLE IF EXISTS prestamos");

    // Schema matching Prestamos.jsx and seed_data.php usage
    $sql = "CREATE TABLE prestamos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        socio_id INT NOT NULL,
        monto DECIMAL(15, 2) NOT NULL,
        monto_total_pagar DECIMAL(15, 2) NOT NULL,
        pagado DECIMAL(15, 2) DEFAULT 0.00,
        estado ENUM('activo', 'pagado', 'vencido') DEFAULT 'activo',
        plazo_semanas INT NOT NULL,
        fecha_inicio DATE,
        FOREIGN KEY (socio_id) REFERENCES socios(id)
    )";

    $pdo->exec($sql);
    echo "Table 'prestamos' recreated successfully with correct schema.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
echo "</pre>";
