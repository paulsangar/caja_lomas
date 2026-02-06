<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

// Endpoint temporal para limpiar abonos de prueba
try {
    $pdo->beginTransaction();

    // Eliminar movimientos de tipo 'aportacion'
    // Opcional: Filtrar solo los recientes o de prueba si se pudiera distinguir
    $stmt = $pdo->prepare("DELETE FROM movimientos WHERE tipo = 'aportacion'");
    $stmt->execute();
    $count = $stmt->rowCount();

    // RECALCULAR SALDOS DE SOCIOS
    // Esto es crítico: si borramos movimientos, los saldos en la tabla socios quedan mal.
    // Lo mejor es resetear saldo_total y recalcular SÓLO con lo que queda.
    // Asumimos que saldo_total = suma de aportaciones + pagos_prestamos - prestamos_otorgados

    // 1. Resetear a 0
    $pdo->exec("UPDATE socios SET saldo_total = 0");

    // 2. Recalcular 'aportacion' existente (debería ser 0 si borramos todo, pero por si acaso)
    $stmtAport = $pdo->query("SELECT socio_id, SUM(monto) as total FROM movimientos WHERE tipo = 'aportacion' GROUP BY socio_id");
    while ($row = $stmtAport->fetch()) {
        $pdo->prepare("UPDATE socios SET saldo_total = saldo_total + ? WHERE id = ?")->execute([$row['total'], $row['socio_id']]);
    }

    // 3. Recalcular 'prestamo_otorgado' (resta)
    $stmtPrest = $pdo->query("SELECT socio_id, SUM(monto) as total FROM movimientos WHERE tipo = 'prestamo_otorgado' GROUP BY socio_id");
    while ($row = $stmtPrest->fetch()) {
        $pdo->prepare("UPDATE socios SET saldo_total = saldo_total - ? WHERE id = ?")->execute([$row['total'], $row['socio_id']]);
    }

    // 4. Recalcular 'pago_prestamo' (suma)
    $stmtPago = $pdo->query("SELECT socio_id, SUM(monto) as total FROM movimientos WHERE tipo = 'pago_prestamo' GROUP BY socio_id");
    while ($row = $stmtPago->fetch()) {
        $pdo->prepare("UPDATE socios SET saldo_total = saldo_total + ? WHERE id = ?")->execute([$row['total'], $row['socio_id']]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => "Limpieza completada. $count abonos eliminados y saldos recalculados."]);

} catch (Exception $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
