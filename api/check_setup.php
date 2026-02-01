<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/db.php';
header('Content-Type: application/json');

try {
    $stats = [];

    // Check Admin
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE username = ?");
    $stmt->execute(['admin']);
    $stats['admin_exists'] = $stmt->fetchColumn() > 0;

    // Check Socio Test
    $stmt->execute(['socio_test']);
    $stats['socio_test_exists'] = $stmt->fetchColumn() > 0;

    // Check Socios Table
    $stmt = $pdo->query("SELECT COUNT(*) FROM socios");
    $stats['socios_count'] = $stmt->fetchColumn();

    $stats['message'] = "Si admin_exists o socio_test_exists es false, NECESITAS EJECUTAR seed_data.php";

    echo json_encode($stats, JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
