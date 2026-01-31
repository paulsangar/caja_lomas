<?php
/**
 * Auth.php - Gestión de Autenticación
 */

class Auth {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function login($username, $password) {
        $stmt = $this->pdo->prepare("SELECT * FROM usuarios WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // Eliminar password_hash antes de devolver
            unset($user['password_hash']);
            return [
                "success" => true,
                "user" => $user,
                "token" => $this->generateToken($user)
            ];
        }

        return ["success" => false, "message" => "Credenciales incorrectas"];
    }

    private function generateToken($user) {
        // En una implementación real usaríamos una librería JWT. 
        // Para este entorno, crearemos un hash simple pero seguro con una expiración.
        $secret = "S3cr3t_K3y_C4j4_L0m4s"; // Debe cambiarse en producción
        return base64_encode(json_encode([
            "id" => $user['id'],
            "role" => $user['rol'],
            "exp" => time() + (60 * 60 * 24) // 24 horas
        ]) . "." . hash_hmac('sha256', $user['id'], $secret));
    }
}
