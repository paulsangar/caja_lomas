<?php
/**
 * login.php - Endpoint para inicio de sesión
 */

require_once '../config/db.php';
require_once './Auth.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $auth = new Auth($pdo);
    $result = $auth->login($data->username, $data->password);

    if ($result['success']) {
        http_response_code(200);
    } else {
        http_response_code(401);
    }
    echo json_encode($result);
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Faltan datos de acceso"]);
}
