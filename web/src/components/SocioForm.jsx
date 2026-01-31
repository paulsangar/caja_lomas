import React, { useState } from 'react';
import { X, Save, UserPlus } from 'lucide-react';

const SocioForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        numero_socio: '',
        telefono: '',
        numero_cuenta: '',
        banco: '',
        cupos: 1,
        fecha_nacimiento: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (!formData.nombre || !formData.numero_socio || !formData.cupos) {
            setError('Por favor llena los campos obligatorios (*)');
            return;
        }

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
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '100%',
                maxWidth: '600px',
                padding: '30px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '20px',
                    right: '24px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '24px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserPlus color="var(--primary)" /> Registro de Nuevo Socio
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="input-group">
                            <label>Nombre Completo *</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Número de Socio (ID) *</label>
                            <input
                                type="text"
                                value={formData.numero_socio}
                                onChange={(e) => setFormData({ ...formData, numero_socio: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={formData.fecha_nacimiento}
                                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label>Teléfono</label>
                            <input
                                type="tel"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                placeholder="10 dígitos"
                            />
                        </div>

                        <div className="input-group">
                            <label>Banco</label>
                            <input
                                type="text"
                                value={formData.banco}
                                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label>Número de Cuenta / CLABE</label>
                            <input
                                type="text"
                                value={formData.numero_cuenta}
                                onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label>Núm. de Cupos * ($100 c/u)</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.cupos}
                                onChange={(e) => setFormData({ ...formData, cupos: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Contraseña para el Socio</label>
                        <input
                            type="text"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Por defecto: 123456"
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--danger)', marginBottom: '15px', fontSize: '0.85rem', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, background: '#f1f5f9', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                            <Save size={18} style={{ marginRight: '8px' }} />
                            {loading ? 'Guardando...' : 'Registrar Socio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SocioForm;
