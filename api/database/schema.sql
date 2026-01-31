-- Esquema de Base de Datos: Caja de Ahorro

CREATE DATABASE IF NOT EXISTS caja_ahorro;
USE caja_ahorro;

-- Tabla de Usuarios (Autenticación y Roles)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol ENUM('admin', 'socio') DEFAULT 'socio',
    email VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Socios (Información detallada)
CREATE TABLE IF NOT EXISTS socios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE,
    numero_socio VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    numero_cuenta VARCHAR(30),
    banco VARCHAR(50),
    cupos INT DEFAULT 1,
    fecha_nacimiento DATE,
    fecha_ingreso DATE NOT NULL,
    estatus ENUM('activo', 'inactivo', 'baja') DEFAULT 'activo',
    saldo_total DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de Movimientos (Aportaciones, Retiros, Pagos)
CREATE TABLE IF NOT EXISTS movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    socio_id INT NOT NULL,
    tipo ENUM('aportacion', 'retiro', 'pago_prestamo', 'ajuste') NOT NULL,
    monto DECIMAL(15, 2) NOT NULL,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    registrado_por INT, -- ID del admin que registró
    FOREIGN KEY (socio_id) REFERENCES socios(id),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
);

-- Tabla de Préstamos
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    socio_id INT NOT NULL,
    monto_solicitado DECIMAL(15, 2) NOT NULL,
    monto_aprobado DECIMAL(15, 2),
    tasa_interes DECIMAL(5, 2) DEFAULT 0.00,
    plazo_meses INT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP NULL,
    estatus ENUM('pendiente', 'aprobado', 'rechazado', 'pagado', 'en_mora') DEFAULT 'pendiente',
    saldo_pendiente DECIMAL(15, 2),
    FOREIGN KEY (socio_id) REFERENCES socios(id)
);

-- Tabla de Avisos
CREATE TABLE IF NOT EXISTS avisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vence_en DATE NULL,
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    creado_por INT,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);
