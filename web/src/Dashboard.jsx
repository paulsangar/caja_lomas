import React from 'react';
import { LogOut, Wallet, Users, Landmark, Bell } from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px',
                padding: '20px 0'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem' }}>Hola, {user.nombre_completo}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Panel de {user.rol}</p>
                </div>
                <button onClick={onLogout} style={{
                    background: 'transparent',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-muted)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <LogOut size={18} /> Salir
                </button>
            </header>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <Wallet color="var(--primary)" />
                        <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>+12% este mes</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Saldo Total en Caja</p>
                    <h2 style={{ fontSize: '2rem' }}>$0.00</h2>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <Landmark color="var(--warning)" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Préstamos Activos</p>
                    <h2 style={{ fontSize: '2rem' }}>0</h2>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <Users color="var(--text-muted)" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Socios</p>
                    <h2 style={{ fontSize: '2rem' }}>0</h2>
                </div>
            </div>

            {/* Recent Activity & Notices */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Movimientos Recientes</h3>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                        No hay movimientos registrados todavía.
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={20} color="var(--warning)" /> Avisos
                    </h3>
                    <div style={{
                        background: 'rgba(255,158,11,0.1)',
                        padding: '16px',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--warning)'
                    }}>
                        <p style={{ fontSize: '0.9rem' }}>Bienvenido al nuevo sistema de la Caja de Ahorro Lomas.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
