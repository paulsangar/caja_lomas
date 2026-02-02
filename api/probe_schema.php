<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/db.php';

$tables = ['prestamos', 'socios', 'movimientos', 'avisos'];
$schema = [];

foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $schema[$table] = $columns;
    } catch (Exception $e) {
        $schema[$table] = "Error: " . $e->getMessage();
    }
}

echo json_encode($schema);
