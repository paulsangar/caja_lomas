import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, TrendingUp, TrendingDown, History } from 'lucide-react';

const Movimientos = ({ user }) => {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMovimientos = async () => {
        setLoading(true);
        try {
            const query = (user && user.rol !== 'admin') ? `?usuario_id=${user.id}` : '';
            const cacheBuster = (query ? '&' : '?') + 't=' + Date.now();
            const response = await fetch(`./api/movimientos/list.php${query}${cacheBuster}`);
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

    const [sortConfig, setSortConfig] = useState({ key: 'fecha_operacion', direction: 'desc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedMovimientos = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <History color="var(--primary-light)" /> Historial de Movimientos
                </h2>
                {/* Botón eliminado a petición del usuario */}
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
                            <tr style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <th onClick={() => handleSort('fecha_operacion')} style={{ padding: '15px 20px' }}>Fecha <SortIcon columnKey="fecha_operacion" /></th>
                                <th onClick={() => handleSort('socio_nombre')} style={{ padding: '15px 20px' }}>Socio <SortIcon columnKey="socio_nombre" /></th>
                                <th onClick={() => handleSort('tipo')} style={{ padding: '15px 20px' }}>Tipo <SortIcon columnKey="tipo" /></th>
                                <th onClick={() => handleSort('descripcion')} style={{ padding: '15px 20px' }}>Descripción <SortIcon columnKey="descripcion" /></th>
                                <th onClick={() => handleSort('monto')} style={{ padding: '15px 20px', textAlign: 'right' }}>Monto <SortIcon columnKey="monto" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Cargando...</td></tr>
                            ) : sortedMovimientos.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay registros.</td></tr>
                            ) : (
                                sortedMovimientos.map(m => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row-hover">
                                        <td style={{ padding: '15px 20px', fontSize: '0.9rem' }}>
                                            {new Date(m.fecha_operacion).toLocaleDateString('es-MX')}
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ fontWeight: '500' }}>{m.socio_nombre}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Socio #{m.numero_socio}</div>
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {m.tipo === 'aportacion' && <div title="Abono" style={{ padding: '4px', background: '#dcfce7', borderRadius: '50%', color: '#16a34a' }}><TrendingUp size={16} /></div>}
                                                {m.tipo === 'retiro' && <div title="Retiro" style={{ padding: '4px', background: '#fee2e2', borderRadius: '50%', color: '#dc2626' }}><TrendingDown size={16} /></div>}
                                                {m.tipo === 'prestamo_otorgado' && <div title="Préstamo" style={{ padding: '4px', background: '#ffedd5', borderRadius: '50%', color: '#ea580c' }}><TrendingDown size={16} /></div>}
                                                {m.tipo === 'pago_prestamo' && <div title="Pago Préstamo" style={{ padding: '4px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}><TrendingUp size={16} /></div>}

                                                <div style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                                                    {m.tipo.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {m.descripcion || '-'}
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
