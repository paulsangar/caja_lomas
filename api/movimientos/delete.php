<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

error_log("=== DELETE MOVIMIENTO ===");

// Esperar JSON con: { movimiento_id: X } o { socio_id: X, descripcion: "..." }
$data = json_decode(file_get_contents('php://input'), true);
error_log("Datos recibidos: " . json_encode($data));

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Buscar el movimiento para obtener datos antes de borrar
    if (isset($data['movimiento_id'])) {
        $stmt = $pdo->prepare("SELECT * FROM movimientos WHERE id = ?");
        $stmt->execute([$data['movimiento_id']]);
        $movimiento = $stmt->fetch();

    } else if (isset($data['socio_id']) && isset($data['descripcion'])) {
        // Buscar por socio + descripción
        $stmt = $pdo->prepare("SELECT * FROM movimientos WHERE socio_id = ? AND descripcion LIKE ? AND tipo = 'aportacion' ORDER BY fecha_operacion DESC LIMIT 1");
        $stmt->execute([$data['socio_id'], '%' . $data['descripcion'] . '%']);
        $movimiento = $stmt->fetch();

    } else {
        throw new Exception("Faltan parámetros: movimiento_id o (socio_id + descripcion)");
    }

    if (!$movimiento) {
        throw new Exception("Movimiento no encontrado");
    }

    error_log("Movimiento encontrado: ID={$movimiento['id']}, socio={$movimiento['socio_id']}, monto={$movimiento['monto']}, tipo={$movimiento['tipo']}");

    // 1. Eliminar el movimiento
    $stmt = $pdo->prepare("DELETE FROM movimientos WHERE id = ?");
    $result = $stmt->execute([$movimiento['id']]);

    if (!$result || $stmt->rowCount() === 0) {
        throw new Exception("No se pudo eliminar el movimiento");
    }

    error_log("✅ DELETE exitoso. Rows affected: " . $stmt->rowCount());

    // 2. Revertir el cambio en saldo_total del socio
    if ($movimiento['tipo'] !== 'prestamo_otorgado') {
        // Invertir la operación original
        $operador = ($movimiento['tipo'] == 'aportacion' || $movimiento['tipo'] == 'pago_prestamo') ? '-' : '+';

        error_log("Revirtiendo saldo: operador=$operador, monto={$movimiento['monto']}, socio_id={$movimiento['socio_id']}");

        $stmt = $pdo->prepare("UPDATE socios SET saldo_total = saldo_total $operador ? WHERE id = ?");
        $stmt->execute([$movimiento['monto'], $movimiento['socio_id']]);

        error_log("Saldo revertido. Rows affected: " . $stmt->rowCount());
    }

    // 3. Si era pago de préstamo, revertir en tabla prestamos
    if ($movimiento['tipo'] == 'pago_prestamo' && $movimiento['prestamo_id']) {
        error_log("Revirtiendo pago de préstamo ID: {$movimiento['prestamo_id']}");

        $stmt = $pdo->prepare("UPDATE prestamos SET pagado = pagado - ? WHERE id = ?");
        $stmt->execute([$movimiento['monto'], $movimiento['prestamo_id']]);

        // Revisar si debe cambiar estado de nuevo a 'activo'
        $stmtCheck = $pdo->prepare("SELECT monto_total_pagar, pagado FROM prestamos WHERE id = ?");
        $stmtCheck->execute([$movimiento['prestamo_id']]);
        $loan = $stmtCheck->fetch();

        if ($loan && $loan['pagado'] < $loan['monto_total_pagar']) {
            $pdo->prepare("UPDATE prestamos SET estado = 'activo' WHERE id = ?")->execute([$movimiento['prestamo_id']]);
            error_log("Préstamo reactivado");
        }
    }

    $pdo->commit();
    error_log("✅ COMMIT exitoso");

    echo json_encode([
        'success' => true,
        'message' => 'Movimiento eliminado',
        'movimiento_id' => $movimiento['id']
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
        error_log("❌ ROLLBACK ejecutado");
    }

    $errorMsg = $e->getMessage();
    error_log("❌ ERROR FINAL: " . $errorMsg);

    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
}
