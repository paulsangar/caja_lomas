<?php
require_once __DIR__ . '/../config/db.php';

echo "<pre>";
echo "Iniciando sembrado de datos (Seed)...\n";

try {
    $pdo->beginTransaction();

    // 1. Limpiar tablas (Opcional, cuidado en prod)
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE movimientos");
    $pdo->exec("TRUNCATE TABLE prestamos");
    $pdo->exec("TRUNCATE TABLE socios");
    $pdo->exec("TRUNCATE TABLE usuarios");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "Tablas limpiadas.\n";

    // 2. Crear Admin
    $passAdmin = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO usuarios (username, password_hash, nombre_completo, rol, email) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['admin', $passAdmin, 'Administrador Sistema', 'admin', 'admin@caja.com']);
    $adminId = $pdo->lastInsertId();
    echo "Admin creado (User: admin, Pass: admin123).\n";

    // 3. Crear Usuario Socio Prueba
    $passSocio = password_hash('socio123', PASSWORD_DEFAULT);
    $stmt->execute(['socio_test', $passSocio, 'Juan Pérez (Demo)', 'socio', 'juan@demo.com']);
    $userId = $pdo->lastInsertId();
    echo "Usuario Socio creado (User: socio_test, Pass: socio123).\n";

    // 4. Crear Perfil Socio
    $stmtSocio = $pdo->prepare("INSERT INTO socios (usuario_id, numero_socio, telefono, banco, cupos, fecha_ingreso, saldo_total) VALUES (?, ?, ?, ?, ?, CURDATE(), ?)");
    $stmtSocio->execute([$userId, '1001', '5512345678', 'BBVA', 2, 0]); // Saldo inicial 0
    $socioId = $pdo->lastInsertId();
    echo "Perfil Socio creado.\n";

    // 5. Crear otros socios
    $nombres = ['Maria Garcia', 'Pedro Lopez', 'Ana Martinez'];
    foreach ($nombres as $i => $nom) {
        $userStr = strtolower(str_replace(' ', '', $nom));
        $stmt->execute([$userStr, $passSocio, $nom, 'socio', "$userStr@demo.com"]);
        $uId = $pdo->lastInsertId();
        $stmtSocio->execute([$uId, 1002 + $i, '550000000' . $i, 'Banamex', 1, 0]);
    }
    echo "Socios adicionales creados.\n";

    // 6. Registrar Aportaciones (Simular historial)
    $stmtMov = $pdo->prepare("INSERT INTO movimientos (socio_id, tipo, monto, descripcion, fecha_operacion) VALUES (?, ?, ?, ?, ?)");

    // Juan Perez aporta 4 semanas
    $fechas = ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22'];
    $totalAportado = 0;
    foreach ($fechas as $i => $fecha) {
        $monto = 200; // 2 cupos * 100
        $stmtMov->execute([$socioId, 'aportacion', $monto, "Abono Semana " . ($i + 1) . " Enero", "$fecha 12:00:00"]);
        $totalAportado += $monto;
    }
    // Actualizar saldo
    $pdo->exec("UPDATE socios SET saldo_total = $totalAportado WHERE id = $socioId");
    echo "Aportaciones registradas para Juan Pérez.\n";

    // 7. Crear un Préstamo para Juan Pérez
    // Préstamo de $1000 a 10% en 4 semanas. Total $1100.
    $stmtPrestamo = $pdo->prepare("INSERT INTO prestamos (socio_id, monto, monto_total_pagar, pagado, estado, plazo_semanas, fecha_inicio) VALUES (?, ?, ?, ?, ?, ?, CURDATE())");
    $stmtPrestamo->execute([$socioId, 1000, 1100, 0, 'activo', 4]);
    $prestamoId = $pdo->lastInsertId();

    // Registrar salida de dinero (Prestamo Otorgado)
    $stmtMov->execute([$socioId, 'prestamo_otorgado', 1000, "Préstamo ID $prestamoId otorgado", date('Y-m-d H:i:s')]);

    echo "Préstamo creado para Juan Pérez.\n";

    $pdo->commit();
    echo "Datos sembrados correctamente.\n";
    echo "</pre>";

} catch (Exception $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    echo "Error: " . $e->getMessage();
}
