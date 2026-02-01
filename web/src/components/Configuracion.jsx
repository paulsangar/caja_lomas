import React, { useState, useEffect } from 'react';
import { Settings, Bell, User, Lock, Save, Trash2, Plus, X } from 'lucide-react';

const Configuracion = ({ user }) => {
    const [activeTab, setActiveTab] = useState('avisos');

    // Admin Profile State
    const [adminData, setAdminData] = useState({
        nombre: user?.nombre_completo || '',
        email: user?.email || '',
        newPassword: ''
    });

    // Avisos State
    const [socios, setSocios] = useState([]);

    useEffect(() => {
        if (activeTab === 'avisos') {
            fetchAvisos();
            fetchSocios();
        }
    }, [activeTab]);

    const fetchAvisos = () => {
        fetch('./api/avisos/list.php')
            .then(res => res.json())
            .then(data => data.success && setAvisos(data.data));
    };

    const fetchSocios = () => {
        fetch('./api/socios/list.php')
            .then(res => res.json())
            .then(data => data.success && setSocios(data.data));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('./api/admin/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    ...adminData
                })
            });
            const data = await res.json();
            if (data.success) alert('Perfil actualizado correctamente. (Los cambios se verán al reiniciar sesión)');
            else alert('Error: ' + data.message);
        } catch (e) {
            alert('Error de conexión');
        }
    };

    const handleCreateAviso = async (e) => {
        e.preventDefault();
        await fetch('./api/avisos/create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(avisoData)
        });
        setShowAvisoForm(false);
        setAvisoData({ titulo: '', contenido: '', prioridad: 'media' });
        fetchAvisos();
    };

    const handleDeleteAviso = async (id) => {
        if (!confirm('¿Eliminar aviso?')) return;
        await fetch('./api/avisos/delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchAvisos();
    };

    return (
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <Settings color="var(--primary)" /> Configuración del Sistema
            </h2>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <button
                    onClick={() => setActiveTab('avisos')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'avisos' ? 'var(--primary)' : 'white',
                        color: activeTab === 'avisos' ? 'white' : 'var(--text-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Bell size={16} /> Gestión de Avisos
                </button>
                <button
                    onClick={() => setActiveTab('admin')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'admin' ? 'var(--primary)' : 'white',
                        color: activeTab === 'admin' ? 'white' : 'var(--text-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <User size={16} /> Perfil Admin
                </button>
            </div>

            {/* TAB: AVISOS */}
            {activeTab === 'avisos' && (
                <div className="glass-panel" style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>Avisos Publicados</h3>
                        <button className="btn-primary" onClick={() => setShowAvisoForm(true)}>
                            <Plus size={16} /> Nuevo Aviso
                        </button>
                    </div>

                    {showAvisoForm && (
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h4>Redactar Aviso</h4>
                                <button onClick={() => setShowAvisoForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <form onSubmit={handleCreateAviso} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input
                                        placeholder="Título"
                                        value={avisoData.titulo}
                                        onChange={e => setAvisoData({ ...avisoData, titulo: e.target.value })}
                                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        required
                                    />
                                    <select
                                        value={avisoData.destinatario_id || ''}
                                        onChange={e => setAvisoData({ ...avisoData, destinatario_id: e.target.value })}
                                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    >
                                        <option value="">Todos (General)</option>
                                        {socios.map(s => (
                                            <option key={s.id} value={s.usuario_id}>
                                                {s.nombre_completo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <textarea
                                    placeholder="Mensaje"
                                    value={avisoData.contenido}
                                    onChange={e => setAvisoData({ ...avisoData, contenido: e.target.value })}
                                    rows="3"
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                                    required
                                />
                                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end' }}>Publicar</button>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {avisos.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No hay avisos.</p> : avisos.map(a => (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div>
                                    <strong>{a.titulo}</strong>
                                    <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{a.contenido}</p>
                                </div>
                                <button onClick={() => handleDeleteAviso(a.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: ADMIN */}
            {activeTab === 'admin' && (
                <div className="glass-panel" style={{ padding: '25px', maxWidth: '500px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Editar Datos del Administrador</h3>
                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group">
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                value={adminData.nombre}
                                onChange={e => setAdminData({ ...adminData, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                value={adminData.email}
                                onChange={e => setAdminData({ ...adminData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Nueva Contraseña (Opcional)</label>
                            <input
                                type="password"
                                placeholder="Dejar vacía para no cambiar"
                                value={adminData.newPassword}
                                onChange={e => setAdminData({ ...adminData, newPassword: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            <Save size={18} /> Guardar Cambios
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Configuracion;
