import React, { useState } from 'react';

const RegistroPublico = ({ onBack }) => {
    const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '' });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('./api/auth/register_public.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await res.json();

            setMessage({
                text: result.message,
                type: result.success ? 'success' : 'error'
            });

            if (result.success) {
                setFormData({ nombre: '', telefono: '', email: '' });
            }
        } catch (error) {
            setMessage({ text: 'Error de conexión. Intenta de nuevo.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', background: '#f8fafc', padding: '20px'
        }}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center'
            }}>
                <h1 style={{ color: '#2563eb', margin: '0 0 10px 0' }}>Únete a la Caja</h1>
                <p style={{ margin: '0 0 30px 0', color: '#64748b' }}>Completa tus datos para solicitar acceso.</p>

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Nombre Completo</label>
                        <input
                            type="text" required placeholder="Ej. Juan Pérez"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Teléfono (WhatsApp)</label>
                        <input
                            type="tel" required placeholder="10 dígitos"
                            value={formData.telefono}
                            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Email (Opcional)</label>
                        <input
                            type="email" placeholder="correo@ejemplo.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        style={{
                            width: '100%', padding: '14px', background: '#2563eb', color: 'white',
                            border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                </form>

                {message && (
                    <div style={{
                        marginTop: '20px', padding: '10px', borderRadius: '8px', fontSize: '0.9rem',
                        background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#991b1b'
                    }}>
                        {message.text}
                    </div>
                )}

                <button
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none', color: '#64748b',
                        marginTop: '20px', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline'
                    }}
                >
                    Volver al Login
                </button>

                <div style={{ marginTop: '30px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Sistema de Caja de Ahorro v5.23<br />
                    Created by MASC MEDIA 2026
                </div>
            </div>
        </div>
    );
};

export default RegistroPublico;
