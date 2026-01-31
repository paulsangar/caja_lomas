import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, TrendingUp, TrendingDown, History } from 'lucide-react';

const Movimientos = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMovimientos = async () => {
        setLoading(true);
        try {
            const response = await fetch('./api/movimientos/list.php');
            const data = await response.json();
            if (data.success) {
                setMovimientos(data.data);
            }
        } catch (error) {
            console.error('Error fetching movimientos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovimientos();
    }, []);

    const filtered = movimientos.filter(m =>
        m.socio_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.numero_socio.includes(searchTerm) ||
        m.tipo.includes(searchTerm)
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <History color="var(--primary-light)" /> Historial de Movimientos
                </h2>
                <button className="btn-primary" style={{ display: 'flex', gap: '8px' }}>
                    <PlusCircle size={18} /> Registrar Aporte
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por socio, número o tipo..."
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
                                <th style={{ padding: '15px 20px' }}>Fecha</th>
                                <th style={{ padding: '15px 20px' }}>Socio</th>
                                <th style={{ padding: '15px 20px' }}>Tipo</th>
                                <th style={{ padding: '15px 20px' }}>Descripción</th>
                                <th style={{ padding: '15px 20px', textAlign: 'right' }}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Cargando...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay registros.</td></tr>
                            ) : (
                                filtered.map(m => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row-hover">
                                        <td style={{ padding: '15px 20px', fontSize: '0.9rem' }}>
                                            {new Date(m.fecha_operacion).toLocaleDateString('es-MX')}
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ fontWeight: '500' }}>{m.socio_nombre}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Socio #{m.numero_socio}</div>
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                {m.tipo === 'aportacion' ? <TrendingUp size={14} color="var(--success)" /> : <TrendingDown size={14} color="var(--danger)" />}
                                                {m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1).replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {m.descripcion}
                                        </td>
                                        <td style={{
                                            padding: '15px 20px',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            color: (m.tipo === 'aportacion' || m.tipo === 'pago_prestamo') ? 'var(--success)' : 'var(--danger)'
                                        }}>
                                            {(m.tipo === 'aportacion' || m.tipo === 'pago_prestamo') ? '+' : '-'}
                                            ${parseFloat(m.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Movimientos;
