<?php
require_once __DIR__ . '/api/config/db.php';

echo "=== TABLE: PRESTAMOS ===\n";
$stmt = $pdo->query("DESCRIBE prestamos");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $col) {
    echo $col['Field'] . " (" . $col['Type'] . ")\n";
}

echo "\n=== TABLE: SOCIOS ===\n";
$stmt = $pdo->query("DESCRIBE socios");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $col) {
    echo $col['Field'] . " (" . $col['Type'] . ")\n";
}

echo "\n=== TABLE: MOVIMIENTOS ===\n";
$stmt = $pdo->query("DESCRIBE movimientos");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $col) {
    echo $col['Field'] . " (" . $col['Type'] . ")\n";
}
