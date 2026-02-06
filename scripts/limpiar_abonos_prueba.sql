-- Script para LIMPIAR abonos de prueba
-- CUIDADO: Esto borrará los movimientos tipo 'aportacion'
-- Revisa primero qué hay antes de ejecutar

-- 1. VER qué abonos existen actualmente
SELECT id, socio_id, tipo, monto, descripcion, fecha_operacion 
FROM movimientos 
WHERE tipo = 'aportacion'
ORDER BY fecha_operacion DESC;

-- 2. OPCIONAL: Ver cuántos son
SELECT COUNT(*) as total_abonos
FROM movimientos 
WHERE tipo = 'aportacion';

-- 3. OPCIÓN A: Borrar TODOS los abonos (cuidado!)
-- DELETE FROM movimientos WHERE tipo = 'aportacion';

-- 4. OPCIÓN B: Borrar solo abonos de hoy (más seguro para pruebas)
-- DELETE FROM movimientos 
-- WHERE tipo = 'aportacion' 
-- AND DATE(fecha_operacion) = CURDATE();

-- 5. OPCIÓN C: Borrar abonos de Febrero y Marzo 2026 (específico)
-- DELETE FROM movimientos 
-- WHERE tipo = 'aportacion' 
-- AND descripcion LIKE '%Febrero%'
-- OR descripcion LIKE '%Marzo%';

-- IMPORTANTE: Después de borrar, verificar
-- SELECT * FROM movimientos WHERE tipo = 'aportacion';
