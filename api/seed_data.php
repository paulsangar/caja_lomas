<?php
header('Content-Type: text/html; charset=utf-8');
require_once __DIR__ . '/config/db.php';

echo "<h2>Generando Datos de Prueba...</h2>";

try {
    $pdo->beginTransaction();

    // 1. Limpiar tablas (opcional, para esta prueba las mantendremos)
    // $pdo->exec("SET FOREIGN_KEY_CHECKS = 0; TRUNCATE movimientos; TRUNCATE prestamos; TRUNCATE socios; TRUNCATE usuarios; SET FOREIGN_KEY_CHECKS = 1;");

    $socios_data = [
        ['username' => 'socio_101', 'nombre' => 'Juan Pérez', 'num' => '101', 'email' => 'juan@ejemplo.com', 'saldo' => 5500.50],
        ['username' => 'socio_102', 'nombre' => 'María García', 'num' => '102', 'email' => 'maria@ejemplo.com', 'saldo' => 12000.00],
        ['username' => 'socio_103', 'nombre' => 'Roberto Hernández', 'num' => '103', 'email' => 'roberto@ejemplo.com', 'saldo' => 3200.00],
        ['username' => 'socio_104', 'nombre' => 'Ana Martínez', 'num' => '104', 'email' => 'ana@ejemplo.com', 'saldo' => 7800.25],
        ['username' => 'socio_105', 'nombre' => 'Carlos López', 'num' => '105', 'email' => 'carlos@ejemplo.com', 'saldo' => 1500.00],
    ];

    $pass_hash = password_hash('123456', PASSWORD_DEFAULT);

    foreach ($socios_data as $s) {
        // Crear usuario
        $stmt = $pdo->prepare("INSERT IGNORE INTO usuarios (username, password_hash, nombre_completo, rol, email) VALUES (?, ?, ?, 'socio', ?)");
        $stmt->execute([$s['username'], $pass_hash, $s['nombre'], $s['email']]);
        $user_id = $pdo->lastInsertId();

        if ($user_id) {
            // Crear socio
            $stmt = $pdo->prepare("INSERT IGNORE INTO socios (usuario_id, numero_socio, fecha_ingreso, saldo_total) VALUES (?, ?, CURDATE(), ?)");
            $stmt->execute([$user_id, $s['num'], $s['saldo']]);
            $socio_id = $pdo->lastInsertId();

            // Agregar un movimiento inicial
            if ($socio_id) {
                $stmt = $pdo->prepare("INSERT INTO movimientos (socio_id, tipo, monto, descripcion) VALUES (?, 'aportacion', ?, 'Aportación inicial de prueba')");
                $stmt->execute([$socio_id, $s['saldo']]);
            }
        }
    }

    // 2. Un préstamo de ejemplo
    $stmt = $pdo->query("SELECT id FROM socios LIMIT 1");
    $first_socio = $stmt->fetch();
    if ($first_socio) {
        $stmt = $pdo->prepare("INSERT INTO prestamos (socio_id, monto_solicitado, monto_aprobado, plazo_meses, estatus, saldo_pendiente) VALUES (?, 5000, 5000, 12, 'aprobado', 5000)");
        $stmt->execute([$first_socio['id']]);
    }

    // 3. Un par de avisos
    $stmt = $pdo->query("SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1");
    $admin = $stmt->fetch();
    if ($admin) {
        $pdo->prepare("INSERT INTO avisos (titulo, contenido, creado_por) VALUES ('Reunión Mensual', 'La próxima reunión será el viernes a las 6:00 PM.', ?)")->execute([$admin['id']]);
        $pdo->prepare("INSERT INTO avisos (titulo, contenido, creado_por) VALUES ('Nuevas Tasas', 'Se han actualizado las tasas de interés para préstamos.', ?)")->execute([$admin['id']]);
    }

    $pdo->commit();
    echo "<h3 style='color: green;'>¡Datos generados con éxito!</h3>";
    echo "<p>Se crearon 5 socios con sus respectivos movimientos y avisos.</p>";
    echo "<a href='./'>Volver al inicio</a>";

} catch (Exception $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    echo "<h3 style='color: red;'>Error: " . $e->getMessage() . "</h3>";
}
