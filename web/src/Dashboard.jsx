import React, { useState, useEffect } from 'react';
import { LogOut, Wallet, Users, Landmark, Bell, Home, ChevronRight, History, Calendar, Settings } from 'lucide-react';
import Socios from './components/Socios';
import Movimientos from './components/Movimientos';
import Prestamos from './components/Prestamos';
import GridSemanalSimple from './components/GridSemanalSimple';
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
            // Si no es admin, filtramos por su ID
            const query = user.rol !== 'admin' ? `?usuario_id=${user.id}` : '';
            const response = await fetch(`./api/stats.php${query}`);
            const data = await response.json();
            if (data.success) {
                setStats(data.data);

                // Para no-admin: verificar si hay avisos nuevos
                if (user.rol !== 'admin' && data.data.avisos && data.data.avisos.length > 0) {
                    const avisosLeidos = JSON.parse(localStorage.getItem(`avisos_leidos_${user.id}`) || '[]');
                    const hayNuevos = data.data.avisos.some(a => !avisosLeidos.includes(a.id));
                    if (hayNuevos) {
                        setShowNotices(true);
                    }
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
    }, [user]);

    const renderView = () => {
        switch (currentView) {
            case 'socios':
                // RBAC: Solo admin puede ver socios
                if (user.rol !== 'admin') {
                    setCurrentView('home');
                    return null;
                }
                return <Socios user={user} />;
            case 'movimientos':
                // RBAC: Solo admin puede ver el historial completo
                if (user.rol !== 'admin') {
                    setCurrentView('home');
                    return null;
                }
                return <Movimientos user={user} />;
            case 'prestamos': return <Prestamos user={user} />;
            case 'abonos_semanal':
                // Solo admin - Grid simple con guardado instantáneo
                if (user.rol !== 'admin') {
                    setCurrentView('home');
                    return null;
                }
                return <GridSemanalSimple user={user} />;
            case 'config':
                // RBAC: Solo admin puede ver config
                if (user.rol !== 'admin') {
                    setCurrentView('home');
                    return null;
                }
                return <Configuracion user={user} />;
            case 'home':
            default:
                return (
                    <div className="animate-fade-in">
                        {user.rol === 'admin' ? (
                            <>
                                {/* Stats Grid (ADMIN ONLY) */}
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

                                {/* Recent Activity (ADMIN ONLY) */}
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
                            </>
                        ) : (
                            /* SOCIO VIEW */
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                                <div className="glass-panel clickable-card" onClick={() => setCurrentView('abonos_semanal')} style={{ padding: '30px', borderLeft: '4px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <Calendar size={32} color="var(--primary)" />
                                        <h2 style={{ fontSize: '1.5rem' }}>Mis Abonos</h2>
                                        <p style={{ color: 'var(--text-muted)' }}>Consulta tu semana actual y pagos.</p>
                                    </div>
                                </div>

                                <div className="glass-panel clickable-card" onClick={() => setCurrentView('prestamos')} style={{ padding: '30px', borderLeft: '4px solid var(--warning)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <Landmark size={32} color="var(--warning)" />
                                        <h2 style={{ fontSize: '1.5rem' }}>Mis Préstamos</h2>
                                        <p style={{ color: 'var(--text-muted)' }}>Solicita o revisa el estado de tu préstamo.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notices Popup (Only for Non-Admins) - With Persistent Dismissal */}
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
                                        onClick={() => {
                                            setShowNotices(false);
                                            // Marcar como leído en localStorage
                                            localStorage.setItem(`avisos_leidos_${user.id}`, JSON.stringify(stats.avisos.map(a => a.id)));
                                        }}
                                        className="btn-primary"
                                        style={{ width: '100%', marginTop: '25px' }}
                                    >
                                        Marcar como Leído
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{
                                background: '#eff6ff',
                                color: 'var(--primary)',
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>{user.rol}</span>
                            <span style={{
                                background: '#f0fdf4',
                                color: '#16a34a',
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}>v5.14 • 20:10</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Notification Bell (for non-admin users) */}
                        {user.rol !== 'admin' && stats.avisos && stats.avisos.length > 0 && (
                            <button onClick={() => setShowNotices(true)} style={{
                                background: '#fef3c7',
                                border: '1px solid #fde68a',
                                color: '#d97706',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'var(--transition)',
                                position: 'relative'
                            }} title="Ver Avisos">
                                <Bell size={20} />
                                {(() => {
                                    const avisosLeidos = JSON.parse(localStorage.getItem(`avisos_leidos_${user.id}`) || '[]');
                                    const sinLeer = stats.avisos.filter(a => !avisosLeidos.includes(a.id)).length;
                                    return sinLeer > 0 ? (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-2px',
                                            right: '-2px',
                                            background: '#dc2626',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>{sinLeer}</span>
                                    ) : null;
                                })()}
                            </button>
                        )}

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
                    ].filter(item => {
                        // V5.6 RBAC: Socios NO ven Abonos, Socios, Config, ni Movimientos
                        if (user.rol !== 'admin') {
                            return item.id !== 'socios' && item.id !== 'config' && item.id !== 'movimientos' && item.id !== 'abonos_semanal';
                        }
                        return true;
                    }).map(item => (
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
            </header >

            <main>{renderView()}</main>
        </div >
    );
};

export default Dashboard;
