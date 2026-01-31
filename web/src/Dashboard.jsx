import React, { useState, useEffect } from 'react';
import { LogOut, Wallet, Users, Landmark, Bell, Home, ChevronRight, History } from 'lucide-react';
import Socios from './components/Socios';
import Movimientos from './components/Movimientos';
import Prestamos from './components/Prestamos';

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

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('./api/stats.php');
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const renderView = () => {
        switch (currentView) {
            case 'socios': return <Socios />;
            case 'movimientos': return <Movimientos />;
            case 'prestamos': return <Prestamos />;
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

                        {/* Recent Activity & Notices */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>Movimientos Recientes</h3>
                                    <button onClick={() => setCurrentView('movimientos')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-light)', fontSize: '0.85rem', cursor: 'pointer' }}>Ver todos</button>
                                </div>
                                {stats.recientes.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>No hay movimientos registrados.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {stats.recientes.map(m => (
                                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
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

                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Bell size={20} color="var(--warning)" /> Avisos
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {stats.avisos.map(aviso => (
                                        <div key={aviso.id} style={{
                                            background: 'rgba(59, 130, 246, 0.05)',
                                            padding: '15px',
                                            borderRadius: '12px',
                                            borderLeft: '3px solid var(--primary)'
                                        }}>
                                            <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{aviso.titulo}</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{aviso.contenido}</p>
                                        </div>
                                    ))}
                                    {stats.avisos.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay avisos pendientes.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto', minHeight: '100vh' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                padding: '20px 0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.4rem' }}>{user.nombre_completo}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Administrador del Sistema</p>
                    </div>

                    <nav style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '12px' }}>
                        {[
                            { id: 'home', icon: <Home size={18} />, label: 'Inicio' },
                            { id: 'socios', icon: <Users size={18} />, label: 'Socios' },
                            { id: 'movimientos', icon: <History size={18} />, label: 'Movimientos' },
                            { id: 'prestamos', icon: <Landmark size={18} />, label: 'Préstamos' }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                                style={{ padding: '8px 12px' }}
                            >
                                {item.icon} <span className="nav-label">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <button onClick={onLogout} style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem'
                }} className="logout-btn">
                    <LogOut size={18} /> Salir
                </button>
            </header>

            <main>{renderView()}</main>
        </div>
    );
};

export default Dashboard;
