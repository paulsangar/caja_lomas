import React, { useState, useEffect } from 'react';
import { Trash2, Send, Bell, Plus, X } from 'lucide-react';

const AvisosConfig = () => {
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ titulo: '', contenido: '', prioridad: 'media' });

    const fetchAvisos = async () => {
        setLoading(true);
        try {
            const response = await fetch('./api/avisos/list.php');
            const data = await response.json();
            if (data.success) {
                setAvisos(data.data);
            }
        } catch (error) {
            console.error('Error fetching avisos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvisos();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este aviso?')) return;
        try {
            await fetch('./api/avisos/delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchAvisos();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('./api/avisos/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setShowForm(false);
            setFormData({ titulo: '', contenido: '', prioridad: 'media' });
            fetchAvisos();
        } catch (error) {
            alert('Error al crear aviso');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell color="var(--primary)" /> Configuración de Avisos
                </h2>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> Nuevo Aviso
                </button>
            </div>

            {showForm && (
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <h3>Redactar Nuevo Aviso</h3>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            type="text"
                            placeholder="Título del aviso"
                            value={formData.titulo}
                            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                        <textarea
                            placeholder="Contenido del mensaje..."
                            value={formData.contenido}
                            onChange={e => setFormData({ ...formData, contenido: e.target.value })}
                            required
                            rows="3"
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none' }}
                        />
                        <select
                            value={formData.prioridad}
                            onChange={e => setFormData({ ...formData, prioridad: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        >
                            <option value="baja">Prioridad Baja</option>
                            <option value="media">Prioridad Media</option>
                            <option value="alta">Prioridad Alta</option>
                        </select>
                        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end' }}>
                            <Send size={16} /> Publicar
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Título</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Contenido</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {avisos.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay avisos publicados.</td></tr>
                        ) : (
                            avisos.map(aviso => (
                                <tr key={aviso.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '15px', fontWeight: '500' }}>
                                        {aviso.titulo}
                                        {aviso.prioridad === 'alta' && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>URGENTE</span>}
                                    </td>
                                    <td style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{aviso.contenido}</td>
                                    <td style={{ padding: '15px', fontSize: '0.8rem' }}>{new Date(aviso.fecha_publicacion).toLocaleDateString()}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button onClick={() => handleDelete(aviso.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AvisosConfig;
