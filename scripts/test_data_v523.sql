-- Limpiar datos de prueba anteriores (Opcional, usar con precaución)
-- DELETE FROM abonos;
-- DELETE FROM prestamos;
-- DELETE FROM movimientos;
-- DELETE FROM socios WHERE numero_socio > 100;
-- DELETE FROM usuarios WHERE numero_socio > 100;

-- 1. Crear Socios de Prueba (Usuarios + Socios)
-- Password '123456' hashed (ejemplo)
INSERT INTO mp_usuarios (nombre_completo, username, password, rol, telefono, email, numero_socio, status, fecha_ingreso) VALUES
('Ana García', 'ana.garcia', '$2y$10$ExampleHash...', 'socio', '5512345678', 'ana@test.com', 101, 'active', NOW()),
('Carlos López', 'carlos.lopez', '$2y$10$ExampleHash...', 'socio', '5587654321', 'carlos@test.com', 102, 'active', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
('Maria Rodriguez', 'maria.r', '$2y$10$ExampleHash...', 'socio', '5511223344', 'maria@test.com', 103, 'active', DATE_SUB(NOW(), INTERVAL 1 YEAR));

INSERT INTO socios (usuario_id, numero_socio, saldo_total, cupos) 
SELECT id, numero_socio, 0, 1 FROM mp_usuarios WHERE numero_socio IN (101, 102, 103);

-- 2. Asignar Saldos Iniciales / Ahorros
INSERT INTO movimientos (socio_id, tipo, monto, fecha_operacion, descripcion)
SELECT id, 'aportacion', 5000, NOW(), 'Ahorro Inicial' FROM socios WHERE numero_socio = 101;

INSERT INTO movimientos (socio_id, tipo, monto, fecha_operacion, descripcion)
SELECT id, 'aportacion', 1200, NOW(), 'Ahorro Acumulado' FROM socios WHERE numero_socio = 102;

UPDATE socios SET saldo_total = 5000 WHERE numero_socio = 101;
UPDATE socios SET saldo_total = 1200 WHERE numero_socio = 102;

-- 3. Crear Préstamos (Uno al corriente, uno atrasado)
-- Prestamo Activo para Carlos (102)
INSERT INTO prestamos (socio_id, monto, monto_pendiente, fecha_inicio, fecha_vencimiento, estado, tasa_interes)
SELECT id, 2000, 1500, DATE_SUB(NOW(), INTERVAL 1 MONTH), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'pendiente', 5 
FROM socios WHERE numero_socio = 102;

-- Prestamo "Atrasado" simulado (no realmente vencido en DB, pero visualmente activo) para Maria (103)
INSERT INTO prestamos (socio_id, monto, monto_pendiente, fecha_inicio, fecha_vencimiento, estado, tasa_interes)
SELECT id, 5000, 5000, DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 DAY), 'vencido', 10
FROM socios WHERE numero_socio = 103;

-- 4. Registrar Abonos (Carlos pagó hace 1 semana, Ana pagó hoy)
INSERT INTO abonos (socio_id, monto, fecha_pago, semana_correspondiente, tipo)
SELECT id, 200, NOW(), WEEK(NOW()), 'ahorro' 
FROM socios WHERE numero_socio = 101; -- Ana al corriente

INSERT INTO abonos (socio_id, monto, fecha_pago, semana_correspondiente, tipo)
SELECT id, 200, DATE_SUB(NOW(), INTERVAL 10 DAY), WEEK(NOW()) - 1, 'ahorro' 
FROM socios WHERE numero_socio = 102; -- Carlos pagó la semana pasada (atrasado esta semana)

-- Maria no tiene abonos recientes (Atrasada)
