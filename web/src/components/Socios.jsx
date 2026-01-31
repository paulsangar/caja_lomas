import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MoreVertical, ExternalLink } from 'lucide-react';
import SocioForm from './SocioForm';

const Socios = () => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'numero_socio', direction: 'asc' });

    const fetchSocios = async () => {
        setLoading(true);
        try {
            const response = await fetch('./api/socios/list.php');
            const data = await response.json();
            if (data.success) {
                setSocios(data.data);
            }
        } catch (error) {
            console.error('Error fetching socios:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSocios();
    }, []);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedSocios = [...socios].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredSocios = sortedSocios.filter(s =>
        s.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.numero_socio.includes(searchTerm)
    );

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
    };

    return (
        <div className="animate-fade-in">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)' }}>Gestión de Socios</h2>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <UserPlus size={18} /> Nuevo Socio
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '15px', background: '#f8fafc' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px 10px 40px',
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('numero_socio')} style={{ cursor: 'pointer' }}>ID <SortIcon columnKey="numero_socio" /></th>
                                <th onClick={() => handleSort('nombre_completo')} style={{ cursor: 'pointer' }}>Nombre y Detalles <SortIcon columnKey="nombre_completo" /></th>
                                <th onClick={() => handleSort('fecha_ingreso')} style={{ cursor: 'pointer' }}>Desde <SortIcon columnKey="fecha_ingreso" /></th>
                                <th onClick={() => handleSort('cupos')} style={{ cursor: 'pointer' }}>Cupos <SortIcon columnKey="cupos" /></th>
                                <th onClick={() => handleSort('saldo_total')} style={{ cursor: 'pointer' }}>Ahorro Total <SortIcon columnKey="saldo_total" /></th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Cargando socios...</td>
                                </tr>
                            ) : filteredSocios.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No se encontraron socios registrados.
                                    </td>
                                </tr>
                            ) : (
                                filteredSocios.map(socio => (
                                    <tr key={socio.id} className="table-row-hover">
                                        <td style={{ padding: '15px 20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                                            {socio.numero_socio}
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{socio.nombre_completo}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '4px' }}>
                                                {socio.telefono && <span>📞 {socio.telefono}</span>}
                                                {socio.banco && <span>🏦 {socio.banco}</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px 20px', fontSize: '0.9rem' }}>
                                            {new Date(socio.fecha_ingreso).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <span style={{
                                                background: '#eff6ff',
                                                color: 'var(--primary)',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontWeight: '600',
                                                fontSize: '0.85rem'
                                            }}>
                                                {socio.cupos || 1}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 20px', fontWeight: 'bold', color: '#059669' }}>
                                            ${parseFloat(socio.saldo_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => alert(`Detalles del socio:\n\nBanco: ${socio.banco}\nCuenta: ${socio.numero_cuenta}\nNacimiento: ${socio.fecha_nacimiento}\nTeléfono: ${socio.telefono}`)}
                                                title="Ver detalle completo"
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid var(--border)',
                                                    padding: '6px',
                                                    borderRadius: '6px',
                                                    color: 'var(--primary)',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <SocioForm
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        fetchSocios();
                        // TODO: Mostrar notificación de éxito
                    }}
                />
            )}
        </div>
    );
};

export default Socios;
