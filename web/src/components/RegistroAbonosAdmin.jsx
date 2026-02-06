import React, { useState, useEffect } from 'react';
import { Search, DollarSign, Calendar, Check, AlertCircle } from 'lucide-react';

/**
 * REGISTRO DE ABONOS PARA ADMIN
 * Sistema simple: buscar socio, ingresar monto, registrar
 */
const RegistroAbonosAdmin = ({ user }) => {
    const [socios, setSocios] = useState([]);
    const [socioSeleccionado, setSocioSeleccionado] = useState(null);
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarSocios();
    }, []);

    const cargarSocios = async () => {
        setLoading(true);
        try {
            const res = await fetch('./api/socios/list.php');
            const data = await res.json();
            if (data.success) {
                setSocios(data.data);
                console.log('✅ Socios cargados:', data.data.length);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const registrarAbono = async () => {
        if (!socioSeleccionado) {
            setMensaje({ tipo: 'error', texto: 'Selecciona un socio' });
            return;
        }

        const montoNum = parseFloat(monto);
        if (!montoNum || montoNum <= 0) {
            setMensaje({ tipo: 'error', texto: 'Ingresa un monto válido' });
            return;
        }

        setProcesando(true);
        setMensaje({ tipo: '', texto: '' });

        console.log('💳 Registrando abono:', {
            socio_id: socioSeleccionado.id,
            socio: socioSeleccionado.nombre_completo,
            monto: montoNum
        });

        try {
            const payload = {
                socio_id: socioSeleccionado.id,
                tipo: 'aportacion',
                monto: montoNum,
                descripcion: descripcion || `Abono - ${new Date().toLocaleDateString('es-MX')}`
            };

            console.log('📤 Enviando:', payload);

            const response = await fetch('./api/movimientos/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('📨 Respuesta:', data);

            if (data.success) {
                setMensaje({
                    tipo: 'success',
                    texto: `✅ Abono de $${montoNum} registrado para ${socioSeleccionado.nombre_completo}`
                });

                // Limpiar formulario
                setSocioSeleccionado(null);
                setMonto('');
                setDescripcion('');
                setBusqueda('');

                // Recargar socios
                setTimeout(() => cargarSocios(), 1000);
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

    const sociosFiltrados = socios.filter(s =>
        s.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.numero_socio?.toString().includes(busqueda)
    );

    const sugerirMonto = () => {
        if (socioSeleccionado) {
            const cupos = parseInt(socioSeleccionado.cupos) || 1;
            setMonto((cupos * 100).toString());
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando socios...</div>;
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DollarSign color="var(--primary)" /> Registro de Abonos
            </h2>

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

            <div className="glass-panel" style={{ padding: '30px' }}>
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

                {/* Lista de socios */}
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
                                    sugerirMonto();
                                }}
                                style={{
                                    padding: '12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--border)',
                                    background: socioSeleccionado?.id === socio.id ? '#eff6ff' : 'white',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.target.style.background = socioSeleccionado?.id === socio.id ? '#eff6ff' : 'white'}
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
                            Socio #{socioSeleccionado.numero_socio} • Cupos: {socioSeleccionado.cupos} •
                            Saldo: ${parseFloat(socioSeleccionado.saldo_total || 0).toLocaleString()}
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
                    {socioSeleccionado && (
                        <button
                            onClick={sugerirMonto}
                            style={{
                                marginTop: '8px',
                                padding: '5px 10px',
                                fontSize: '0.85rem',
                                background: '#eff6ff',
                                color: 'var(--primary)',
                                border: '1px solid var(--primary)',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Sugerir: ${(parseInt(socioSeleccionado.cupos) || 1) * 100}
                        </button>
                    )}
                </div>

                {/* Descripción opcional */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Descripción (opcional)
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: Abono semanal, Pago atrasado..."
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

                {/* Botón registrar */}
                <button
                    onClick={registrarAbono}
                    disabled={!socioSeleccionado || !monto || procesando}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        opacity: (!socioSeleccionado || !monto || procesando) ? 0.5 : 1,
                        cursor: (!socioSeleccionado || !monto || procesando) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {procesando ? '⏳ Procesando...' : '💰 Registrar Abono'}
                </button>
            </div>
        </div>
    );
};

export default RegistroAbonosAdmin;
