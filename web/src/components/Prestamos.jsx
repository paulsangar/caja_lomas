import React, { useState, useEffect } from 'react';
import { Landmark, Plus, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import PrestamoForm from './PrestamoForm';

const Prestamos = ({ user }) => {
    const [prestamos, setPrestamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    // Modales y manejo de abonos
    const [showAbonoModal, setShowAbonoModal] = useState(false);
    const [selectedPrestamo, setSelectedPrestamo] = useState(null);
    const [abonoAmount, setAbonoAmount] = useState('');

    const fetchPrestamos = async () => {
        setLoading(true);
        try {
            const query = (user && user.rol !== 'admin') ? `?usuario_id=${user.id}` : '';
            const cacheBuster = (query ? '&' : '?') + 't=' + Date.now();
            const response = await fetch(`./api/prestamos/list.php${query}${cacheBuster}`);
            const data = await response.json();
            if (data.success) {
                setPrestamos(data.data);
            }
        } catch (error) {
            console.error('Error fetching prestamos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrestamos();
    }, []);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    // Función para detectar atrasos (> 7 días desde inicio o último movimiento)
    const esPrestamoAtrasado = (p) => {
        if (!p.fecha_inicio || p.estado !== 'activo') return false;
        const fechaInicio = new Date(p.fecha_inicio);
        const hoy = new Date();
        const diffDias = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
        const pagado = parseFloat(p.monto_pagado || 0);
        const total = parseFloat(p.monto_total_pagar || 0);
        // Si han pasado más de 7 días y no se ha pagado nada (o la lógica que defina "atraso")
        return diffDias > 7 && pagado < total;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'activo': return { bg: '#dbeafe', color: '#1e40af', icon: <Clock size={14} /> };
            case 'pagado': return { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={14} /> };
            default: return { bg: '#f1f5f9', color: '#64748b', icon: <AlertCircle size={14} /> };
        }
    };

    const handleOpenAbono = (prestamo) => {
        setSelectedPrestamo(prestamo);
        setAbonoAmount(''); // Reset amount
        setShowAbonoModal(true);
    };

    const handleRealizarAbono = async (e) => {
        e.preventDefault();
        if (!selectedPrestamo || !abonoAmount || parseFloat(abonoAmount) <= 0) {
            alert('Por favor, ingrese un monto válido para abonar.');
            return;
        }

        const confirmAbono = window.confirm(`¿Está seguro de registrar un abono de $${parseFloat(abonoAmount).toLocaleString()} para el préstamo de ${selectedPrestamo.socio_nombre}?`);
        if (!confirmAbono) return;

        try {
            const response = await fetch('./api/prestamos/abonar.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prestamo_id: selectedPrestamo.id,
                    monto_abono: parseFloat(abonoAmount),
                    usuario_id: user.id // Asumiendo que el usuario logueado es quien realiza el abono
                }),
            });
            const data = await response.json();
            if (data.success) {
                alert('Abono registrado exitosamente.');
                setShowAbonoModal(false);
                fetchPrestamos(); // Refresh the list
            } else {
                alert('Error al registrar el abono: ' + data.message);
            }
        } catch (error) {
            console.error('Error al realizar abono:', error);
            alert('Error de conexión al registrar el abono.');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Landmark color="var(--warning)" /> Gestión de Préstamos
                </h2>
                {user.rol === 'admin' && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Nuevo Préstamo
                    </button>
                )}
            </div>

            {showForm && (
                <PrestamoForm
                    onClose={() => setShowForm(false)}
                    onSuccess={fetchPrestamos}
                />
            )}

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px 40px', gap: '10px', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <div>Socio</div>
                    <div>Prestado</div>
                    <div>Total Pagar</div>
                    <div>Pagado</div>
                    <div style={{ textAlign: 'center' }}>Estatus</div>
                    <div></div>
                </div>

                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>Cargando préstamos...</div>
                    ) : prestamos.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay préstamos activos.</div>
                    ) : (
                        prestamos.map(p => {
                            // Validar datos antes de renderizar para evitar crash
                            if (!p) return null;
                            const total = parseFloat(p.monto_total_pagar) || 0;
                            const pagado = parseFloat(p.monto_pagado) || parseFloat(p.pagado) || 0; // Fallback
                            const saldoRestante = total - pagado;
                            const isOverdue = esPrestamoAtrasado(p);

                            return (
                                <div key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px 40px', gap: '10px', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{p.socio_nombre || 'Socio Desconocido'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {p.numero_socio || '?'}</div>
                                        </div>
                                        <div style={{ fontWeight: '500' }}>${parseFloat(p.monto || 0).toLocaleString()}</div>
                                        <div style={{ fontWeight: '500' }}>${total.toLocaleString()}</div>
                                        <div style={{ color: '#16a34a', fontWeight: 'bold' }}>${pagado.toLocaleString()}</div>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{
                                                background: isOverdue ? '#fee2e2' : '#eff6ff',
                                                color: isOverdue ? '#dc2626' : '#2563eb',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                            }}>
                                                {isOverdue && <AlertCircle size={12} />}
                                                {isOverdue ? 'ATRASADO' : (p.estado ? p.estado.toUpperCase() : 'ACTIVO')}
                                            </span>
                                        </div>
                                        <button onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                            {expandedRow === p.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>


                                    {expandedRow === p.id && (
                                        <div style={{ background: '#f8fafc', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="animate-fade-in">
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fecha Inicio</div>
                                                <div style={{ fontWeight: '500' }}>{new Date(p.fecha_inicio).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plazo</div>
                                                <div style={{ fontWeight: '500' }}>{p.plazo_semanas} Semanas</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saldo Restante</div>
                                                <div style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '1.1rem' }}>
                                                    ${saldoRestante.toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Botón de Abonar (Solo Admin) */}
                                            {user.rol === 'admin' && saldoRestante > 0 && (
                                                <div style={{ gridColumn: 'span 3', marginTop: '15px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                                                    <button
                                                        onClick={() => handleOpenAbono(p)}
                                                        className="btn-primary"
                                                        style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        <Plus size={16} /> Registrar Abono
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal Abono */}
            {showAbonoModal && selectedPrestamo && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel animate-slide-up" style={{ padding: '30px', maxWidth: '400px', width: '100%' }}>
                        <h3 style={{ marginBottom: '20px' }}>Abonar a Préstamo</h3>
                        <p style={{ marginBottom: '15px', fontSize: '0.9rem' }}>
                            Socio: <strong>{selectedPrestamo.socio_nombre}</strong><br />
                            Saldo Restante: <span style={{ color: 'red' }}>${(parseFloat(selectedPrestamo.monto_total_pagar) - parseFloat(selectedPrestamo.monto_pagado)).toLocaleString()}</span>
                        </p>

                        <form onSubmit={handleRealizarAbono}>
                            <div className="input-group">
                                <label>Monto a Abonar</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={abonoAmount}
                                    onChange={e => setAbonoAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowAbonoModal(false)} className="btn-secondary">Cancelar</button>
                                <button type="submit" className="btn-primary">Registrar Pago</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Prestamos;
