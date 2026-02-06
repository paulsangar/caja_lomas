import React, { useState, useEffect } from 'react';
import { Landmark, Plus, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import PrestamoForm from './PrestamoForm';

const Prestamos = ({ user }) => {
    const [prestamos, setPrestamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'activo': return { bg: '#dbeafe', color: '#1e40af', icon: <Clock size={14} /> };
            case 'pagado': return { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={14} /> };
            default: return { bg: '#f1f5f9', color: '#64748b', icon: <AlertCircle size={14} /> };
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Landmark color="var(--primary)" /> Gestión de Préstamos
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
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Socio</th>
                            <th style={{ padding: '15px' }}>Monto Prestado</th>
                            <th style={{ padding: '15px' }}>Total Pagar</th>
                            <th style={{ padding: '15px' }}>Pagado</th>
                            <th style={{ padding: '15px' }}>Estatus</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center' }}>Cargando préstamos...</td></tr>
                        ) : prestamos.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay préstamos activos.</td></tr>
                        ) : (
                            prestamos.map(p => {
                                const style = getStatusStyle(p.estado);
                                const monto = parseFloat(p.monto);
                                const total = parseFloat(p.monto_total_pagar);
                                const pagado = parseFloat(p.monto_pagado || 0);

                                return (
                                    <React.Fragment key={p.id}>
                                        <tr
                                            onClick={() => toggleRow(p.id)}
                                            className="table-row-hover"
                                            style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                        >
                                            <td style={{ padding: '15px', fontWeight: '500' }}>
                                                {p.socio_nombre}
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {p.numero_socio}</div>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>${monto.toLocaleString()}</td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>${total.toLocaleString()}</td>
                                            <td style={{ padding: '15px', textAlign: 'center', color: pagado >= total ? 'var(--success)' : 'var(--text-main)' }}>
                                                ${pagado.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                <span style={{
                                                    background: style.bg, color: style.color,
                                                    padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold',
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    {style.icon} {p.estado.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                {expandedRow === p.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </td>
                                        </tr>
                                        {expandedRow === p.id && (
                                            <tr style={{ background: '#f8fafc' }}>
                                                <td colSpan="6" style={{ padding: '0' }}>
                                                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', borderBottom: '1px solid var(--border)' }}>
                                                        <div>
                                                            <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Fecha Inicio</strong>
                                                            {new Date(p.fecha_inicio).toLocaleDateString()}
                                                        </div>
                                                        <div>
                                                            <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Plazo</strong>
                                                            {p.plazo_semanas} Semanas
                                                        </div>
                                                        <div>
                                                            <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Saldo Restante</strong>
                                                            <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>${(total - pagado).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default Prestamos;
