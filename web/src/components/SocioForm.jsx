import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus } from 'lucide-react';

const BANCOS_MX = [
    "BBVA México", "Banamex", "Santander", "Banorte", "HSBC", "Scotiabank",
    "Inbursa", "Banco Azteca", "Bancoppel", "Afirme", "BanBajío",
    "Nu México (Fintech)", "Mercado Pago (Fintech)", "Albo (Fintech)", "Stori (Fintech)",
    "Klar (Fintech)", "Ualá (Fintech)", "Spin by OXXO"
];

const SocioForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        numero_socio: 'Cargando...',
        telefono: '',
        numero_cuenta: '',
        tipo_cuenta_detectada: '',
        banco: '',
        cupos: 1,
        fecha_nacimiento: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Cargar siguiente ID al montar
    useEffect(() => {
        const fetchNextId = async () => {
            try {
                const res = await fetch('./api/socios/next_id.php');
                const data = await res.json();
                if (data.success) {
                    setFormData(prev => ({ ...prev, numero_socio: data.next_id }));
                }
            } catch (e) {
                console.error("Error fetching ID");
            }
        };
        fetchNextId();
    }, []);

    // Detectar tipo de cuenta
    useEffect(() => {
        const num = formData.numero_cuenta.replace(/\D/g, '');
        let tipo = '';
        if (num.length === 18) tipo = 'CLABE Interbancaria';
        else if (num.length === 16) tipo = 'Tarjeta de Débito/Crédito';
        else if (num.length >= 10 && num.length <= 11) tipo = 'Número de Cuenta';
        else if (num.length > 0) tipo = 'Formato desconocido';

        setFormData(prev => ({ ...prev, tipo_cuenta_detectada: tipo }));
    }, [formData.numero_cuenta]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            setError('El nombre es obligatorio.');
            return;
        }
        if (!formData.telefono.trim() || formData.telefono.length < 10) {
            setError('El teléfono es obligatorio y debe tener 10 dígitos.');
            return;
        }
        if (!formData.cupos || formData.cupos < 1) {
            setError('Debes asignar al menos 1 cupo.');
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
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '100%', maxWidth: '650px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', background: 'white'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '24px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                    <UserPlus /> Registro de Nuevo Socio
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '5px' }}>Datos Personales</h3>
                        </div>

                        <div className="input-group">
                            <label>Nombre Completo *</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                                placeholder="Nombre completo"
                            />
                        </div>

                        <div className="input-group">
                            <label>ID / Número de Socio (Auto)</label>
                            <input
                                type="text"
                                value={formData.numero_socio}
                                readOnly
                                style={{ background: '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-muted)' }}
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
                            <label>Teléfono *</label>
                            <input
                                type="tel"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                placeholder="10 dígitos"
                                required
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '5px' }}>Banco y Membresía</h3>
                        </div>

                        <div className="input-group">
                            <label>Banco / Fintech</label>
                            <select
                                value={formData.banco}
                                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
                            >
                                <option value="">Selecciona...</option>
                                {BANCOS_MX.map(b => <option key={b} value={b}>{b}</option>)}
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Cuenta / CLABE</label>
                            <input
                                type="text"
                                value={formData.numero_cuenta}
                                onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                                placeholder="Solo números"
                            />
                            {formData.tipo_cuenta_detectada && (
                                <div style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--success)', fontWeight: '500' }}>
                                    {formData.tipo_cuenta_detectada}
                                </div>
                            )}
                        </div>

                        <div className="input-group">
                            <label>Cupos Ahorro ($100 c/u) *</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.cupos}
                                onChange={(e) => setFormData({ ...formData, cupos: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Correo (Opcional)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '10px' }}>
                        <label>Contraseña (Opcional)</label>
                        <input
                            type="text"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Por defecto se generará una"
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--danger)', marginBottom: '15px', fontSize: '0.85rem', background: '#fef2f2', padding: '10px', borderRadius: '8px' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, background: '#f1f5f9', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
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
