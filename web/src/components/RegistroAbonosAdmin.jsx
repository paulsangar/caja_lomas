import React, { useState, useEffect } from 'react';
import { Search, DollarSign, Calendar, Check, AlertCircle, List, UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';

/**
 * REGISTRO DE ABONOS PARA ADMIN - CON VISTA GENERAL
 * Vista 1: Dashboard de todos los socios con estado de pagos
 * Vista 2: Registro individual (formulario)
 */
const RegistroAbonosAdmin = ({ user }) => {
    const [vista, setVista] = useState('general'); // 'general' o 'registro'
    const [socios, setSocios] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [socioSeleccionado, setSocioSeleccionado] = useState(null);
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Cargar socios
            const resSocios = await fetch('./api/socios/list.php');
            const dataSocios = await resSocios.json();

            // Cargar todos los movimientos
            const resMovs = await fetch('./api/movimientos/list.php');
            const dataMovs = await resMovs.json();

            if (dataSocios.success) {
                setSocios(dataSocios.data);
            }

            if (dataMovs.success) {
                setMovimientos(dataMovs.data.filter(m => m.tipo === 'aportacion'));
            }

            console.log('✅ Datos cargados:', dataSocios.data?.length, 'socios');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUltimoPago = (socioId) => {
        const pagos = movimientos.filter(m => parseInt(m.socio_id) === parseInt(socioId));
        if (pagos.length === 0) return null;

        // Ordenar por fecha descendente
        pagos.sort((a, b) => new Date(b.fecha_operacion) - new Date(a.fecha_operacion));
        return pagos[0];
    };

    const getPagosEsteMes = (socioId) => {
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        return movimientos.filter(m =>
            parseInt(m.socio_id) === parseInt(socioId) &&
            new Date(m.fecha_operacion) >= inicioMes
        ).length;
    };

    const registrarAbono = async (socio = null, montoOverride = null, descOverride = null) => {
        const socioTarget = socio || socioSeleccionado;

        if (!socioTarget) {
            setMensaje({ tipo: 'error', texto: 'Selecciona un socio' });
            return;
        }

        const montoNum = parseFloat(montoOverride || monto);
        if (!montoNum || montoNum <= 0) {
            setMensaje({ tipo: 'error', texto: 'Ingresa un monto válido' });
            return;
        }

        setProcesando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const payload = {
                socio_id: socioTarget.id,
                tipo: 'aportacion',
                monto: montoNum,
                descripcion: descOverride || descripcion || `Abono - ${new Date().toLocaleDateString('es-MX')}`
            };

            console.log('📤 Registrando:', payload);

            const response = await fetch('./api/movimientos/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setMensaje({
                    tipo: 'success',
                    texto: `✅ Abono de $${montoNum} registrado para ${socioTarget.nombre_completo}`
                });

                // Limpiar formulario
                setSocioSeleccionado(null);
                setMonto('');
                setDescripcion('');
                setBusqueda('');

                // Recargar datos
                setTimeout(() => {
                    cargarDatos();
                    setMensaje({ tipo: '', texto: '' });
                }, 2000);
            } else {
                throw new Error(data.message || 'Error al guardar');
            }
        } catch (error) {
            console.error('💥 Error:', error);
            setMensaje({ tipo: 'error', texto: error.message });
        } finally {
            setProcesando(false);
        }
    };

    const registroRapido = (socio) => {
        const cupos = parseInt(socio.cupos) || 1;
        const montoSugerido = cupos * 100;

        const confirmar = window.confirm(
            `Registrar abono para ${socio.nombre_completo}?\n\nMonto: $${montoSugerido}`
        );

        if (confirmar) {
            setMonto(montoSugerido.toString());
            setSocioSeleccionado(socio);
            registrarAbono(socio);
        }
    };

    const sociosFiltrados = socios.filter(s =>
        s.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.numero_socio?.toString().includes(busqueda)
    );

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mobile-stack">
                <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <DollarSign color="var(--primary)" /> Control de Abonos
                </h2>

                {/* Pestañas */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setVista('general')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: vista === 'general' ? '2px solid var(--primary)' : '2px solid var(--border)',
                            background: vista === 'general' ? '#eff6ff' : 'white',
                            color: vista === 'general' ? 'var(--primary)' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: vista === 'general' ? '600' : '400',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            flex: '1'
                        }}
                    >
                        <List size={18} /> Vista General
                    </button>
                    <button
                        onClick={() => setVista('registro')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: vista === 'registro' ? '2px solid var(--primary)' : '2px solid var(--border)',
                            background: vista === 'registro' ? '#eff6ff' : 'white',
                            color: vista === 'registro' ? 'var(--primary)' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: vista === 'registro' ? '600' : '400',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            flex: '1'
                        }}
                    >
                        <UserPlus size={18} /> Nuevo Abono
                    </button>
                </div>
            </div>

            {/* Mensaje */}
            {mensaje.texto && (
                <div style={{
                    padding: '15px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    background: mensaje.tipo === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `2px solid ${mensaje.tipo === 'success' ? '#86efac' : '#fecaca'}`,
                    color: mensaje.tipo === 'success' ? '#16a34a' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    {mensaje.tipo === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    {mensaje.texto}
                </div>
            )}

            {/* VISTA GENERAL */}
            {vista === 'general' && (
                <div className="glass-panel" style={{ padding: '20px' }}>
                    {/* Búsqueda */}
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="🔍 Buscar socio..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '2px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Tabla de socios */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', width: '60px' }}>#</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>Socio</th>
                                    <th className="hide-mobile" style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>Cupos</th>
                                    <th className="hide-mobile" style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>Pagos Este Mes</th>
                                    <th className="hide-mobile" style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>Último Pago</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sociosFiltrados.map((socio, idx) => {
                                    const ultimoPago = getUltimoPago(socio.id);
                                    const pagosEsteMes = getPagosEsteMes(socio.id);
                                    const cupos = parseInt(socio.cupos) || 1;
                                    const montoSugerido = cupos * 100;

                                    // Determinar estado
                                    let estadoColor = '#fca5a5'; // rojo
                                    let estadoIcon = <XCircle size={16} />;

                                    if (pagosEsteMes >= 4) {
                                        estadoColor = '#86efac'; // verde
                                        estadoIcon = <CheckCircle size={16} />;
                                    } else if (pagosEsteMes >= 2) {
                                        estadoColor = '#fde68a'; // amarillo
                                        estadoIcon = <Clock size={16} />;
                                    }

                                    return (
                                        <tr key={socio.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>{socio.numero_socio}</td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{socio.nombre_completo}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Saldo: ${parseFloat(socio.saldo_total || 0).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="hide-mobile" style={{ padding: '12px', textAlign: 'center', fontSize: '0.9rem' }}>{cupos}</td>
                                            <td className="hide-mobile" style={{ padding: '12px', textAlign: 'center' }}>
                                                <span style={{
                                                    background: estadoColor,
                                                    color: '#1f2937',
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    {estadoIcon} {pagosEsteMes}
                                                </span>
                                            </td>
                                            <td className="hide-mobile" style={{ padding: '12px', fontSize: '0.85rem' }}>
                                                {ultimoPago ? (
                                                    <>
                                                        <div style={{ fontWeight: '500' }}>
                                                            ${parseFloat(ultimoPago.monto).toLocaleString()}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {new Date(ultimoPago.fecha_operacion).toLocaleDateString('es-MX', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin pagos</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => registroRapido(socio)}
                                                    disabled={procesando}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        border: 'none',
                                                        cursor: procesando ? 'wait' : 'pointer',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500',
                                                        opacity: procesando ? 0.5 : 1,
                                                        marginRight: '5px'
                                                    }}
                                                >
                                                    + ${montoSugerido}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const montoMes = montoSugerido * 4;
                                                        const confirmar = window.confirm(`¿Registrar PAGO MENSUAL (4 semanas) para ${socio.nombre_completo}?\n\nMonto Total: $${montoMes}`);
                                                        if (confirmar) {
                                                            setMonto(montoMes.toString());
                                                            setSocioSeleccionado(socio);
                                                            setDescripcion(`Pago Mensual - ${new Date().toLocaleDateString('es-MX', { month: 'long' })}`);
                                                            // We need to pass the specific amount because state update might be slow
                                                            // But registrarAbono uses state 'monto'. 
                                                            // Let's modify registrarAbono slightly or hack it by setting state then calling.
                                                            // Better: Modify registrarAbono to accept override args.
                                                            registrarAbono(socio, montoMes, `Pago Mensual - ${new Date().toLocaleDateString('es-MX', { month: 'long' })}`);
                                                        }
                                                    }}
                                                    disabled={procesando}
                                                    title="Pagar Mes Completo (4 Semanas)"
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        background: '#8b5cf6', // Violet
                                                        color: 'white',
                                                        border: 'none',
                                                        cursor: procesando ? 'wait' : 'pointer',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500',
                                                        opacity: procesando ? 0.5 : 1
                                                    }}
                                                >
                                                    Mes
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {sociosFiltrados.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No se encontraron socios
                        </div>
                    )}
                </div>
            )}

            {/* VISTA REGISTRO INDIVIDUAL */}
            {vista === 'registro' && (
                <div className="glass-panel" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
                    {/* Buscar socio */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                            <Search size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                            Buscar Socio
                        </label>
                        <input
                            type="text"
                            placeholder="Nombre o número de socio..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '2px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Lista de resultados */}
                    {busqueda && sociosFiltrados.length > 0 && (
                        <div style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            marginBottom: '20px',
                            border: '1px solid var(--border)',
                            borderRadius: '8px'
                        }}>
                            {sociosFiltrados.slice(0, 10).map(socio => (
                                <div
                                    key={socio.id}
                                    onClick={() => {
                                        setSocioSeleccionado(socio);
                                        setBusqueda('');
                                        const cupos = parseInt(socio.cupos) || 1;
                                        setMonto((cupos * 100).toString());
                                    }}
                                    style={{
                                        padding: '12px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--border)',
                                        background: 'white',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    <div style={{ fontWeight: '600' }}>{socio.nombre_completo}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        #{socio.numero_socio} • {socio.cupos} cupo{socio.cupos > 1 ? 's' : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Socio seleccionado */}
                    {socioSeleccionado && (
                        <div style={{
                            background: '#eff6ff',
                            padding: '15px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            borderLeft: '4px solid var(--primary)'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                {socioSeleccionado.nombre_completo}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Socio #{socioSeleccionado.numero_socio} • Cupos: {socioSeleccionado.cupos}
                            </div>
                            <button
                                onClick={() => setSocioSeleccionado(null)}
                                style={{
                                    marginTop: '10px',
                                    padding: '5px 10px',
                                    fontSize: '0.85rem',
                                    background: 'white',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cambiar socio
                            </button>
                        </div>
                    )}

                    {/* Monto */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                            <DollarSign size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                            Monto del Abono
                        </label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            disabled={!socioSeleccionado}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '2px solid var(--border)',
                                fontSize: '1rem',
                                opacity: socioSeleccionado ? 1 : 0.5
                            }}
                        />
                    </div>

                    {/* Descripción */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                            Descripción (opcional)
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Abono semanal..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            disabled={!socioSeleccionado}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '2px solid var(--border)',
                                fontSize: '1rem',
                                opacity: socioSeleccionado ? 1 : 0.5
                            }}
                        />
                    </div>

                    {/* Botón */}
                    <button
                        onClick={() => registrarAbono()}
                        disabled={!socioSeleccionado || !monto || procesando}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '15px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            opacity: (!socioSeleccionado || !monto || procesando) ? 0.5 : 1
                        }}
                    >
                        {procesando ? '⏳ Procesando...' : '💰 Registrar Abono'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default RegistroAbonosAdmin;
