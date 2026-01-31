import React, { useState } from 'react';
import { X, Save, UserPlus } from 'lucide-react';

const SocioForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        numero_socio: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('./api/socios/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                onSuccess(data);
                onClose();
            } else {
                setError(data.message || 'Error al registrar socio');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '30px',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserPlus color="var(--primary)" /> Nuevo Socio
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nombre Completo</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            required
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>

                    <div className="input-group">
                        <label>Número de Socio (ID)</label>
                        <input
                            type="text"
                            value={formData.numero_socio}
                            onChange={(e) => setFormData({ ...formData, numero_socio: e.target.value })}
                            required
                            placeholder="Ej. 101"
                        />
                    </div>

                    <div className="input-group">
                        <label>Correo Electrónico (Opcional)</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="juan@ejemplo.com"
                        />
                    </div>

                    <div className="input-group">
                        <label>Contraseña Provisional</label>
                        <input
                            type="text"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Dejar vacío para '123456'"
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--danger)', marginBottom: '15px', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                        <Save size={18} style={{ marginRight: '8px' }} />
                        {loading ? 'Guardando...' : 'Guardar Socio'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SocioForm;
