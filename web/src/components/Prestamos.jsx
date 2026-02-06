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
