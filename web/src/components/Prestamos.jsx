import React, { useState, useEffect } from 'react';
import { Landmark, PlusCircle, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Prestamos = () => {
    const [prestamos, setPrestamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPrestamos = async () => {
        setLoading(true);
        try {
            const response = await fetch('./api/prestamos/list.php');
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'aprobado': return { bg: 'rgba(34,197,94,0.1)', color: 'var(--success)', icon: <CheckCircle size={14} /> };
            case 'pendiente': return { bg: 'rgba(245,158,11,0.1)', color: 'var(--warning)', icon: <Clock size={14} /> };
            case 'rechazado': return { bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)', icon: <AlertCircle size={14} /> };
            default: return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', icon: null };
        }
    };

    const filtered = prestamos.filter(p =>
        p.socio_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_socio.includes(searchTerm)
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Landmark color="var(--warning)" /> Control de Préstamos
                </h2>
                <button className="btn-primary" style={{ display: 'flex', gap: '8px' }}>
                    <PlusCircle size={18} /> Nuevo Préstamo
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por socio o número..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px 10px 40px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '15px 20px' }}>Socio</th>
                                <th style={{ padding: '15px 20px' }}>Monto Solicitado</th>
                                <th style={{ padding: '15px 20px' }}>Plazo</th>
                                <th style={{ padding: '15px 20px' }}>Estatus</th>
                                <th style={{ padding: '15px 20px' }}>Saldo Pendiente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Cargando...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay préstamos registrados.</td></tr>
                            ) : (
                                filtered.map(p => {
                                    const style = getStatusStyle(p.estatus);
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row-hover">
                                            <td style={{ padding: '15px 20px' }}>
                                                <div style={{ fontWeight: '500' }}>{p.socio_nombre}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Socio #{p.numero_socio}</div>
                                            </td>
                                            <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>
                                                ${parseFloat(p.monto_solicitado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>{p.plazo_meses} meses</td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    background: style.bg,
                                                    color: style.color,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    border: `1px solid ${style.color}33`
                                                }}>
                                                    {style.icon} {p.estatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 20px', fontWeight: 'bold', color: 'var(--warning)' }}>
                                                ${parseFloat(p.saldo_pendiente || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
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

export default Prestamos;
