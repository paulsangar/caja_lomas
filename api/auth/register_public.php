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

$nombre = trim($data->nombre);
$telefono = trim($data->telefono ?? '');
$email = trim($data->email ?? '');

try {
    // Check if phone already exists
    if (!empty($telefono)) {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE telefono = ?");
        $stmt->execute([$telefono]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Este teléfono ya está registrado']);
            exit;
        }
    }

    // Get next ID for socio number (placeholder until approved)
    // Use MAX(numero_socio) from socios table, OR just use auto-increment if design allows.
    // However, original code looked at usuarios table for numero_socio? 
    // Let's stick to reading from 'socios' table for the next ID to be safe, 
    // OR if this is a pre-registration, maybe better to NOT assign a number yet?
    // But the INSERT below puts into 'usuarios' with a 'numero_socio'.
    
    // Let's use the same logic as create.php: find next available ID.
    $stmt = $pdo->query("SELECT MAX(CAST(numero_socio AS UNSIGNED)) FROM socios");
    $maxSocio = $stmt->fetchColumn();
    $nextId = ($maxSocio ?? 1000) + 1;

    // Default pending credentials
    $username = "pendiente_" . time();
    $password_hash = password_hash("temp1234", PASSWORD_DEFAULT);

    $pdo->beginTransaction();

    // Insert into USUARIOS
    $query = "INSERT INTO usuarios (nombre_completo, username, password_hash, rol, telefono, email, status, fecha_ingreso) 
              VALUES (?, ?, ?, 'socio', ?, ?, 'pending', NOW())";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$nombre, $username, $password_hash, $telefono, $email]);
    $usuario_id = $pdo->lastInsertId();

    // Insert into SOCIOS (needed for the list to see them?)
    // If we only insert into usuarios, they won't show up in the inner join of list.php!
    // We MUST insert into 'socios' as well for them to appear as 'pending'.
    
    $querySocio = "INSERT INTO socios (usuario_id, numero_socio, telefono, cupos, fecha_ingreso) VALUES (?, ?, ?, 1, CURDATE())";
    $stmtSocio = $pdo->prepare($querySocio);
    $stmtSocio->execute([$usuario_id, $nextId, $telefono]);

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Solicitud enviada. Tu ID provisional es: ' . $nextId]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}

    echo json_encode(['success' => true, 'message' => 'Solicitud enviada. Espera la confirmación del administrador.']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>