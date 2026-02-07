<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: text/plain');

try {
    echo "=== TABLE: SOCIOS ===\n";
    $stmt = $pdo->query("DESCRIBE socios");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        echo $c['Field'] . " (" . $c['Type'] . ")\n";
    }

    echo "\n=== TABLE: USUARIOS ===\n";
    $stmt = $pdo->query("DESCRIBE usuarios");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        echo $c['Field'] . " (" . $c['Type'] . ")\n";
    }

    echo "\n=== TABLE: PRESTAMOS ===\n";
    $stmt = $pdo->query("DESCRIBE prestamos");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        echo $c['Field'] . " (" . $c['Type'] . ")\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
