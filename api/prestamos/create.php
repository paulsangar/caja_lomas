<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['socio_id']) || empty($data['monto'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    $monto = $data['monto'];
    $interes = $data['tasa_interes'] ?? 10;
    $total = $monto * (1 + ($interes / 100)); // Calculo simple

    $stmt = $pdo->prepare("INSERT INTO prestamos (socio_id, monto, monto_total_pagar, pagado, estado, plazo_semanas, fecha_inicio) VALUES (?, ?, ?, 0, 'activo', ?, ?)");
    $stmt->execute([
        $data['socio_id'],
        $monto,
        $total,
        $data['plazo_semanas'],
        $data['fecha_inicio']
    ]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
