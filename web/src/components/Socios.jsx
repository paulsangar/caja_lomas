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
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => {
                                                        const newPass = prompt(`Resetear contraseña para ${socio.nombre_completo}?`, "123456");
                                                        if (newPass) {
                                                            // Aquí iría la llamada a API para reset (pendiente backend)
                                                            alert("Funcionalidad de backend pendiente para password: " + newPass);
                                                        }
                                                    }}
                                                    title="Resetear Contraseña"
                                                    className="btn-icon"
                                                    style={{
                                                        background: '#fff7ed', border: '1px solid #ffedd5',
                                                        padding: '6px', borderRadius: '6px', color: '#ea580c', cursor: 'pointer'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.9rem' }}>🔑</span>
                                                </button>
                                                <button
                                                    onClick={() => setSelectedSocio(socio)}
                                                    title="Ver Detalle"
                                                    className="btn-icon"
                                                    style={{
                                                        background: '#eff6ff', border: '1px solid #dbeafe',
                                                        padding: '6px', borderRadius: '6px', color: '#2563eb', cursor: 'pointer'
                                                    }}
                                                >
                                                    <User size={16} />
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

            {/* Modal de Detalles */}
            {selectedSocio && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
                }}>
                    <div className="glass-panel animate-slide-up" style={{ width: '90%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User size={20} color="var(--primary)" /> Detalle del Socio
                            </h3>
                            <button onClick={() => setSelectedSocio(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="var(--text-muted)" />
                            </button>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 15px' }}>
                                    {selectedSocio.nombre_completo.charAt(0)}
                                </div>
                                <h2 style={{ fontSize: '1.4rem', marginBottom: '5px' }}>{selectedSocio.nombre_completo}</h2>
                                <span style={{ background: '#eff6ff', color: 'var(--primary)', padding: '4px 12px', borderRadius: '15px', fontSize: '0.9rem', fontWeight: '600' }}>
                                    Socio #{selectedSocio.numero_socio}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <CreditCard size={14} /> Banco
                                    </div>
                                    <div style={{ fontWeight: '500' }}>{selectedSocio.banco || 'No registrado'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedSocio.numero_cuenta}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <Phone size={14} /> Contacto
                                    </div>
                                    <div style={{ fontWeight: '500' }}>{selectedSocio.telefono || 'Sin teléfono'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedSocio.email}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <Calendar size={14} /> Fecha de Nacimiento
                                    </div>
                                    <div style={{ fontWeight: '500' }}>{selectedSocio.fecha_nacimiento ? new Date(selectedSocio.fecha_nacimiento).toLocaleDateString() : 'No registrada'}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                            <button className="btn-secondary" onClick={() => setSelectedSocio(null)}>Cerrar</button>
                        </div>
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
