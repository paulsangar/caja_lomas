import React, { useState, useEffect } from 'react';
import { Calendar, Check, ChevronLeft, ChevronRight, Search, Save } from 'lucide-react';

const AbonosSemanal = ({ user }) => {
    const [socios, setSocios] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    // Controlamos el mes inicial (el primero de los 2 visibles)
    const [mesInicio, setMesInicio] = useState(new Date().getMonth());
    const [anio, setAnio] = useState(new Date().getFullYear());

    // Batch Payment State
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesesCortos = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

    const fetchDatos = async () => {
        setLoading(true);
        try {
            const [resSocios, resMovs] = await Promise.all([
                fetch('./api/socios/list.php'),
                fetch('./api/movimientos/list.php')
            ]);
            const dataSocios = await resSocios.json();
            const dataMovs = await resMovs.json();

            if (dataSocios.success) setSocios(dataSocios.data);
            if (dataMovs.success) setMovimientos(dataMovs.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatos();
        setSelectedPayments([]);
    }, [mesInicio, anio]);

    // Lógica para mostrar 2 meses
    const getTwoMonths = () => {
        const m1 = mesInicio;
        const m2 = (mesInicio + 1) % 12;
        // Si m2 es 0 (Enero) y m1 era 11 (Diciembre), implica cambio de año visual para el segundo mes, 
        // pero para simplificar la query mantenemos el año base y visualmente mostramos la continuidad.
        // Nota: La lógica de registro usa el mes real.
        return [m1, m2];
    };

    const mesesVisibles = getTwoMonths();

    // Generar columnas para 2 meses (8 semanas aprox)
    const getColumnas = () => {
        const cols = [];
        mesesVisibles.forEach(m => {
            const nombreCorto = mesesCortos[m];
            for (let i = 1; i <= 4; i++) {
                cols.push({
                    id: `${m}-${i}`, // ID único compuesto: Mes-Semana
                    label: `${nombreCorto} ${i}`,
                    mesIndex: m,
                    semanaNum: i
                });
            }
        });
        return cols;
    };

    const columnas = getColumnas();


    const checkPago = (socioId, mesIndex, semanaId) => {
        const mesNombre = nombresMeses[mesIndex];

        // Buscar en movimientos
        const match = movimientos.find(m => {
            // Comparación flexible de IDs
            const socioMatch = m.socio_id == socioId;
            const tipoMatch = m.tipo === 'aportacion';

            if (!socioMatch || !tipoMatch) return false;

            const desc = (m.descripcion || '').toLowerCase();
            const semanaStr = `semana ${semanaId}`;
            const mesStr = mesNombre.toLowerCase();

            const tieneSemanaMes = desc.includes(semanaStr) && desc.includes(mesStr);

            // DEBUG: Log solo para las primeras 3 para no saturar consola
            if (socioId <= 3) {
                console.log(`🔍 Check: Socio ${socioId}, Semana ${semanaId} ${mesNombre}`, {
                    descripcion: m.descripcion,
                    match: tieneSemanaMes,
                    buscando: `"${semanaStr}" + "${mesStr}"`
                });
            }

            return tieneSemanaMes;
        });

        return !!match;
    };

    const isSelected = (socioId, colId) => selectedPayments.includes(`${socioId}|${colId}`);

    // Lógica secuencial estricta (ahora a través de meses)
    const puedePagar = (socioId, targetColIndex) => {
        if (targetColIndex === 0) return true; // La primera columna visible siempre se puede si no está pagada (simplificación)

        // Verificar la columna inmediatamente anterior
        const prevCol = columnas[targetColIndex - 1];
        const prevColId = prevCol.id;

        const pagadaAnterior = checkPago(socioId, prevCol.mesIndex, prevCol.semanaNum);
        const seleccionadaAnterior = isSelected(socioId, prevColId);

        return pagadaAnterior || seleccionadaAnterior;
    };

    const toggleSelection = (socioId, colData, colIndex) => {
        const { mesIndex, semanaNum, id: colId } = colData;

        const pagado = checkPago(socioId, mesIndex, semanaNum);
        if (pagado) return;

        const key = `${socioId}|${colId}`;
        const currentlySelected = selectedPayments.includes(key);

        if (!currentlySelected) {
            // Validar secuencia
            if (!puedePagar(socioId, colIndex)) return;
            setSelectedPayments(prev => [...prev, key]);
        } else {
            // Deseleccionar: Remover esta y todas las futuras seleccionadas para este socio
            const newSelection = selectedPayments.filter(k => {
                const [sId, cIdRequest] = k.split('|');
                if (sId != socioId) return true;

                // Encontrar índice de la columna a remover vs la actual en el loop
                const colIndexToRemove = columnas.findIndex(c => c.id === cIdRequest);
                // Mantener solo si es ANTERIOR a la que estamos deseleccionando
                return colIndexToRemove < colIndex;
            });
            setSelectedPayments(newSelection);
        }
    };

    const handleBatchPayment = async () => {
        if (selectedPayments.length === 0) return;

        const confirmacion = window.confirm(`¿Registrar ${selectedPayments.length} abonos seleccionados?`);
        if (!confirmacion) return;

        setIsSaving(true);
        let successCount = 0;
        let errors = [];

        // Ordenar pagos por la secuencia de columnas para mantener lógica cronológica
        const pagosOrdenados = [...selectedPayments].sort((a, b) => {
            const [, colIdA] = a.split('|');
            const [, colIdB] = b.split('|');
            const idxA = columnas.findIndex(c => c.id === colIdA);
            const idxB = columnas.findIndex(c => c.id === colIdB);
            return idxA - idxB;
        });

        console.log('🔹 Procesando pagos:', pagosOrdenados.length);

        for (const key of pagosOrdenados) {
            const [socioId, colId] = key.split('|');
            const colData = columnas.find(c => c.id === colId);
            const socio = socios.find(s => s.id == socioId);

            if (!socio || !colData) {
                console.warn('⚠️ Socio o columna no encontrada:', { socioId, colId });
                continue;
            }

            const cupos = parseInt(socio.cupos) || 1;
            const monto = cupos * 100;
            const descripcion = `Abono correspondiente a Semana ${colData.semanaNum} de ${nombresMeses[colData.mesIndex]}`;

            console.log(`💰 Enviando pago para ${socio.nombre_completo}:`, { monto, cupos, descripcion });

            try {
                const response = await fetch('./api/movimientos/create.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        socio_id: socio.id,
                        tipo: 'aportacion',
                        monto: monto,
                        descripcion: descripcion
                    })
                });

                const data = await response.json();
                console.log(`📨 Respuesta API para ${socio.nombre_completo}:`, data);

                if (data.success) {
                    successCount++;
                } else {
                    errors.push(`${socio.nombre_completo}: ${data.message}`);
                }
            } catch (e) {
                console.error("❌ Error paying " + key, e);
                errors.push(`${socio.nombre_completo}: Error de conexión`);
            }
        }

        console.log('✅ Pagos procesados:', successCount, '| Errores:', errors.length);

        if (errors.length > 0) {
            alert(`Procesados: ${successCount}\nErrores:\n${errors.join('\n')}`);
        } else {
            alert(`¡Éxito! Se registraron ${successCount} abonos y ya aparecen en el historial.`);
        }

        setSelectedPayments([]);
        // IMPORTANTE: Limpiar el estado de movimientos local para forzar que checkPago use los nuevos datos
        setMovimientos([]);
        console.log('🔄 Recargando datos...');
        await fetchDatos();
        console.log('✅ Datos recargados');
        console.log('📊 Total movimientos cargados:', movimientos.length);
        console.log('🔹 Aportaciones:', movimientos.filter(m => m.tipo === 'aportacion').length);

        // Logging de muestra (primeros 3)
        movimientos.filter(m => m.tipo === 'aportacion').slice(0, 3).forEach(m => {
            console.log('  📝', m.socio_id, '-', m.descripcion);
        });

        setIsSaving(false);
    };

    const filteredSocios = socios.filter(s => {
        // Filtro de seguridad: Si no es admin, solo ver su propio registro
        if (user.rol !== 'admin') {
            console.log('🔍 Verificando socio:', s.nombre_completo, '| usuario_id:', s.usuario_id, '| user.id:', user.id, '| Match:', parseInt(s.usuario_id) === parseInt(user.id));
            // FIX: Usar parseInt para comparación numérica estricta
            if (parseInt(s.usuario_id) !== parseInt(user.id)) {
                return false;
            }
        }
        return (
            s.nombre_completo.toLowerCase().includes(filterName.toLowerCase()) ||
            (s.numero_socio && s.numero_socio.toString().includes(filterName))
        );
    });

    console.log(`📋 Socios filtrados: ${filteredSocios.length} de ${socios.length} total`);

    // VISTA SIMPLIFICADA PARA SOCIOS
    if (user.rol !== 'admin' && filteredSocios.length > 0) {
        const miSocio = filteredSocios[0];
        const cupos = parseInt(miSocio.cupos) || 1;
        const montoPorSemana = cupos * 100;

        return (
            <div className="animate-fade-in">
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Calendar color="var(--primary)" /> Mis Abonos Semanales
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {miSocio.nombre_completo} • {cupos} cupo{cupos > 1 ? 's' : ''} • ${montoPorSemana}/semana
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                    {columnas.map((col, idx) => {
                        const pagado = checkPago(miSocio.id, col.mesIndex, col.semanaNum);
                        const key = `${miSocio.id}|${col.id}`;
                        const seleccionado = selectedPayments.includes(key);
                        const puedeMarcar = !pagado && puedePagar(miSocio.id, idx);

                        return (
                            <div
                                key={col.id}
                                className="glass-panel"
                                style={{
                                    padding: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: pagado ? '#f0fdf4' : (seleccionado ? '#eff6ff' : 'white'),
                                    border: `2px solid ${pagado ? '#86efac' : (seleccionado ? 'var(--primary)' : 'var(--border)')}`,
                                    cursor: puedeMarcar ? 'pointer' : 'default',
                                    opacity: puedeMarcar ? 1 : 0.6
                                }}
                                onClick={() => puedeMarcar && toggleSelection(miSocio.id, col, idx)}
                            >
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                        Semana {col.semanaNum} • {nombresMeses[col.mesIndex]}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {col.fechaInicio} - {col.fechaFin}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: pagado ? '#16a34a' : 'var(--primary)' }}>
                                            ${montoPorSemana}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {pagado ? '✓ Pagado' : (seleccionado ? 'Seleccionado' : (puedeMarcar ? 'Pendiente' : 'Bloqueado'))}
                                        </div>
                                    </div>
                                    {pagado ? (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: 'white', fontSize: '1.2rem' }}>✓</span>
                                        </div>
                                    ) : seleccionado ? (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: 'white', fontSize: '1.2rem' }}>✓</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedPayments.length > 0 && (
                    <div style={{ position: 'sticky', bottom: '20px', marginTop: '20px' }}>
                        <button
                            onClick={handleBatchPayment}
                            disabled={isSaving}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {isSaving ? 'Procesando...' : `💰 Confirmar ${selectedPayments.length} Pago${selectedPayments.length > 1 ? 's' : ''} ($${selectedPayments.length * montoPorSemana})`}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // VISTA COMPLETA PARA ADMIN (Grid bimestral)

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar color="var(--primary)" /> Control de Abonos (Bimestral)
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vista expandida: 2 Meses</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    {/* Navegación Mes */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: 'auto' }}>
                        <button onClick={() => setMesInicio(m => m === 0 ? 11 : m - 1)} className="btn-secondary" style={{ padding: '5px 10px' }}><ChevronLeft size={16} /></button>
                        <span style={{ fontWeight: '700', minWidth: '180px', textAlign: 'center', fontSize: '1rem' }}>
                            {nombresMeses[mesesVisibles[0]]} - {nombresMeses[mesesVisibles[1]]}
                        </span>
                        <button onClick={() => setMesInicio(m => m === 11 ? 0 : m + 1)} className="btn-secondary" style={{ padding: '5px 10px' }}><ChevronRight size={16} /></button>
                    </div>

                    <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar socio..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            style={{
                                padding: '8px 8px 8px 32px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                width: '100%',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    {user.rol === 'admin' && selectedPayments.length > 0 && (
                        <button
                            onClick={handleBatchPayment}
                            disabled={isSaving}
                            className="btn-primary"
                            style={{ padding: '8px 15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {isSaving ? 'Guardando...' : <><Save size={16} /> Guardar ({selectedPayments.length})</>}
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div className="table-container" style={{ maxHeight: '65vh', overflowY: 'auto', position: 'relative' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 20, background: '#f8fafc' }}>
                            <tr>
                                <th style={{
                                    position: 'sticky', left: 0, zIndex: 30, background: '#f8fafc',
                                    borderBottom: '1px solid var(--border)',
                                    borderRight: '1px solid var(--border)',
                                    padding: '10px', textAlign: 'left', minWidth: '160px',
                                    fontSize: '0.75rem'
                                }}>SOCIO</th>
                                {/* Generamos cabeceras dinámicas para las 8 columnas (2 meses) */}
                                {columnas.map(col => (
                                    <th key={col.id} style={{
                                        textAlign: 'center', padding: '6px 2px',
                                        borderBottom: '1px solid var(--border)', width: '60px',
                                        borderRight: col.semanaNum === 4 ? '1px solid #e2e8f0' : 'none' // Separador visual entre meses
                                    }}>
                                        <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.7rem' }}>{col.label}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={columnas.length + 1} style={{ textAlign: 'center', padding: '40px' }}>Cargando matriz...</td></tr>
                            ) : filteredSocios.length === 0 ? (
                                <tr><td colSpan={columnas.length + 1} style={{ textAlign: 'center', padding: '40px' }}>No hay socios coincidentes.</td></tr>
                            ) : (
                                filteredSocios.map(socio => {
                                    return (
                                        <tr key={socio.id} className="table-row-hover">
                                            <td style={{
                                                fontWeight: '500', padding: '10px 15px',
                                                position: 'sticky', left: 0, background: 'white', zIndex: 10,
                                                borderRight: '1px solid var(--border)', borderBottom: '1px solid #f1f5f9'
                                            }}>
                                                <div style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '0.85rem' }}>{socio.nombre_completo}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '5px' }}>
                                                    <span>{socio.numero_socio}</span>
                                                    <span>•</span>
                                                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                                        {socio.cupos || 1} cupos (${(socio.cupos || 1) * 100}/sem)
                                                    </span>
                                                </div>
                                            </td>

                                            {columnas.map((col, idx) => {
                                                const pagado = checkPago(socio.id, col.mesIndex, col.semanaNum);
                                                const habilitado = !pagado && puedePagar(socio.id, idx);
                                                const selected = isSelected(socio.id, col.id);

                                                return (
                                                    <td key={col.id} style={{
                                                        textAlign: 'center', padding: '6px',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        borderRight: col.semanaNum === 4 ? '1px solid #f1f5f9' : 'none'
                                                    }}>
                                                        {pagado ? (
                                                            <div style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center' }}>
                                                                <Check size={18} strokeWidth={4} />
                                                            </div>
                                                        ) : (
                                                            user.rol === 'admin' ? (
                                                                <div
                                                                    onClick={() => toggleSelection(socio.id, col, idx)}
                                                                    style={{
                                                                        width: '20px', height: '20px',
                                                                        border: selected ? '2px solid var(--primary)' : '2px solid #cbd5e1',
                                                                        borderRadius: '4px',
                                                                        margin: '0 auto',
                                                                        cursor: habilitado ? 'pointer' : 'not-allowed',
                                                                        background: selected ? 'var(--primary)' : (habilitado ? 'white' : '#f8fafc'),
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        transition: 'all 0.1s',
                                                                        opacity: habilitado || selected ? 1 : 0.4
                                                                    }}
                                                                >
                                                                    {selected && <Check size={12} color="white" />}
                                                                </div>
                                                            ) : (
                                                                <div style={{ width: '20px', height: '20px', background: '#f1f5f9', borderRadius: '4px', margin: '0 auto' }}></div>
                                                            )
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AbonosSemanal;
