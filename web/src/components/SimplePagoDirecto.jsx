import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';

/**
 * COMPONENTE SIMPLE Y DIRECTO PARA PAGOS
 * Enfoque: Formulario básico sin complejidad
 */
const SimplePagoDirecto = ({ user }) => {
    const [miSocio, setMiSocio] = useState(null);
    const [semanas, setSemanas] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [semanaSeleccionada, setSemanaSeleccionada] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // 1. Cargar mi socio
            const resSocios = await fetch('./api/socios/list.php');
            const dataSocios = await resSocios.json();
            if (dataSocios.success) {
                const yo = dataSocios.data.find(s => parseInt(s.usuario_id) === parseInt(user.id));
                setMiSocio(yo);
                console.log('👤 Mi socio:', yo);

                if (yo) {
                    // 2. Cargar mis movimientos
                    const resMovs = await fetch(`./api/movimientos/list.php?usuario_id=${user.id}`);
                    const dataMovs = await resMovs.json();
                    if (dataMovs.success) {
                        const aportaciones = dataMovs.data.filter(m => m.tipo === 'aportacion');
                        setPagos(aportaciones);
                        console.log('💰 Mis pagos:', aportaciones);
                    }

                    // 3. Generar semanas disponibles
                    generarSemanas();
                }
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            alert('Error al cargar información');
        } finally {
            setLoading(false);
        }
    };

    const generarSemanas = () => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const hoy = new Date();
        const semanasList = [];

        // Generar últimas 4 semanas + próximas 8 semanas
        for (let i = -4; i < 8; i++) {
            const fecha = new Date();
            fecha.setDate(hoy.getDate() + (i * 7));
            const mes = meses[fecha.getMonth()];
            const semanaDelMes = Math.ceil(fecha.getDate() / 7);

            semanasList.push({
                id: `${fecha.getMonth()}-${semanaDelMes}`,
                label: `Semana ${semanaDelMes} de ${mes}`,
                mesIndex: fecha.getMonth(),
                semanaNum: semanaDelMes,
                fecha: fecha.toISOString().split('T')[0]
            });
        }

        setSemanas(semanasList);
    };

    const handlePagar = async () => {
        if (!semanaSeleccionada || !miSocio) {
            alert('Por favor selecciona una semana');
            return;
        }

        const semana = semanas.find(s => s.id === semanaSeleccionada);
        const cupos = parseInt(miSocio.cupos) || 1;
        const monto = cupos * 100;

        const confirmacion = window.confirm(
            `¿Confirmar pago de $${monto}?\\n\\nSemana: ${semana.label}\\nCupos: ${cupos}`
        );

        if (!confirmacion) return;

        setProcesando(true);
        console.log('💳 Procesando pago:', { semana, monto });

        try {
            const response = await fetch('./api/movimientos/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    socio_id: miSocio.id,
                    tipo: 'aportacion',
                    monto: monto,
                    descripcion: `Abono - ${semana.label}`
                })
            });

            console.log('📡 Status:', response.status);
            const data = await response.json();
            console.log('📨 Respuesta:', data);

            if (data.success) {
                alert('✅ ¡Pago registrado exitosamente!');
                setSemanaSeleccionada('');
                await cargarDatos(); // Recargar
            } else {
                alert('❌ Error: ' + (data.message || 'No se pudo procesar el pago'));
            }
        } catch (error) {
            console.error('💥 Error:', error);
            alert('Error de conexión. Por favor intenta de nuevo.');
        } finally {
            setProcesando(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;
    }

    if (!miSocio) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--danger)' }}>No se encontró tu información de socio.</p>
            </div>
        );
    }

    const cupos = parseInt(miSocio.cupos) || 1;
    const montoPorSemana = cupos * 100;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <DollarSign color="var(--primary)" /> Registro de Pago Semanal
                </h2>
                <div style={{
                    background: '#eff6ff',
                    padding: '15px',
                    borderRadius: '12px',
                    borderLeft: '4px solid var(--primary)'
                }}>
                    <p style={{ margin: 0, fontWeight: '500' }}>{miSocio.nombre_completo}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {cupos} cupo{cupos > 1 ? 's' : ''} • ${montoPorSemana} por semana
                    </p>
                </div>
            </div>

            {/* Formulario de Pago */}
            <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Registrar Nuevo Pago</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                            <Calendar size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                            Selecciona la Semana
                        </label>
                        <select
                            value={semanaSeleccionada}
                            onChange={(e) => setSemanaSeleccionada(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '2px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="">-- Seleccionar semana --</option>
                            {semanas.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{
                        background: '#f8fafc',
                        padding: '15px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '500' }}>Monto a Pagar:</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            ${montoPorSemana}
                        </span>
                    </div>

                    <button
                        onClick={handlePagar}
                        disabled={!semanaSeleccionada || procesando}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '15px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            opacity: (!semanaSeleccionada || procesando) ? 0.5 : 1
                        }}
                    >
                        {procesando ? '⏳ Procesando...' : '💰 Confirmar Pago'}
                    </button>
                </div>
            </div>

            {/* Historial de Pagos */}
            <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
                    <CheckCircle size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Historial de Pagos
                </h3>

                {pagos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <Clock size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                        <p>No tienes pagos registrados aún</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {pagos.map(pago => (
                            <div
                                key={pago.id}
                                style={{
                                    background: '#f0fdf4',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid #86efac'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: '600' }}>{pago.descripcion}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {new Date(pago.fecha_operacion).toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>
                                    ${parseFloat(pago.monto).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimplePagoDirecto;
