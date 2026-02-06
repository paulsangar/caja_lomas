<?php
// api/socios/import.php
include_once '../../config/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Error al subir el archivo']);
    exit;
}

$fileTmpPath = $_FILES['file']['tmp_name'];
$handle = fopen($fileTmpPath, 'r');

if (!$handle) {
    echo json_encode(['success' => false, 'message' => 'No se pudo abrir el archivo']);
    exit;
}

$database = new Database();
$db = $database->connect();

$createdCount = 0;
$errors = [];
$rowNumber = 0;

// Helper to get max socio ID
function getNextSocioId($conn)
{
    $query = "SELECT MAX(numero_socio) as max_id FROM usuarios";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return ($row['max_id'] ? $row['max_id'] : 0) + 1;
}

// Transaction
$db->beginTransaction();

try {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $rowNumber++;
        if ($rowNumber == 1)
            continue; // Skip header

        // Expected CSV format: Nombre, Telefono, Cupos, SaldoInicial
        // Indices: 0: Nombre, 1: Telefono, 2: Cupos, 3: SaldoInicial

        $nombre = trim($data[0] ?? '');
        $telefono = trim($data[1] ?? '');
        $cupos = intval(trim($data[2] ?? 1));
        $saldoInicial = floatval(trim($data[3] ?? 0));

        if (empty($nombre)) {
            $errors[] = "Fila $rowNumber: Nombre vacío";
            continue;
        }

        // Generate ID and Username
        $nextId = getNextSocioId($db);
        $username = "socio" . $nextId; // Default username
        $password = password_hash("123456", PASSWORD_DEFAULT); // Default password

        // Insert User
        $query = "INSERT INTO usuarios (nombre_completo, username, password, rol, telefono, cupos, numero_socio, status, fecha_ingreso) 
                  VALUES (:nombre, :username, :password, 'socio', :telefono, :cupos, :numero_socio, 'active', NOW())";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':nombre' => $nombre,
            ':username' => $username, // They can change this later or we use ID
            ':password' => $password,
            ':telefono' => $telefono,
            ':cupos' => $cupos,
            ':numero_socio' => $nextId
        ]);

        $userId = $db->lastInsertId();

        // Initial Balance (if any)
        if ($saldoInicial > 0) {
            $queryMov = "INSERT INTO movimientos (socio_id, tipo, monto, fecha_operacion, descripcion) 
                         VALUES (:socio_id, 'aportacion', :monto, NOW(), 'Saldo Inicial Importado')";
            $stmtMov = $db->prepare($queryMov);
            $stmtMov->execute([
                ':socio_id' => $userId,
                ':monto' => $saldoInicial
            ]);
        }

        $createdCount++;
    }

    $db->commit();
    echo json_encode([
        'success' => true,
        'message' => "Se importaron $createdCount socios exitosamente.",
        'errors' => $errors
    ]);

} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}

fclose($handle);
?>