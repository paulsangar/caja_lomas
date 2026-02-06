import React, { useState, useEffect } from 'react';
import { Calendar, Check, ChevronLeft, ChevronRight, Loader, AlertCircle } from 'lucide-react';

/**
 * VISTA DE ABONOS PARA EL SOCIO
 * - Solo lectura (no puede clickear para pagar/borrar)
 * - Solo ve SU fila
 * - Mismo diseño visual que el grid de admin
 */
const MisAbonos = ({ user }) => {
    const [socio, setSocio] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mesActual, setMesActual] = useState(new Date().getMonth());
    const [anioActual, setAnioActual] = useState(new Date().getFullYear());

    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    useEffect(() => {
        cargarDatos();
    }, [mesActual, anioActual, user]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Timestamp para evitar caché
            const ts = Date.now();

            const [resSocio, resMovs] = await Promise.all([
                fetch(`./api/socios/list.php?usuario_id=${user.id}&t=${ts}`, { cache: 'no-store' }),
                fetch(`./api/movimientos/list.php?usuario_id=${user.id}&t=${ts}`, { cache: 'no-store' })
            ]);

            console.log('Fetching MisAbonos for user:', user.id); // DEBUG

            const dataSocio = await resSocio.json();
            const dataMovs = await resMovs.json();

            if (dataSocio.success && dataSocio.data.length > 0) {
                setSocio(dataSocio.data[0]); // Debería volver solo 1
            }

            if (dataMovs.success) {
                setMovimientos(dataMovs.data.filter(m => m.tipo === 'aportacion'));
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

        return movimientos.some(m =>
            m.socio_id == socioId &&
            m.descripcion.toLowerCase().includes(buscar)
        );
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

    // Función auxiliar para fechas (misma que en Admin)
    const getRangoFechas = (semana) => {
        const diasPorSemana = 7;
        const inicioDia = (semana - 1) * diasPorSemana + 1;
        let finDia = semana * diasPorSemana;
        const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
        if (semana === 4) finDia = diasEnMes;
        const mesCorto = nombresMeses[mesActual].substring(0, 3);
        return `${inicioDia}-${finDia} ${mesCorto}`;
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <Loader className="spin" size={48} style={{ color: 'var(--primary)' }} />
                <p style={{ marginTop: '15px' }}>Cargando tu información...</p>
            </div>
        );
    }

    if (!socio) {
        return (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                <AlertCircle size={48} color="var(--warning)" style={{ margin: '0 auto 15px' }} />
                <h3>No se encontró información de socio</h3>
                <p>Tu usuario no está vinculado a un registro de socio activo.</p>
                <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Usuario ID: {user?.id} <br />
                    Rol: {user?.rol}
                </div>
            </div>
        );
    }

    // Lógica para obtener el último abono
    const getUltimoAbono = () => {
        if (!movimientos || movimientos.length === 0) return null;
        // Asumiendo que están ordenados por fecha DESC desde el API
        return movimientos[0];
    };

    const ultimoAbono = getUltimoAbono();

    // Lógica Estatus General (Semana Actual Pagada?)
    // Obtenemos semana actual del mes
    const hoy = new Date();
    // Aproximación simple de semana del mes (1-4)
    const semanaActual = Math.ceil(hoy.getDate() / 7);
    const estatusSemanaActual = socio ? estaPagado(socio.id, semanaActual) : false;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar color="var(--primary)" /> Mis Abonos
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

            {/* V5.21: Tarjeta Resumen General */}
            <div className="glass-panel" style={{ padding: '25px', marginBottom: '30px', background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {/* Estatus */}
                    <div style={{ padding: '15px', borderRadius: '12px', background: estatusSemanaActual ? '#f0fdf4' : '#fff7ed', border: estatusSemanaActual ? '1px solid #bbf7d0' : '1px solid #fed7aa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            {estatusSemanaActual ? <Check size={20} color="#16a34a" /> : <Loader size={20} color="#ea580c" />}
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: estatusSemanaActual ? '#166534' : '#9a3412' }}>Estatus Semanal</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {estatusSemanaActual ? 'AL CORRIENTE' : 'PENDIENTE'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                            Semana {semanaActual} de {nombresMeses[hoy.getMonth()]}
                        </div>
                    </div>

                    {/* Último Abono */}
                    <div style={{ padding: '15px', borderRadius: '12px', background: 'white', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}>Último Abono</div>
                        </div>
                        {ultimoAbono ? (
                            <>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                    +${parseFloat(ultimoAbono.monto).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                    {new Date(ultimoAbono.fecha_operacion).toLocaleDateString()}
                                </div>
                            </>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin movimientos recientes</div>
                        )}
                    </div>

                    {/* Total Ahorrado */}
                    <div style={{ padding: '15px', borderRadius: '12px', background: 'var(--primary)', color: 'white' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', opacity: 0.9, marginBottom: '5px' }}>Total Ahorrado</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            ${parseFloat(socio.saldo_total || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid solo para el usuario */}
            <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '10px' }}>
                    <div style={{ width: '50px', height: '50px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {socio.nombre_completo.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{socio.nombre_completo}</div>
                        <div style={{ color: 'var(--text-muted)' }}>
                            Socio #{socio.numero_socio} • {socio.cupos} cupo{socio.cupos > 1 ? 's' : ''} • Ahorro: ${parseFloat(socio.saldo_total).toLocaleString()}
                        </div>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                            {[1, 2, 3, 4].map(sem => (
                                <th key={sem} style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
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
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            {[1, 2, 3, 4].map(semana => {
                                const pagado = estaPagado(socio.id, semana);

                                return (
                                    <td key={semana} style={{ padding: '20px', textAlign: 'center' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            border: pagado ? '2px solid #86efac' : '2px solid var(--border)',
                                            background: pagado ? '#f0fdf4' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto',
                                            boxShadow: pagado ? '0 4px 6px -1px rgba(22, 163, 74, 0.1)' : 'none'
                                        }}>
                                            {pagado ? (
                                                <Check size={28} style={{ color: '#16a34a' }} />
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>---</span>
                                            )}
                                        </div>
                                        {pagado && <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '5px', fontWeight: 'bold' }}>PAGADO</div>}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MisAbonos;
