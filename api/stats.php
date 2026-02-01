<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/db.php';

$usuario_id = $_GET['usuario_id'] ?? null;

try {
    $stats = [];

    // Filtro base
    $whereSocio = "";
    if ($usuario_id) {
        $whereSocio = " WHERE usuario_id = " . intval($usuario_id);
    }

    // Saldo Total (Personal o Global)
    $stmt = $pdo->query("SELECT SUM(saldo_total) as total FROM socios $whereSocio");
    $stats['saldo_total'] = (float) $stmt->fetch()['total'] ?? 0;

    // Total Socios (Siempre global)
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM socios");
    $stats['total_socios'] = (int) $stmt->fetch()['total'];

    // Préstamos Activos
    $sqlPrestamos = "SELECT COUNT(*) as total, SUM(saldo_pendiente) as monto FROM prestamos p JOIN socios s ON p.socio_id = s.id";
    if ($usuario_id) {
        $sqlPrestamos .= " WHERE s.usuario_id = " . intval($usuario_id) . " AND p.estatus = 'aprobado'";
    } else {
        $sqlPrestamos .= " WHERE p.estatus = 'aprobado'";
    }
    $stmt = $pdo->query($sqlPrestamos);
    $row = $stmt->fetch();
    $stats['prestamos_activos'] = (int) $row['total'];
    $stats['monto_prestamos'] = (float) $row['monto'] ?? 0;

    // Últimos movimientos
    $sqlMovs = "
        SELECT m.*, u.nombre_completo 
        FROM movimientos m 
        JOIN socios s ON m.socio_id = s.id 
        JOIN usuarios u ON s.usuario_id = u.id 
    ";
    if ($usuario_id) {
        $sqlMovs .= " WHERE u.id = " . intval($usuario_id);
    }
    $sqlMovs .= " ORDER BY m.fecha_operacion DESC LIMIT 5";

    $stmt = $pdo->query($sqlMovs);
    $stats['recientes'] = $stmt->fetchAll();

    // Avisos (Globales)
    $stmt = $pdo->query("SELECT * FROM avisos ORDER BY fecha_publicacion DESC LIMIT 5");
    $stats['avisos'] = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
