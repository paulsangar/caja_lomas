<?php
// api/auth/register_public.php
include_once '../../config/db.php';
header('Content-Type: application/json');

// Allow CORS for public access if needed (or basic same-origin)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->nombre) || empty($data->nombre)) {
    echo json_encode(['success' => false, 'message' => 'El nombre es obligatorio']);
    exit;
}

$nombre = trim($data->nombre);
$telefono = trim($data->telefono ?? '');
$email = trim($data->email ?? '');

$database = new Database();
$db = $database->connect();

try {
    // Check if phone already exists
    if (!empty($telefono)) {
        $check = $db->prepare("SELECT id FROM usuarios WHERE telefono = :telefono");
        $check->execute([':telefono' => $telefono]);
        if ($check->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Este teléfono ya está registrado']);
            exit;
        }
    }

    // Get next ID for socio number (placeholder until approved)
    $queryMax = "SELECT MAX(numero_socio) as max_id FROM usuarios";
    $stmtMax = $db->prepare($queryMax);
    $stmtMax->execute();
    $row = $stmtMax->fetch(PDO::FETCH_ASSOC);
    $nextId = ($row['max_id'] ? $row['max_id'] : 0) + 1;

    // Default pending credentials
    $username = "pendiente_" . time();
    $password = password_hash("temp1234", PASSWORD_DEFAULT);

    $query = "INSERT INTO usuarios (nombre_completo, username, password, rol, telefono, email, numero_socio, status, fecha_ingreso) 
              VALUES (:nombre, :username, :password, 'socio', :telefono, :email, :numero_socio, 'pending', NOW())";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':nombre' => $nombre,
        ':username' => $username,
        ':password' => $password,
        ':telefono' => $telefono,
        ':email' => $email,
        ':numero_socio' => $nextId
    ]);

    echo json_encode(['success' => true, 'message' => 'Solicitud enviada. Espera la confirmación del administrador.']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>