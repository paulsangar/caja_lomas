import React, { useState, useEffect } from 'react';
import { LogOut, Wallet, Users, Landmark, Bell, Home, ChevronRight, History, Calendar, Settings } from 'lucide-react';
import Socios from './components/Socios';
import Movimientos from './components/Movimientos';
import Prestamos from './components/Prestamos';
import AbonosSemanal from './components/AbonosSemanal';
import Configuracion from './components/Configuracion';

const Dashboard = ({ user, onLogout }) => {
    const [currentView, setCurrentView] = useState('home');
    const [stats, setStats] = useState({
        saldo_total: 0,
        total_socios: 0,
        prestamos_activos: 0,
        recientes: [],
        avisos: []
    });
    const [loading, setLoading] = useState(true);
    const [showNotices, setShowNotices] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('./api/stats.php');
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
                // Mostrar avisos SOLO si NO es admin
                if (user.rol !== 'admin' && data.data.avisos && data.data.avisos.length > 0) {
                    setShowNotices(true);
                }
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user.rol]);

    const renderView = () => {
        switch (currentView) {
            case 'socios': return <Socios />;
            case 'movimientos': return <Movimientos />;
            case 'prestamos': return <Prestamos />;
            case 'abonos_semanal': return <AbonosSemanal />;
            case 'config': return <Configuracion user={user} />;
            case 'home':
            default:
                return (
                    <div className="animate-fade-in">
                        {/* Stats Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '24px',
                            marginBottom: '40px'
                        }}>
                            <div className="glass-panel clickable-card" onClick={() => setCurrentView('movimientos')} style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <Wallet color="var(--primary-light)" />
                                    <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>{loading ? '...' : 'Actualizado'}</span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Saldo Total en Caja</p>
                                <h2 style={{ fontSize: '2rem', marginTop: '8px' }}>
                                    ${parseFloat(stats.saldo_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </h2>
                            </div>

                            <div className="glass-panel clickable-card" onClick={() => setCurrentView('prestamos')} style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <Landmark color="var(--warning)" />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Préstamos Activos</p>
                                <h2 style={{ fontSize: '2rem', marginTop: '8px' }}>{stats.prestamos_activos}</h2>
                            </div>

                            <div className="glass-panel clickable-card" onClick={() => setCurrentView('socios')} style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <Users color="var(--primary-light)" />
                                    <ChevronRight size={18} color="var(--text-muted)" />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Socios</p>
                                <h2 style={{ fontSize: '2rem', marginTop: '8px' }}>{stats.total_socios}</h2>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>Movimientos Recientes</h3>
                                    <button onClick={() => setCurrentView('movimientos')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>Ver historial</button>
                                </div>
                                {stats.recientes.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>No hay movimientos registrados.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {stats.recientes.map(m => (
                                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{m.nombre_completo}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.tipo} - {new Date(m.fecha_operacion).toLocaleDateString()}</div>
                                                </div>
                                                <div style={{ fontWeight: 'bold', color: (m.tipo === 'aportacion' ? 'var(--success)' : 'var(--danger)') }}>
                                                    ${parseFloat(m.monto).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notices Popup (Only for Non-Admins) */}
                        {showNotices && (
                            <div className="modal-overlay" style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', zIndex: 2000, padding: '20px'
                            }}>
                                <div className="glass-panel animate-fade-in" style={{
                                    width: '100%', maxWidth: '450px', padding: '30px', position: 'relative'
                                }}>
                                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Bell color="var(--warning)" size={24} /> Avisos Importantes
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '60vh', overflowY: 'auto' }}>
                                        {stats.avisos.map(aviso => (
                                            <div key={aviso.id} style={{
                                                background: '#f0f9ff', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--primary-light)'
                                            }}>
                                                <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '5px' }}>{aviso.titulo}</h4>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{aviso.contenido}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowNotices(false)}
                                        className="btn-primary"
                                        style={{ width: '100%', marginTop: '25px' }}
                                    >
                                        Entendido
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto', minHeight: '100vh' }}>
            <header style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                marginBottom: '30px',
                padding: '10px 0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{user.nombre_completo}</h1>
                        <span style={{
                            background: '#eff6ff',
                            color: 'var(--primary)',
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>Administrador</span>
                    </div>

                    <button onClick={onLogout} style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#ef4444',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition)'
                    }} title="Cerrar Sesión">
                        <LogOut size={20} />
                    </button>
                </div>

                <nav className="main-nav" style={{
                    display: 'flex',
                    gap: '5px',
                    overflowX: 'auto',
                    padding: '5px',
                    margin: '0 -5px',
                    scrollSnapType: 'x mandatory'
                }}>
                    {[
                        { id: 'home', icon: <Home size={20} />, label: 'Inicio' },
                        { id: 'socios', icon: <Users size={20} />, label: 'Socios' },
                        { id: 'abonos_semanal', icon: <Calendar size={20} />, label: 'Abonos' },
                        { id: 'prestamos', icon: <Landmark size={20} />, label: 'Préstamos' },
                        { id: 'movimientos', icon: <History size={20} />, label: 'Historial' },
                        { id: 'config', icon: <Settings size={20} />, label: 'Config' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                            style={{
                                flex: '1',
                                minWidth: '70px',
                                flexDirection: 'column',
                                gap: '4px',
                                padding: '10px 5px',
                                fontSize: '0.75rem',
                                borderRadius: '10px'
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            <main>{renderView()}</main>
        </div>
    );
};

export default Dashboard;
