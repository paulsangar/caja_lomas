import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign } from 'lucide-react';

const PrestamoForm = ({ onClose, onSuccess }) => {
    const [socios, setSocios] = useState([]);
    const [formData, setFormData] = useState({
        socio_id: '',
        monto: '',
        plazo_semanas: 12,
        tasa_interes: 10,
        fecha_inicio: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('./api/socios/list.php')
            .then(r => r.json())
            .then(data => {
                if (data.success) setSocios(data.data);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('./api/prestamos/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                onSuccess();
                onClose();
            } else {
                alert(data.message || 'Error al crear préstamo');
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const socioSeleccionado = socios.find(s => s.id == formData.socio_id);

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '100%', maxWidth: '500px', padding: '30px', background: 'white', position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>

                <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Nuevo Préstamo</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <div className="input-group">
                        <label>Socio Solicitante</label>
                        <select
                            value={formData.socio_id}
                            onChange={(e) => setFormData({ ...formData, socio_id: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                        >
                            <option value="">Seleccionar socio...</option>
                            {socios.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre_completo} (Saldo: ${s.saldo_total})</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Monto a Prestar ($)</label>
                        <input
                            type="number"
                            value={formData.monto}
                            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                            required
                            min="100"
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="input-group">
                            <label>Plazo (Semanas)</label>
                            <input
                                type="number"
                                value={formData.plazo_semanas}
                                onChange={(e) => setFormData({ ...formData, plazo_semanas: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Interés (%)</label>
                            <input
                                type="number"
                                value={formData.tasa_interes}
                                onChange={(e) => setFormData({ ...formData, tasa_interes: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {formData.monto && (
                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>
                            <p><strong>Total a Pagar:</strong> ${(parseFloat(formData.monto) * (1 + formData.tasa_interes / 100)).toFixed(2)}</p>
                            <p><strong>Pago Semanal:</strong> ${((parseFloat(formData.monto) * (1 + formData.tasa_interes / 100)) / formData.plazo_semanas).toFixed(2)}</p>
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
                        {loading ? 'Procesando...' : 'Otorgar Préstamo'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PrestamoForm;
