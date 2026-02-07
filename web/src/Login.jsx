import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

const Login = ({ onLoginSuccess, onRegisterClick }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('./api/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '100%',
                maxWight: '450px',
                padding: '40px',
                textAlign: 'center'
            }}>
                <div style={{
                    background: 'var(--primary)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.5)'
                }}>
                    <ShieldCheck size={32} color="white" />
                </div>

                <h1 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>Bienvenido</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Caja de Ahorro Lomas</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label><User size={14} style={{ marginRight: '5px' }} /> Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ej. admin"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={14} style={{ marginRight: '5px' }} /> Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: 'var(--danger)',
                            fontSize: '0.85rem',
                            marginBottom: '20px',
                            padding: '10px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '10px' }}
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Sistema de Administración Segura
                </p>

                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>¿No tienes cuenta?</p>
                    <button
                        onClick={onRegisterClick}
                        style={{
                            background: 'none', border: 'none', color: 'var(--primary)',
                            fontWeight: '600', cursor: 'pointer', textDecoration: 'underline'
                        }}
                    >
                        Solicitar Registro
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
