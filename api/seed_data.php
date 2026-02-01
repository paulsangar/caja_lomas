<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/db.php';

echo "<pre>";
echo "Iniciando sembrado de datos (Seed v2)...\n";

try {
    $pdo->beginTransaction();

    // 1. Limpiar tablas
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE movimientos");
    $pdo->exec("TRUNCATE TABLE prestamos");
    $pdo->exec("TRUNCATE TABLE socios");
    $pdo->exec("TRUNCATE TABLE usuarios");
    $pdo->exec("TRUNCATE TABLE avisos");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "Tablas limpiadas.\n";

    // 2. Crear Admin
    $passAdmin = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO usuarios (username, password_hash, nombre_completo, rol, email) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['admin', $passAdmin, 'Administrador Sistema', 'admin', 'admin@caja.com']);
    $adminId = $pdo->lastInsertId();
    echo "Admin creado.\n";

    // 3. Crear Socios
    $sociosData = [
        ['juanp', 'Juan Pérez', '1001', 2, 0],
        ['mariag', 'María García', '1002', 1, 0],
        ['pedrol', 'Pedro López', '1003', 3, 0],
        ['anal', 'Ana López', '1004', 1, 0],
        ['luisr', 'Luis Rodríguez', '1005', 2, 0],
        ['sofiam', 'Sofía Martínez', '1006', 1, 0],
        ['carlosv', 'Carlos Vega', '1007', 4, 0],
        ['marthas', 'Martha Sánchez', '1008', 2, 0],
        ['diegor', 'Diego Ruiz', '1009', 1, 0],
        ['luciah', 'Lucía Hernández', '1010', 3, 0],
    ];

    $stmtSocio = $pdo->prepare("INSERT INTO socios (usuario_id, numero_socio, telefono, banco, cupos, fecha_ingreso, saldo_total) VALUES (?, ?, ?, ?, ?, CURDATE(), 0)");
    $stmtMov = $pdo->prepare("INSERT INTO movimientos (socio_id, tipo, monto, descripcion, fecha_operacion) VALUES (?, ?, ?, ?, ?)");

    $sociosIds = [];

    foreach ($sociosData as $s) {
        // Usuario
        $pass = password_hash('socio123', PASSWORD_DEFAULT);
        $stmt->execute([$s[0], $pass, $s[1], 'socio', $s[0] . '@demo.com']);
        $uId = $pdo->lastInsertId();

        // Socio
        $stmtSocio->execute([$uId, $s[2], '550000' . $s[2], 'Banco Test', $s[3]]);
        $sId = $pdo->lastInsertId();
        $sociosIds[] = $sId;

        // Aportaciones (Simuladas: Juan paga todo Enero, Maria paga 2 semanas, Pedro nada)
        // Meses: Enero (0) tiene 4-5 semanas.

        $montoSemanal = $s[3] * 100;

        // Random payment logic
        $semanasPagar = rand(0, 8); // Paga entre 0 y 8 semanas (Enero y Feb)

        $totalAportado = 0;
        $meses = ['Enero', 'Febrero'];

        for ($i = 1; $i <= $semanasPagar; $i++) {
            $mesIdx = ($i <= 4) ? 0 : 1;
            $semNum = ($i <= 4) ? $i : ($i - 4);
            $mesNombre = $meses[$mesIdx];

            // Fecha aleatoria en ese mes
            $dia = $semNum * 7;
            $mesNum = $mesIdx + 1;
            $fecha = date("Y-$mesNum-$dia 12:00:00");

            $desc = "Abono correspondente a Semana $semNum de $mesNombre";

            $stmtMov->execute([$sId, 'aportacion', $montoSemanal, $desc, $fecha]);
            $totalAportado += $montoSemanal;
        }

        // Update saldo
        $pdo->exec("UPDATE socios SET saldo_total = $totalAportado WHERE id = $sId");
    }
    echo "10 Socios y aportaciones creados.\n";

    // 4. Préstamos
    $stmtPrestamo = $pdo->prepare("INSERT INTO prestamos (socio_id, monto, monto_total_pagar, pagado, estado, plazo_semanas, fecha_inicio) VALUES (?, ?, ?, ?, ?, ?, CURDATE())");

    // Prestamo Activo (Juan)
    $stmtPrestamo->execute([$sociosIds[0], 2000, 2200, 500, 'activo', 8]);

    // Prestamo Pagado (Maria)
    $stmtPrestamo->execute([$sociosIds[1], 1000, 1100, 1100, 'pagado', 4]);

    // Prestamo Nuevo (Pedro)
    $stmtPrestamo->execute([$sociosIds[2], 5000, 5500, 0, 'activo', 12]);

    echo "Préstamos creados.\n";

    // 5. Avisos
    $pdo->exec("INSERT INTO avisos (titulo, contenido, prioridad) VALUES ('Bienvenida', 'Bienvenidos al sistema v2. Recuerden pagar a tiempo.', 'alta')");

    $pdo->commit();
    echo "Datos sembrados correctamente.\n";
    echo "</pre>";

} catch (Exception $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    echo "Error: " . $e->getMessage();
}
