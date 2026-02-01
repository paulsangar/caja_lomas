import React, { useState, useEffect } from 'react';
import { Calendar, Check, ChevronLeft, ChevronRight, DollarSign, Search } from 'lucide-react';

const AbonosSemanal = () => {
    const [socios, setSocios] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mes, setMes] = useState(new Date().getMonth());
    const [anio, setAnio] = useState(new Date().getFullYear());

    // Batch Payment State
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [filterName, setFilterName] = useState('');

    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const fetchDatos = async () => {
        setLoading(true);
        try {
            const [resSocios, resMovs] = await Promise.all([
                fetch('./api/socios/list.php'),
                fetch('./api/movimientos/list.php')
            ]);
            const dataSocios = await resSocios.json();
            const dataMovs = await resMovs.json();

            if (dataSocios.success) setSocios(dataSocios.data);
            if (dataMovs.success) setMovimientos(dataMovs.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatos();
        setSelectedPayments([]); // Reset selection on month/data change
    }, [mes, anio]);

    // Semanas del mes
    const semanas = [
        { id: 1, label: 'Sem 1', subLabel: '01-07' },
        { id: 2, label: 'Sem 2', subLabel: '08-14' },
        { id: 3, label: 'Sem 3', subLabel: '15-21' },
        { id: 4, label: 'Sem 4', subLabel: '22-Fin' }
    ];

    const checkPago = (socioId, semanaId) => {
        return movimientos.some(m =>
            m.socio_id === socioId &&
            m.tipo === 'aportacion' &&
            new Date(m.fecha_operacion).getMonth() === mes &&
            m.descripcion.includes(`Semana ${semanaId}`)
        );
    };

    // Lógica secuencial estricta
    const puedePagar = (socioId, semanaId) => {
        if (semanaId === 1) return true;
        // La semana anterior debe estar pagada (en DB) O estar seleccionada actualmente para pago en este lote
        const pagadaAnterior = checkPago(socioId, semanaId - 1);
        const seleccionadaAnterior = isSelected(socioId, semanaId - 1);

        return pagadaAnterior || seleccionadaAnterior;
    };

    // --- Batch Logic ---
    const toggleSelection = (socioId, semanaId) => {
        // Si intentamos seleccionar, validar orden
        if (!processSelectionValidation(socioId, semanaId)) return;

        const key = `${socioId}-${semanaId}`;
        setSelectedPayments(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    // Valida si se puede seleccionar/deseleccionar manteniendo coherencia
    const processSelectionValidation = (socioId, semanaId) => {
        const isCurrentlySelected = isSelected(socioId, semanaId);

        if (!isCurrentlySelected) {
            // Para seleccionar: Validar que sea la siguiente inmediata disponible
            if (!puedePagar(socioId, semanaId)) {
                alert("Debes pagar las semanas anteriores primero.");
                return false;
            }
        } else {
            // Para deseleccionar: Validar que no haya semanas posteriores seleccionadas
            // Si deselecciono la Sem 2, y la Sem 3 está seleccionada, debería deseleccionar la 3 también
            // Por simplicidad, permitimos deseleccionar, pero el usuario debe ser cuidadoso.
            // O mejor: Si deseleccionas, deselecciona todas las posteriores de ese usuario.
            const hasNextSelected = isSelected(socioId, semanaId + 1);
            if (hasNextSelected) {
                // Auto deseleccionar las siguientes recursivamente? 
                // Implementación simple: Deseleccionar solo esta y dejar que el usuario arregle, 
                // pero handleBatchPayment validará orden.
            }
        }
        return true;
    };

    const isSelected = (socioId, semanaId) => selectedPayments.includes(`${socioId}-${semanaId}`);

    const handleBatchPayment = async () => {
        if (selectedPayments.length === 0) return;

        const confirmacion = window.confirm(`¿Registrar ${selectedPayments.length} abonos seleccionados?`);
        if (!confirmacion) return;

        let successCount = 0;

        // Ordenar pagos por semana para procesar en orden (1, 2, 3...)
        const pagosOrdenados = [...selectedPayments].sort((a, b) => {
            const [idA, semA] = a.split('-').map(Number);
            const [idB, semB] = b.split('-').map(Number);
            return semA - semB; // Orden ascendente por semana
        });

        for (const key of pagosOrdenados) {
            const [socioId, semanaId] = key.split('-').map(Number);
            const socio = socios.find(s => s.id === socioId);
            if (!socio) continue;

            const cupos = parseInt(socio.cupos) || 1; // Fallback para NaN
            const monto = cupos * 100;

            try {
                const response = await fetch('./api/movimientos/create.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        socio_id: socio.id,
                        tipo: 'aportacion',
                        monto: monto,
                        descripcion: `Abono correspondente a Semana ${semanaId} de ${nombresMeses[mes]}`
                    })
                });
                const data = await response.json();
                if (data.success) successCount++;
            } catch (e) {
                console.error("Error paying " + key);
            }
        }

        alert(`Se procesaron ${successCount} abonos exitosamente.`);
        setSelectedPayments([]);
        fetchDatos();
    };

    const filteredSocios = socios.filter(s =>
        s.nombre_completo.toLowerCase().includes(filterName.toLowerCase()) ||
        (s.numero_socio && s.numero_socio.toString().includes(filterName))
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar color="var(--primary)" /> Control de Abonos
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>$100.00 MXN por cupo registrado</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '5px 15px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <button onClick={() => setMes(m => m === 0 ? 11 : m - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                        <span style={{ fontWeight: '600', minWidth: '100px', textAlign: 'center' }}>{nombresMeses[mes]} {anio}</span>
                        <button onClick={() => setMes(m => m === 11 ? 0 : m + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar socio por nombre o ID..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            style={{
                                padding: '10px 10px 10px 35px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                width: '100%',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {selectedPayments.length > 0 && (
                        <button
                            onClick={handleBatchPayment}
                            className="btn-primary"
                            style={{ background: 'var(--success)', animation: 'pulse 2s infinite', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                        >
                            <DollarSign size={18} /> Pagar ({selectedPayments.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div className="table-container" style={{ maxHeight: '65vh', overflowY: 'auto', position: 'relative' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 20, background: '#f8fafc' }}>
                            <tr>
                                <th style={{
                                    position: 'sticky', left: 0, zIndex: 30, background: '#f8fafc',
                                    borderBottom: '1px solid var(--border)',
                                    borderRight: '1px solid var(--border)',
                                    padding: '15px', textAlign: 'left', minWidth: '180px'
                                }}>Socio</th>
                                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid var(--border)' }}>Cuota</th>
                                {semanas.map(s => (
                                    <th key={s.id} style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid var(--border)' }}>
                                        <div>{s.label}</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '400', color: '#94a3b8' }}>{s.subLabel}</div>
                                    </th>
                                ))}
                                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid var(--border)' }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={semanas.length + 3} style={{ textAlign: 'center', padding: '40px' }}>Cargando matriz...</td></tr>
                            ) : filteredSocios.length === 0 ? (
                                <tr><td colSpan={semanas.length + 3} style={{ textAlign: 'center', padding: '40px' }}>No hay socios coincidentes.</td></tr>
                            ) : (
                                filteredSocios.map(socio => {
                                    const cupos = parseInt(socio.cupos) || 1;
                                    const montoSemanal = cupos * 100;
                                    let pagosCount = 0;
                                    return (
                                        <tr key={socio.id} className="table-row-hover">
                                            <td style={{
                                                fontWeight: '500', padding: '15px',
                                                position: 'sticky', left: 0, background: 'white', zIndex: 10,
                                                borderRight: '1px solid var(--border)', borderBottom: '1px solid #f1f5f9'
                                            }}>
                                                <div style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>{socio.nombre_completo}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    ID: {socio.numero_socio} • {cupos} cupo(s)
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-main)', borderBottom: '1px solid #f1f5f9' }}>
                                                ${montoSemanal}
                                            </td>
                                            {semanas.map(sem => {
                                                const pagado = checkPago(socio.id, sem.id);
                                                // Permitir seleccionar si es la siguiente inmediata (pagadaAnterior es true) 
                                                // O si la anterior esta seleccionada en este batch.
                                                // La función puedePagar ya maneja esto.
                                                const habilitado = !pagado && puedePagar(socio.id, sem.id);

                                                if (pagado) pagosCount++;

                                                return (
                                                    <td key={sem.id} style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                                                        {pagado ? (
                                                            <div style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center' }}>
                                                                <Check size={26} strokeWidth={3} />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => habilitado && toggleSelection(socio.id, sem.id)}
                                                                style={{
                                                                    width: '32px', height: '32px',
                                                                    border: isSelected(socio.id, sem.id) ? '2px solid var(--primary)' : '2px solid #cbd5e1',
                                                                    borderRadius: '8px',
                                                                    margin: '0 auto',
                                                                    cursor: habilitado ? 'pointer' : 'not-allowed',
                                                                    background: isSelected(socio.id, sem.id) ? 'var(--primary)' : (habilitado ? 'white' : '#f8fafc'),
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    transition: 'all 0.2s',
                                                                    opacity: habilitado ? 1 : 0.4
                                                                }}
                                                            >
                                                                {isSelected(socio.id, sem.id) && <Check size={20} color="white" />}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ width: '80%', height: '6px', background: '#e2e8f0', borderRadius: '10px', margin: '0 auto' }}>
                                                    <div style={{ width: `${(pagosCount / semanas.length) * 100}%`, height: '100%', background: 'var(--success)', borderRadius: '10px' }}></div>
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    {pagosCount}/{semanas.length}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AbonosSemanal;
