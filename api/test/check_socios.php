<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: text/plain');

echo "=== DIAGNOSTICO DE SOCIOS ===\n";

try {
    // 1. Check raw count in socios
    $stmt = $pdo->query("SELECT COUNT(*) FROM socios");
    echo "Total filas en tabla 'socios': " . $stmt->fetchColumn() . "\n";

    // 2. Check raw count in usuarios
    $stmt = $pdo->query("SELECT COUNT(*) FROM usuarios");
    echo "Total filas en tabla 'usuarios': " . $stmt->fetchColumn() . "\n";

    // 3. Run the exact query from list.php
    $sql = "
            SELECT s.*, u.nombre_completo, u.email, u.rol, u.status
            FROM socios s 
            JOIN usuarios u ON s.usuario_id = u.id 
            ORDER BY s.numero_socio ASC
    ";
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Filas retornadas por list.php query: " . count($data) . "\n\n";

    if (count($data) > 0) {
        echo "=== PRIMER REGISTRO ===\n";
        print_r($data[0]);

        echo "\n=== ANÁLISIS DE STATUS ===\n";
        foreach ($data as $row) {
            echo "ID: " . $row['id'] . " | Socio: " . $row['numero_socio'] . " | Status: [" . ($row['status'] ?? 'N/A') . "]\n";
        }
    } else {
        echo "LA CONSULTA JOIN NO RETORNA NADA.\n";
        echo "Posible causa: IDs no coinciden entre socios.usuario_id y usuarios.id\n";

        // Debug mismatch
        echo "\n=== IDs en SOCIOS ===\n";
        $stmt = $pdo->query("SELECT id, usuario_id FROM socios LIMIT 5");
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

        echo "\n=== IDs en USUARIOS ===\n";
        $stmt = $pdo->query("SELECT id, nombre_completo FROM usuarios LIMIT 5");
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
