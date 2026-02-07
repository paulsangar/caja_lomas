import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MoreVertical, X, CreditCard, Phone, Calendar, User, Upload } from 'lucide-react';
import SocioForm from './SocioForm';

const Socios = () => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSocio, setSelectedSocio] = useState(null); // Para el modal de detalles
    const [sortConfig, setSortConfig] = useState({ key: 'numero_socio', direction: 'asc' });
    const [viewMode, setViewMode] = useState('active'); // 'active' | 'pending'

    // Import State
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const fetchSocios = async () => {
        setLoading(true);
        try {
            const response = await fetch('./api/socios/list.php');
            const data = await response.json();
            if (data.success) {
                setSocios(data.data);
            }
        } catch (error) {
            console.error('Error fetching socios:', error);
        } finally {
            setLoading(false);
        }
    };

    // Safety timeout to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 8000);
        return () => clearTimeout(timer);
    }, [loading]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedSocios = [...socios].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredSocios = sortedSocios.filter(s => {
        const matchesSearch = s.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.numero_socio && s.numero_socio.toString().includes(searchTerm));

        const matchesStatus = viewMode === 'active'
            ? (!s.status || s.status === 'active') // Default fallback
            : s.status === 'pending';
            : s.status === 'pending';

return matchesSearch && matchesStatus;
    });

const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);

    try {
        const res = await fetch('./api/socios/import.php', {
            method: 'POST',
            body: formData
        });
        const result = await res.json();
        setImportResult(result);
        if (result.success) {
            fetchSocios();
            setTimeout(() => {
                setShowImportModal(false);
                setImportResult(null);
                setImportFile(null);
            }, 3000);
        }
    } catch (error) {
        setImportResult({ success: false, message: 'Error de conexión' });
    } finally {
        setImporting(false);
    }
};

const handleApprove = async (socio) => {
    // Approve Logic: Update status -> Open WhatsApp
    const message = `Hola ${socio.nombre_completo}, tu cuenta en la Caja de Ahorro ha sido APROBADA. Tu usuario es: ${socio.username || 'socio' + socio.numero_socio}. Ingresa aquí: https://cajadeahorro.com`;
    const whatsappUrl = `https://wa.me/${socio.telefono}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    try {
        await fetch('./api/socios/update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: socio.id, status: 'active', nombre: socio.nombre_completo })
        });
        fetchSocios();
    } catch (e) { console.error(e); }
};

const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
};

const handleEditSocio = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('./api/socios/update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedSocio) // selectedSocio acts as the editing state
        });
        const data = await res.json();
        if (data.success) {
            alert('Socio actualizado');
            setSelectedSocio(null);
            fetchSocios();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error de conexión');
    }
};

return (
    <div className="animate-fade-in">
        {/* Header omitted for brevity, logic remains same */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary-dark)' }}>Gestión de Socios</h2>
                {/* View Triggers */}
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginLeft: '10px' }}>
                    <button
                        onClick={() => setViewMode('active')}
                        style={{
                            padding: '5px 12px', borderRadius: '6px', border: 'none',
                            background: viewMode === 'active' ? 'white' : 'transparent',
                            fontWeight: viewMode === 'active' ? '600' : '400',
                            boxShadow: viewMode === 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            color: 'var(--text-main)'
                        }}
                    >Activos</button>
                    <button
                        onClick={() => setViewMode('pending')}
                        style={{
                            padding: '5px 12px', borderRadius: '6px', border: 'none',
                            background: viewMode === 'pending' ? 'white' : 'transparent',
                            fontWeight: viewMode === 'pending' ? '600' : '400',
                            boxShadow: viewMode === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '5px',
                            color: 'var(--text-main)'
                        }}
                    >
                        Solicitudes
                        {socios.filter(s => s.status === 'pending').length > 0 &&
                            <span style={{ background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '10px' }}>
                                {socios.filter(s => s.status === 'pending').length}
                            </span>
                        }
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => setShowImportModal(true)}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <Upload size={18} /> <span className="hide-mobile">Importar CSV</span>
                </button>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <UserPlus size={18} /> Nuevo Socio
                </button>
            </div>
        </div>

        {/* Table Rendering same as before... */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '15px', background: '#f8fafc' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 15px 10px 40px',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('numero_socio')} style={{ cursor: 'pointer', width: '80px' }}>ID <SortIcon columnKey="numero_socio" /></th>
                            <th onClick={() => handleSort('nombre_completo')} style={{ cursor: 'pointer' }}>Nombre y Detalles <SortIcon columnKey="nombre_completo" /></th>
                            <th className="hide-mobile" onClick={() => handleSort('fecha_ingreso')} style={{ cursor: 'pointer' }}>Desde <SortIcon columnKey="fecha_ingreso" /></th>
                            <th className="hide-mobile" onClick={() => handleSort('cupos')} style={{ cursor: 'pointer' }}>Cupos <SortIcon columnKey="cupos" /></th>
                            <th onClick={() => handleSort('saldo_total')} style={{ cursor: 'pointer', textAlign: 'right' }}>Ahorro <SortIcon columnKey="saldo_total" /></th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Cargando socios...</td>
                            </tr>
                        ) : filteredSocios.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No se encontraron socios registrados.
                                </td>
                            </tr>
                        ) : (
                            filteredSocios.map(socio => (
                                <tr key={socio.id} className="table-row-hover">
                                    <td style={{ padding: '15px 20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {socio.numero_socio}
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{socio.nombre_completo}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '4px' }}>
                                            {socio.telefono && <span>📞 {socio.telefono}</span>}
                                            {socio.banco && <span className="hide-mobile">🏦 {socio.banco}</span>}
                                        </div>
                                    </td>
                                    <td className="hide-mobile" style={{ padding: '15px 20px', fontSize: '0.9rem' }}>
                                        {new Date(socio.fecha_ingreso).toLocaleDateString()}
                                    </td>
                                    <td className="hide-mobile" style={{ padding: '15px 20px' }}>
                                        <span style={{
                                            background: '#eff6ff',
                                            color: 'var(--primary)',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            fontSize: '0.85rem'
                                        }}>
                                            {socio.cupos || 1}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>
                                        ${parseFloat(socio.saldo_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            {viewMode === 'active' ? (
                                                <button
                                                    onClick={() => setSelectedSocio(socio)}
                                                    title="Editar Detalle"
                                                    className="btn-icon"
                                                    style={{
                                                        background: '#eff6ff', border: '1px solid #dbeafe',
                                                        padding: '6px', borderRadius: '6px', color: '#2563eb', cursor: 'pointer'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleApprove(socio)}
                                                    className="btn-primary"
                                                    style={{
                                                        padding: '6px 12px', fontSize: '0.8rem',
                                                        background: '#16a34a', border: 'none'
                                                    }}
                                                >
                                                    Aprobar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Import Modal */}
        {showImportModal && (
            <div className="modal-overlay" style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
            }}>
                <div className="glass-panel animate-scale-in" style={{ width: '90%', maxWidth: '400px', padding: '30px' }}>
                    <h3>Importar Socios</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
                        Sube un archivo CSV con las columnas: <br />
                        <code>Nombre, Telefono, Cupos, SaldoInicial</code>
                        <br /><br />
                        <a href="plantilla_socios.csv" download style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}>
                            ⬇️ Descargar Plantilla de Ejemplo
                        </a>
                    </p>

                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setImportFile(e.target.files[0])}
                        style={{ marginBottom: '20px', width: '100%' }}
                    />

                    {importResult && (
                        <div style={{
                            padding: '10px', marginBottom: '15px', borderRadius: '8px', fontSize: '0.9rem',
                            background: importResult.success ? '#dcfce7' : '#fee2e2',
                            color: importResult.success ? '#166534' : '#991b1b'
                        }}>
                            {importResult.message}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button className="btn-secondary" onClick={() => setShowImportModal(false)}>Cerrar</button>
                        <button
                            className="btn-primary"
                            onClick={handleImport}
                            disabled={!importFile || importing}
                        >
                            {importing ? 'Importando...' : 'Subir Archivo'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal de Detalles / Edición */}
        {selectedSocio && (
            <div className="modal-overlay" style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
            }}>
                <div className="glass-panel animate-slide-up" style={{ width: '90%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}>
                    <form onSubmit={handleEditSocio}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User size={20} color="var(--primary)" /> Editar Socio
                            </h3>
                            <button type="button" onClick={() => setSelectedSocio(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="var(--text-muted)" />
                            </button>
                        </div>
                        <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{selectedSocio.nombre_completo}</h2>

                            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Teléfono</label>
                            <input
                                value={selectedSocio.telefono || ''}
                                onChange={e => setSelectedSocio({ ...selectedSocio, telefono: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />

                            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Email</label>
                            <input
                                value={selectedSocio.email || ''}
                                onChange={e => setSelectedSocio({ ...selectedSocio, email: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />

                            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Banco</label>
                            <input
                                value={selectedSocio.banco || ''}
                                onChange={e => setSelectedSocio({ ...selectedSocio, banco: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />

                            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Cuenta / CLABE</label>
                            <input
                                value={selectedSocio.numero_cuenta || ''}
                                onChange={e => setSelectedSocio({ ...selectedSocio, numero_cuenta: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />

                            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Cupos</label>
                            <input
                                type="number"
                                value={selectedSocio.cupos || 1}
                                onChange={e => setSelectedSocio({ ...selectedSocio, cupos: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid var(--border)', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" className="btn-secondary" onClick={() => setSelectedSocio(null)}>Cancelar</button>
                            <button type="submit" className="btn-primary">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showForm && (
            <SocioForm
                onClose={() => setShowForm(false)}
                onSuccess={() => {
                    fetchSocios();
                }}
            />
        )}
    </div>
);
};

export default Socios;
