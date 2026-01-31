import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MoreVertical, ExternalLink } from 'lucide-react';
import SocioForm from './SocioForm';

const Socios = () => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredSocios = socios.filter(s =>
        s.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.numero_socio.includes(searchTerm)
    );

    return (
        <div className="animate-fade-in">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem' }}>Gestión de Socios</h2>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <UserPlus size={18} /> Nuevo Socio
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '15px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o número de socio..."
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
                                <th style={{ padding: '15px 20px' }}># Socio</th>
                                <th style={{ padding: '15px 20px' }}>Nombre</th>
                                <th style={{ padding: '15px 20px' }}>Estatus</th>
                                <th style={{ padding: '15px 20px' }}>Saldo Ahorro</th>
                                <th style={{ padding: '15px 20px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Cargando socios...</td>
                                </tr>
                            ) : filteredSocios.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No se encontraron socios registrados.
                                    </td>
                                </tr>
                            ) : (
                                filteredSocios.map(socio => (
                                    <tr key={socio.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row-hover">
                                        <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{socio.numero_socio}</td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div>{socio.nombre_completo}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{socio.email || 'Sin correo'}</div>
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                background: socio.estatus === 'activo' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: socio.estatus === 'activo' ? 'var(--success)' : 'var(--danger)',
                                                border: `1px solid ${socio.estatus === 'activo' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                                            }}>
                                                {socio.estatus.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 20px', fontWeight: 'bold', color: 'var(--primary-light)' }}>
                                            ${parseFloat(socio.saldo_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                <ExternalLink size={18} />
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
