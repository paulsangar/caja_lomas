<?php
require_once __DIR__ . '/config/db.php';
header('Content-Type: application/json');

$tables = ['prestamos', 'socios', 'movimientos', 'avisos'];
$result = [];

foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        $result[$table] = $stmt->fetchAll(PDO::FETCH_COLUMN);
    } catch (PDOException $e) {
        $result[$table] = "Error: " . $e->getMessage();
    }
}

echo json_encode($result);
