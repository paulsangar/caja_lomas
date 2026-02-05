import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Check, AlertCircle, Loader } from 'lucide-react';

/**
 * PAGO ULTRA RÁPIDO - UN SOLO BOTÓN
 * La forma más simple posible de registrar un abono
 */
const PagoRapido = ({ user }) => {
    const [miSocio, setMiSocio] = useState(null);
    const [pagosRecientes, setPagosRecientes] = useState([]);
    const [procesando, setProcesando] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            console.log(' Cargando datos para usuario:', user.id);

            // Cargar socio
            const resSocios = await fetch('./api/socios/list.php');
            const dataSocios = await resSocios.json();

            if (!dataSocios.success) {
                throw new Error('No se pudieron cargar los socios');
            }

            const yo = dataSocios.data.find(s => parseInt(s.usuario_id) === parseInt(user.id));

            if (!yo) {
                setMensaje({ tipo: 'error', texto: 'No se encontró tu información de socio' });
                setLoading(false);
                return;
            }

            setMiSocio(yo);
            console.log('✅ Socio encontrado:', yo.nombre_completo, '| ID:', yo.id);

            // Cargar pagos recientes (últimos 10)
            const resMovs = await fetch(`./api/movimientos/list.php?usuario_id=${user.id}`);
            const dataMovs = await resMovs.json();

            if (dataMovs.success) {
                const aportaciones = dataMovs.data
                    .filter(m => m.tipo === 'aportacion')
                    .slice(0, 10); // Últimos 10
                setPagosRecientes(aportaciones);
                console.log(`💰 Últimos ${aportaciones.length} pagos cargados`);
            }

        } catch (error) {
            console.error('💥 Error:', error);
            setMensaje({ tipo: 'error', texto: 'Error al cargar datos: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const pagarAhora = async () => {
        if (!miSocio) {
            alert('No se encontró información del socio');
            return;
        }

        const cupos = parseInt(miSocio.cupos) || 1;
        const monto = cupos * 100;
        const hoy = new Date();
        const fechaStr = hoy.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

        const confirmar = window.confirm(
            `¿Registrar abono semanal?\\n\\n` +
            `Socio: ${miSocio.nombre_completo}\\n` +
            `Monto: $${monto}\\n` +
            `Fecha: ${fechaStr}`
        );

        if (!confirmar) return;

        setProcesando(true);
        setMensaje({ tipo: '', texto: '' });

        console.log('🚀 Iniciando pago...');
        console.log('   Socio ID:', miSocio.id);
        console.log('   Monto:', monto);
        console.log('   Tipo: aportacion');

        try {
            const payload = {
                socio_id: miSocio.id,
                tipo: 'aportacion',
                monto: monto,
                descripcion: `Abono semanal - ${fechaStr}`
            };

            console.log('📤 Enviando:', JSON.stringify(payload, null, 2));

            const response = await fetch('./api/movimientos/create.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('📡 HTTP Status:', response.status);

            // Intentar leer la respuesta
            let data;
            const textResponse = await response.text();
            console.log('📨 Respuesta cruda:', textResponse);

            try {
                data = JSON.parse(textResponse);
                console.log('📊 Respuesta JSON:', data);
            } catch (e) {
                console.error('❌ Error parseando JSON:', e);
                throw new Error('Respuesta del servidor no es JSON válido: ' + textResponse);
            }

            if (data.success) {
                console.log('✅ ÉXITO - Pago registrado');
                setMensaje({
                    tipo: 'success',
                    texto: `¡Pago de $${monto} registrado exitosamente!`
                });

                // Recargar datos después de 1 segundo
                setTimeout(() => {
                    cargarDatos();
                }, 1000);
            } else {
                throw new Error(data.message || 'Error desconocido al guardar');
            }

        } catch (error) {
            console.error('💥 ERROR:', error);
            setMensaje({
                tipo: 'error',
                texto: 'Error: ' + error.message
            });
        } finally {
            setProcesando(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 20px',
                gap: '15px'
            }}>
                <Loader size={48} className="spin" style={{ color: 'var(--primary)' }} />
                <p style={{ color: 'var(--text-muted)' }}>Cargando información...</p>
            </div>
        );
    }

    if (!miSocio) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <AlertCircle size={64} style={{ color: 'var(--danger)', margin: '0 auto 20px' }} />
                <h2 style={{ color: 'var(--danger)', marginBottom: '10px' }}>Error</h2>
                <p>{mensaje.texto || 'No se encontró tu información de socio'}</p>
            </div>
        );
    }

    const cupos = parseInt(miSocio.cupos) || 1;
    const montoPorSemana = cupos * 100;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Mensaje de estado */}
            {mensaje.texto && (
                <div style={{
                    padding: '15px 20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    background: mensaje.tipo === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `2px solid ${mensaje.tipo === 'success' ? '#86efac' : '#fecaca'}`,
                    color: mensaje.tipo === 'success' ? '#16a34a' : '#dc2626',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    {mensaje.tipo === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    {mensaje.texto}
                </div>
            )}

            {/* Panel principal */}
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <DollarSign
                    size={64}
                    style={{
                        color: 'var(--primary)',
                        margin: '0 auto 20px',
                        display: 'block'
                    }}
                />

                <h2 style={{ marginBottom: '10px', fontSize: '1.8rem' }}>Pago Rápido</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                    {miSocio.nombre_completo}
                </p>

                <div style={{
                    background: '#f8fafc',
                    padding: '30px',
                    borderRadius: '16px',
                    marginBottom: '30px'
                }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Monto del Abono Semanal
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        ${montoPorSemana}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                        {cupos} cupo{cupos > 1 ? 's' : ''} × $100
                    </div>
                </div>

                <button
                    onClick={pagarAhora}
                    disabled={procesando}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '20px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        opacity: procesando ? 0.6 : 1,
                        cursor: procesando ? 'wait' : 'pointer'
                    }}
                >
                    {procesando ? (
                        <>
                            <Loader size={20} className="spin" style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                            Procesando...
                        </>
                    ) : (
                        <>
                            💰 Registrar Pago Ahora
                        </>
                    )}
                </button>

                <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginTop: '15px',
                    fontStyle: 'italic'
                }}>
                    Se registrará el abono con la fecha de hoy
                </p>
            </div>

            {/* Historial reciente */}
            {pagosRecientes.length > 0 && (
                <div className="glass-panel" style={{ padding: '25px', marginTop: '20px' }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Calendar size={18} />
                        Últimos Pagos
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pagosRecientes.map((pago, idx) => (
                            <div
                                key={pago.id || idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {new Date(pago.fecha_operacion).toLocaleDateString('es-MX', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span style={{ fontWeight: '600', color: '#16a34a' }}>
                                    ${parseFloat(pago.monto).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagoRapido;
