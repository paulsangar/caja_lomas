<?php
/**
 * API Principal - Caja de Ahorro
 * Configurada para Hosting Compartido (HostGator)
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de errores para desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Carga de configuración (base de datos, etc)
// require_once './config/db.php';

$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Router simple
$response = [
    "status" => "success",
    "message" => "API Caja de Ahorro activa",
    "timestamp" => date("c")
];

echo json_encode($response);
