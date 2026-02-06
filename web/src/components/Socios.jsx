import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MoreVertical, X, CreditCard, Phone, Calendar, User } from 'lucide-react';
import SocioForm from './SocioForm';

const Socios = () => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSocio, setSelectedSocio] = useState(null); // Para el modal de detalles
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

    const handleEditSocio = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('./api/socios/update.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedSocio) // selectedSocio acts as the editing state
            });
            const data = await res.json();
            if (data.success) {
                alert('Socio actualizado');
                setSelectedSocio(null);
                fetchSocios();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Error de conexión');
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header omitted for brevity, logic remains same */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }} className="mobile-stack">
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)' }}>Gestión de Socios</h2>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <UserPlus size={18} style={{ marginRight: '5px' }} /> Nuevo Socio
                </button>
            </div>

            {/* Table Rendering same as before... */}
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
                                <th onClick={() => handleSort('numero_socio')} style={{ cursor: 'pointer', width: '80px' }}>ID <SortIcon columnKey="numero_socio" /></th>
                                <th onClick={() => handleSort('nombre_completo')} style={{ cursor: 'pointer' }}>Nombre y Detalles <SortIcon columnKey="nombre_completo" /></th>
                                <th className="hide-mobile" onClick={() => handleSort('fecha_ingreso')} style={{ cursor: 'pointer' }}>Desde <SortIcon columnKey="fecha_ingreso" /></th>
                                <th className="hide-mobile" onClick={() => handleSort('cupos')} style={{ cursor: 'pointer' }}>Cupos <SortIcon columnKey="cupos" /></th>
                                <th onClick={() => handleSort('saldo_total')} style={{ cursor: 'pointer', textAlign: 'right' }}>Ahorro <SortIcon columnKey="saldo_total" /></th>
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
                                                {socio.banco && <span className="hide-mobile">🏦 {socio.banco}</span>}
                                            </div>
                                        </td>
                                        <td className="hide-mobile" style={{ padding: '15px 20px', fontSize: '0.9rem' }}>
                                            {new Date(socio.fecha_ingreso).toLocaleDateString()}
                                        </td>
                                        <td className="hide-mobile" style={{ padding: '15px 20px' }}>
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
                                        <td style={{ padding: '15px 20px', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>
                                            ${parseFloat(socio.saldo_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => setSelectedSocio(socio)}
                                                    title="Editar Detalle"
                                                    className="btn-icon"
                                                    style={{
                                                        background: '#eff6ff', border: '1px solid #dbeafe',
                                                        padding: '6px', borderRadius: '6px', color: '#2563eb', cursor: 'pointer'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalles / Edición */}
            {selectedSocio && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
                }}>
                    <div className="glass-panel animate-slide-up" style={{ width: '90%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}>
                        <form onSubmit={handleEditSocio}>
                            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <User size={20} color="var(--primary)" /> Editar Socio
                                </h3>
                                <button type="button" onClick={() => setSelectedSocio(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} color="var(--text-muted)" />
                                </button>
                            </div>
                            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{selectedSocio.nombre_completo}</h2>

                                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Teléfono</label>
                                <input
                                    value={selectedSocio.telefono || ''}
                                    onChange={e => setSelectedSocio({ ...selectedSocio, telefono: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />

                                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Email</label>
                                <input
                                    value={selectedSocio.email || ''}
                                    onChange={e => setSelectedSocio({ ...selectedSocio, email: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />

                                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Banco</label>
                                <input
                                    value={selectedSocio.banco || ''}
                                    onChange={e => setSelectedSocio({ ...selectedSocio, banco: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />

                                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Cuenta / CLABE</label>
                                <input
                                    value={selectedSocio.numero_cuenta || ''}
                                    onChange={e => setSelectedSocio({ ...selectedSocio, numero_cuenta: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />

                                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Cupos</label>
                                <input
                                    type="number"
                                    value={selectedSocio.cupos || 1}
                                    onChange={e => setSelectedSocio({ ...selectedSocio, cupos: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid var(--border)', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setSelectedSocio(null)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showForm && (
                <SocioForm
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        fetchSocios();
                    }}
                />
            )}
        </div>
    );
};

export default Socios;
