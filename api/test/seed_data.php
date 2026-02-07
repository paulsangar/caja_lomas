<?php
// api/test/seed_data.php
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

// Security: Only allow in debug mode or local (simplification for now: check param)
if (!isset($_GET['force']) || $_GET['force'] !== 'true') {
    echo json_encode(['success' => false, 'message' => 'Para ejecutar, usa ?force=true. ESTO BORRARÁ DATOS DE PRUEBA ANTERIORES.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Limpiar datos de prueba (IDs > 100)
    $pdo->exec("DELETE FROM abonos WHERE socio_id IN (SELECT id FROM socios WHERE numero_socio > 100)");
    $pdo->exec("DELETE FROM prestamos WHERE socio_id IN (SELECT id FROM socios WHERE numero_socio > 100)");
    $pdo->exec("DELETE FROM movimientos WHERE socio_id IN (SELECT id FROM socios WHERE numero_socio > 100)");
    $pdo->exec("DELETE FROM socios WHERE numero_socio > 100");
    $pdo->exec("DELETE FROM usuarios WHERE numero_socio > 100");

    // 2. Crear Usuarios (Password: 123456)
    $passHash = password_hash('123456', PASSWORD_BCRYPT);

    // Usuarios ficticios
    $usuarios = [
        ['Ana García', 'ana.garcia', $passHash, 'socio', '5512345678', 'ana@test.com', 101],
        ['Carlos López', 'carlos.lopez', $passHash, 'socio', '5587654321', 'carlos@test.com', 102],
        ['Maria Rodriguez', 'maria.r', $passHash, 'socio', '5511223344', 'maria@test.com', 103],
        ['Juan Perez', 'juan.perez', $passHash, 'socio', '5599887766', 'juan@test.com', 104]
    ];

    $stmtUser = $pdo->prepare("INSERT INTO usuarios (nombre_completo, username, password, rol, telefono, email, numero_socio, status, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())");

    foreach ($usuarios as $u) {
        $stmtUser->execute($u);
    }

    // 3. Crear registros en tabla Socios vinculados
    // Necesitamos los IDs insertados, pero como numero_socio es único, podemos subconsultar
    $pdo->exec("INSERT INTO socios (usuario_id, numero_socio, saldo_total, cupos) 
                SELECT id, numero_socio, 0, 1 FROM usuarios WHERE numero_socio > 100");

    // 4. Movimientos Iniciales (Ahorro)
    // Ana (101): Al corriente
    $idAna = $pdo->query("SELECT id FROM socios WHERE numero_socio = 101")->fetchColumn();
    $pdo->exec("INSERT INTO movimientos (socio_id, tipo, monto, fecha_operacion, descripcion) VALUES ($idAna, 'aportacion', 5000, NOW(), 'Ahorro Inicial')");
    $pdo->exec("UPDATE socios SET saldo_total = 5000 WHERE id = $idAna");

    // Carlos (102): Con Préstamo Activo y Ahorro
    $idCarlos = $pdo->query("SELECT id FROM socios WHERE numero_socio = 102")->fetchColumn();
    $pdo->exec("INSERT INTO movimientos (socio_id, tipo, monto, fecha_operacion, descripcion) VALUES ($idCarlos, 'aportacion', 1500, NOW(), 'Ahorro Inicial')");
    $pdo->exec("UPDATE socios SET saldo_total = 1500 WHERE id = $idCarlos");

    // Maria (103): Préstamo Atrasado
    $idMaria = $pdo->query("SELECT id FROM socios WHERE numero_socio = 103")->fetchColumn();
    // No ahorro

    // Juan (104): Atrasado en abonos (sin pago reciente)
    $idJuan = $pdo->query("SELECT id FROM socios WHERE numero_socio = 104")->fetchColumn();
    // Último abono hace 20 días
    $pdo->exec("INSERT INTO abonos (socio_id, monto, fecha_pago, semana_correspondiente, tipo) VALUES ($idJuan, 100, DATE_SUB(NOW(), INTERVAL 20 DAY), WEEK(NOW())-3, 'ahorro')");


    // 5. Préstamos
    // Carlos: Prestamo activo al corriente
    $pdo->exec("INSERT INTO prestamos (socio_id, monto, monto_pendiente, monto_pagado, fecha_inicio, fecha_vencimiento, estado, tasa_interes, plazo_semanas) 
                VALUES ($idCarlos, 2000, 1500, 500, DATE_SUB(NOW(), INTERVAL 2 WEEK), DATE_ADD(NOW(), INTERVAL 10 WEEK), 'activo', 10, 12)");

    // Maria: Prestamo Vencido
    $pdo->exec("INSERT INTO prestamos (socio_id, monto, monto_pendiente, monto_pagado, fecha_inicio, fecha_vencimiento, estado, tasa_interes, plazo_semanas) 
                VALUES ($idMaria, 5000, 5000, 0, DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 DAY), 'vencido', 15, 8)");


    // 6. Abonos Recientes
    // Ana pagó hoy
    $pdo->exec("INSERT INTO abonos (socio_id, monto, fecha_pago, semana_correspondiente, tipo) VALUES ($idAna, 100, NOW(), WEEK(NOW()), 'ahorro')");

    // Carlos pagó hace 3 días
    $pdo->exec("INSERT INTO abonos (socio_id, monto, fecha_pago, semana_correspondiente, tipo) VALUES ($idCarlos, 100, DATE_SUB(NOW(), INTERVAL 3 DAY), WEEK(NOW()), 'ahorro')");

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Datos de prueba generados correctamente. Usuarios creados: Ana, Carlos, Maria, Juan (IDs 101-104). Password: 123456']);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
