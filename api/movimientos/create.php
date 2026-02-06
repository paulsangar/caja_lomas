<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

// Logging para debug
error_log("=== CREATE MOVIMIENTO ===");

$data = json_decode(file_get_contents('php://input'), true);
error_log("Datos recibidos: " . json_encode($data));

if (!$data || empty($data['socio_id']) || empty($data['tipo']) || empty($data['monto'])) {
    http_response_code(400);
    error_log("ERROR: Datos incompletos");
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    $pdo->beginTransaction();
    error_log("Transacción iniciada");

    // 1. Registrar movimiento
    $prestamo_id = $data['prestamo_id'] ?? null;
    $insertSuccess = false;

    try {
        // Intento V5.2: Usando la nueva columna prestamo_id
        error_log("Intentando INSERT con prestamo_id...");
        $stmt = $pdo->prepare("INSERT INTO movimientos (socio_id, prestamo_id, tipo, monto, descripcion, fecha_operacion) VALUES (?, ?, ?, ?, ?, NOW())");
        $result = $stmt->execute([
            $data['socio_id'],
            $prestamo_id,
            $data['tipo'],
            $data['monto'],
            $data['descripcion'] ?? ''
        ]);

        if ($result && $stmt->rowCount() > 0) {
            $insertSuccess = true;
            error_log("✅ INSERT exitoso con prestamo_id. Rows affected: " . $stmt->rowCount());
        } else {
            error_log("⚠️ INSERT retornó pero no afectó filas");
        }

    } catch (PDOException $e) {
        // Fallback V5.1: Si la columna prestamo_id no existe
        error_log("Fallback: " . $e->getMessage());

        if ($e->errorInfo[1] == 1054 || strpos($e->getMessage(), 'Unknown column') !== false) {
            error_log("Intentando INSERT sin prestamo_id...");
            $stmt = $pdo->prepare("INSERT INTO movimientos (socio_id, tipo, monto, descripcion, fecha_operacion) VALUES (?, ?, ?, ?, NOW())");
            $result = $stmt->execute([
                $data['socio_id'],
                $data['tipo'],
                $data['monto'],
                $data['descripcion'] ?? ''
            ]);

            if ($result && $stmt->rowCount() > 0) {
                $insertSuccess = true;
                error_log("✅ INSERT exitoso sin prestamo_id. Rows affected: " . $stmt->rowCount());
            } else {
                error_log("⚠️ INSERT fallback retornó pero no afectó filas");
            }
        } else {
            error_log("❌ Error SQL diferente: " . $e->getMessage());
            throw $e; // Re-lanzar si es otro error
        }
    }

    // VERIFICAR que realmente se insertó
    if (!$insertSuccess) {
        throw new Exception("El INSERT no afectó ninguna fila. Datos: " . json_encode($data));
    }

    // 2. Actualizar saldo en tabla socios
    if ($data['tipo'] !== 'prestamo_otorgado') {
        $operador = ($data['tipo'] == 'aportacion' || $data['tipo'] == 'pago_prestamo') ? '+' : '-';
        error_log("Actualizando saldo: operador=$operador, monto={$data['monto']}, socio_id={$data['socio_id']}");

        $stmt = $pdo->prepare("UPDATE socios SET saldo_total = saldo_total $operador ? WHERE id = ?");
        $result = $stmt->execute([$data['monto'], $data['socio_id']]);
        error_log("Saldo actualizado. Rows affected: " . $stmt->rowCount());
    }

    // 3. Si es pago de préstamo, actualizar la tabla prestamos
    if ($data['tipo'] == 'pago_prestamo' && $prestamo_id) {
        error_log("Actualizando préstamo ID: $prestamo_id");
        $stmt = $pdo->prepare("UPDATE prestamos SET pagado = pagado + ? WHERE id = ?");
        $stmt->execute([$data['monto'], $prestamo_id]);

        // Marcar como pagado si se alcanza el total
        $stmtCheck = $pdo->prepare("SELECT monto_total_pagar, pagado FROM prestamos WHERE id = ?");
        $stmtCheck->execute([$prestamo_id]);
        $loan = $stmtCheck->fetch();
        if ($loan && $loan['pagado'] >= $loan['monto_total_pagar']) {
            $pdo->prepare("UPDATE prestamos SET estado = 'pagado' WHERE id = ?")->execute([$prestamo_id]);
            error_log("Préstamo marcado como pagado");
        }
    }

    $pdo->commit();
    error_log("✅ COMMIT exitoso");
    echo json_encode(['success' => true, 'message' => 'Movimiento registrado con éxito']);

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
