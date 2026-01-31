import React, { useState } from 'react';
import { LogOut, Wallet, Users, Landmark, Bell, Home, ChevronRight } from 'lucide-react';
import Socios from './components/Socios';

const Dashboard = ({ user, onLogout }) => {
    const [currentView, setCurrentView] = useState('home');

    const renderView = () => {
        switch (currentView) {
            case 'socios':
                return <Socios />;
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
                            <div className="glass-panel clickable-card" onClick={() => setCurrentView('home')} style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <Wallet color="var(--primary-light)" />
                                    <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Actualizado</span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Saldo Total en Caja</p>
                                <h2 style={{ fontSize: '2rem', marginTop: '8px' }}>$0.00</h2>
                            </div>

                            <div className="glass-panel clickable-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <Landmark color="var(--warning)" />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Préstamos Activos</p>
                                <h2 style={{ fontSize: '2rem', marginTop: '8px' }}>0</h2>
                            </div>

                            <div className="glass-panel clickable-card" onClick={() => setCurrentView('socios')} style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <Users color="var(--primary-light)" />
                                    <ChevronRight size={18} color="var(--text-muted)" />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Socios</p>
                                <h2 style={{ fontSize: '2rem', marginTop: '8px' }}>0</h2>
                            </div>
                        </div>

                        {/* Recent Activity & Notices */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <h3 style={{ marginBottom: '20px' }}>Movimientos Recientes</h3>
                                <div style={{
                                    padding: '60px 20px',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    border: '1px dashed var(--glass-border)'
                                }}>
                                    <p style={{ color: 'var(--text-muted)' }}>No hay movimientos registrados todavía.</p>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Bell size={20} color="var(--warning)" /> Avisos
                                </h3>
                                <div style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    borderLeft: '4px solid var(--primary)'
                                }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Bienvenido</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                        El sistema de Caja de Ahorro Lomas ya está operativo. Comienza registrando a tus socios en la sección de Socios.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto', minHeight: '100vh' }}>
            {/* Sidebar / Top Nav Toggle alternative */}
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

                    <nav style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setCurrentView('home')}
                            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
                        >
                            <Home size={18} /> Inicio
                        </button>
                        <button
                            onClick={() => setCurrentView('socios')}
                            className={`nav-link ${currentView === 'socios' ? 'active' : ''}`}
                        >
                            <Users size={18} /> Socios
                        </button>
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
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                }} className="logout-btn">
                    <LogOut size={18} /> Salir
                </button>
            </header>

            {/* View Content */}
            <main>
                {renderView()}
            </main>
        </div>
    );
};

export default Dashboard;
