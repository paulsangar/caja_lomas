import React, { useState, useEffect } from 'react';
import { Calendar, Check, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

/**
 * GRID SEMANAL SIMPLIFICADO
 * - 1 mes, 4 semanas
 * - Click = guardar INMEDIATAMENTE (no batch)
 * - Sin estados temporales complejos
 */
const GridSemanalSimple = ({ user }) => {
    const [socios, setSocios] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // { socioId, semana }
    const [mesActual, setMesActual] = useState(new Date().getMonth());
    const [anioActual, setAnioActual] = useState(new Date().getFullYear());

    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    useEffect(() => {
        cargarDatos();
    }, [mesActual, anioActual]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [resSocios, resMovs] = await Promise.all([
                fetch('./api/socios/list.php?t=' + Date.now(), { cache: 'no-store' }),
                fetch('./api/movimientos/list.php?t=' + Date.now(), { cache: 'no-store' })
            ]);
            const dataSocios = await resSocios.json();
            const dataMovs = await resMovs.json();

            if (dataSocios.success) setSocios(dataSocios.data);
            if (dataMovs.success) {
                setMovimientos(dataMovs.data.filter(m => m.tipo === 'aportacion'));
                console.log('✅ Cargados', dataMovs.data.filter(m => m.tipo === 'aportacion').length, 'abonos');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const estaPagado = (socioId, semana) => {
        const mesNombre = nombresMeses[mesActual];
        const buscar = `semana ${semana} de ${mesNombre.toLowerCase()}`;

        const encontrado = movimientos.some(m =>
            m.socio_id == socioId &&
            m.descripcion.toLowerCase().includes(buscar)
        );

        return encontrado;
    };

    const handleClick = async (socio, semana) => {
        const pagado = estaPagado(socio.id, semana);
        const mesNombre = nombresMeses[mesActual];
        const cupos = parseInt(socio.cupos) || 1;
        const monto = cupos * 100;

        // Si ya está pagado, ELIMINAR
        if (pagado) {
            const confirmar = window.confirm(
                `¿ELIMINAR abono de ${socio.nombre_completo}?\n\n` +
                `Semana ${semana} de ${mesNombre}\n` +
                `Monto: $${monto}\n\n` +
                `Esto revertirá el saldo del socio.`
            );

            if (!confirmar) return;

            // Eliminar
            setSaving({ socioId: socio.id, semana });
            console.log('🗑️ Eliminando abono:', { socio: socio.nombre_completo, semana });

            try {
                const descripcion = `Semana ${semana} de ${mesNombre}`;

                const response = await fetch('./api/movimientos/delete.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        socio_id: socio.id,
                        descripcion: descripcion
                    })
                });

                const data = await response.json();
                console.log('📨 Respuesta DELETE:', data);

                if (data.success) {
                    console.log('✅ Eliminado exitoso, recargando...');
                    await cargarDatos();
                } else {
                    alert('❌ Error al eliminar: ' + (data.message || 'Error desconocido'));
                }
            } catch (error) {
                console.error('💥 Error:', error);
                alert('Error de conexión al eliminar');
            } finally {
                setSaving(null);
            }

            return;
        }

        // Si NO está pagado, AGREGAR
        const confirmar = window.confirm(
            `Registrar abono para ${socio.nombre_completo}?\n\n` +
            `Semana ${semana} de ${mesNombre}\n` +
            `Monto: $${monto}`
        );

        if (!confirmar) return;

        // Guardar
        setSaving({ socioId: socio.id, semana });
        console.log('💾 Guardando abono:', { socio: socio.nombre_completo, semana, monto });

        try {
            const response = await fetch('./api/movimientos/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    socio_id: socio.id,
                    tipo: 'aportacion',
                    monto: monto,
                    descripcion: `Abono - Semana ${semana} de ${mesNombre}`
                })
            });

            const data = await response.json();
            console.log('📨 Respuesta:', data);

            if (data.success) {
                console.log('✅ Guardado exitoso, recargando...');
                // Recargar datos
                await cargarDatos();
            } else {
                alert('❌ Error: ' + (data.message || 'No se pudo guardar'));
            }
        } catch (error) {
            console.error('💥 Error:', error);
            alert('Error de conexión');
        } finally {
            setSaving(null);
        }
    };

    const cambiarMes = (direccion) => {
        let nuevoMes = mesActual + direccion;
        let nuevoAnio = anioActual;

        if (nuevoMes > 11) {
            nuevoMes = 0;
            nuevoAnio++;
        } else if (nuevoMes < 0) {
            nuevoMes = 11;
            nuevoAnio--;
        }

        setMesActual(nuevoMes);
        setAnioActual(nuevoAnio);
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <Loader className="spin" size={48} style={{ color: 'var(--primary)' }} />
                <p style={{ marginTop: '15px' }}>Cargando...</p>
            </div>
        );
    }

    const getRangoFechas = (semana) => {
        const diasPorSemana = 7;
        const inicioDia = (semana - 1) * diasPorSemana + 1;
        let finDia = semana * diasPorSemana;

        // Ajuste para el fin de mes
        // Enero (31), Febrero (28/29), etc.
        const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();

        if (semana === 4) {
            finDia = diasEnMes; // La semana 4 llega hasta el final
        }

        const mesCorto = nombresMeses[mesActual].substring(0, 3);
        return `${inicioDia}-${finDia} ${mesCorto}`;
    };

    return (
        <div className="animate-fade-in">
            {/* Header - Sin cambios */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar color="var(--primary)" /> Control de Abonos
                </h2>

                {/* Navegación mes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => cambiarMes(-1)} style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '2px solid var(--primary)',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <ChevronLeft size={20} />
                    </button>

                    <h3 style={{ margin: 0, fontSize: '1.2rem', minWidth: '150px', textAlign: 'center' }}>
                        {nombresMeses[mesActual]} {anioActual}
                    </h3>

                    <button onClick={() => cambiarMes(1)} style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '2px solid var(--primary)',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600' }}>
                                Socio
                            </th>
                            {[1, 2, 3, 4].map(sem => (
                                <th key={sem} style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <div>Semana {sem}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                                        {getRangoFechas(sem)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {socios.map(socio => (
                            <tr key={socio.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                        {socio.nombre_completo}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        #{socio.numero_socio} • {socio.cupos} cupo{socio.cupos > 1 ? 's' : ''}
                                    </div>
                                </td>
                                {[1, 2, 3, 4].map(semana => {
                                    const pagado = estaPagado(socio.id, semana);
                                    const guardando = saving?.socioId === socio.id && saving?.semana === semana;

                                    return (
                                        <td key={semana} style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleClick(socio, semana)}
                                                disabled={guardando}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    border: pagado ? '2px solid #86efac' : '2px solid var(--border)',
                                                    background: pagado ? '#f0fdf4' : 'white',
                                                    cursor: guardando ? 'wait' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                    opacity: guardando ? 0.5 : 1
                                                }}
                                                title={pagado ? 'Click para eliminar' : 'Click para registrar'}
                                            >
                                                {guardando ? (
                                                    <Loader size={20} className="spin" style={{ color: 'var(--primary)' }} />
                                                ) : pagado ? (
                                                    <Check size={20} style={{ color: '#16a34a' }} />
                                                ) : null}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {socios.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No hay socios registrados
                    </div>
                )}
            </div>
        </div>
    );
};

export default GridSemanalSimple;
