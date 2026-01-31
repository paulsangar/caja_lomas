import React, { useState, useEffect } from 'react';
import { Calendar, Check, AlertCircle, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';

const AbonosSemanal = () => {
    const [socios, setSocios] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mes, setMes] = useState(new Date().getMonth());
    const [anio, setAnio] = useState(new Date().getFullYear());

    // Batch Payment State
    const [selectedPayments, setSelectedPayments] = useState([]);

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

    // Semanas del mes (simplificado 1-4)
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
        return checkPago(socioId, semanaId - 1); // Debe haber pagado la anterior
    };

    // --- Batch Logic ---
    const toggleSelection = (socioId, semanaId) => {
        const key = `${socioId}-${semanaId}`;
        setSelectedPayments(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const isSelected = (socioId, semanaId) => selectedPayments.includes(`${socioId}-${semanaId}`);

    const handleBatchPayment = async () => {
        if (selectedPayments.length === 0) return;

        const confirmacion = window.confirm(`¿Registrar ${selectedPayments.length} abonos seleccionados?`);
        if (!confirmacion) return;

        let successCount = 0;

        // Procesar en serie para evitar race conditions en servidor simple
        for (const key of selectedPayments) {
            const [socioId, semanaId] = key.split('-').map(Number);
            const socio = socios.find(s => s.id === socioId);
            if (!socio) continue;

            const monto = socio.cupos * 100;

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

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar color="var(--primary)" /> Control de Abonos Seemanales
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>$100.00 MXN por cupo registrado</p>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    {selectedPayments.length > 0 && (
                        <button
                            onClick={handleBatchPayment}
                            className="btn-primary"
                            style={{ background: 'var(--success)', animation: 'pulse 2s infinite', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <DollarSign size={18} /> Pagar ({selectedPayments.length})
                        </button>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '5px 15px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <button onClick={() => setMes(m => m === 0 ? 11 : m - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                        <span style={{ fontWeight: '600', minWidth: '100px', textAlign: 'center' }}>{nombresMeses[mes]} {anio}</span>
                        <button onClick={() => setMes(m => m === 11 ? 0 : m + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '250px' }}>Socio / Información</th>
                                <th style={{ textAlign: 'center' }}>Cuota Semanal</th>
                                {semanas.map(s => (
                                    <th key={s.id} style={{ textAlign: 'center' }}>
                                        <div>{s.label}</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '400', color: '#94a3b8' }}>{s.subLabel}</div>
                                    </th>
                                ))}
                                <th style={{ textAlign: 'center' }}>Progreso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={semanas.length + 3} style={{ textAlign: 'center', padding: '40px' }}>Cargando matriz...</td></tr>
                            ) : socios.length === 0 ? (
                                <tr><td colSpan={semanas.length + 3} style={{ textAlign: 'center', padding: '40px' }}>No hay socios.</td></tr>
                            ) : (
                                socios.map(socio => {
                                    const montoSemanal = socio.cupos * 100;
                                    let pagosCount = 0;
                                    return (
                                        <tr key={socio.id} className="table-row-hover">
                                            <td style={{ fontWeight: '500', padding: '15px' }}>
                                                <div style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>{socio.nombre_completo}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    ID: {socio.numero_socio} • {socio.cupos} cupo(s)
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-main)' }}>
                                                ${montoSemanal}
                                            </td>
                                            {semanas.map(sem => {
                                                const pagado = checkPago(socio.id, sem.id);
                                                const habilitado = puedePagar(socio.id, sem.id);
                                                if (pagado) pagosCount++;

                                                return (
                                                    <td key={sem.id} style={{ textAlign: 'center', padding: '10px' }}>
                                                        {pagado ? (
                                                            <div style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center' }}>
                                                                <Check size={26} strokeWidth={3} />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => habilitado && toggleSelection(socio.id, sem.id)}
                                                                style={{
                                                                    width: '28px', height: '28px',
                                                                    border: isSelected(socio.id, sem.id) ? '2px solid var(--primary)' : '2px solid #cbd5e1',
                                                                    borderRadius: '6px',
                                                                    margin: '0 auto',
                                                                    cursor: habilitado ? 'pointer' : 'not-allowed',
                                                                    background: isSelected(socio.id, sem.id) ? 'var(--primary)' : (habilitado ? 'white' : '#f1f5f9'),
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    transition: 'all 0.2s',
                                                                    opacity: habilitado ? 1 : 0.4
                                                                }}
                                                            >
                                                                {isSelected(socio.id, sem.id) && <Check size={18} color="white" />}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td style={{ textAlign: 'center' }}>
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
