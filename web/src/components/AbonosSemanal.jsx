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
    const mesesCortos = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

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

    // Generar cabeceras tipo "ENE 1", "ENE 2"
    const mesCorto = mesesCortos[mes];
    const semanas = [
        { id: 1, label: `${mesCorto} 1`, subLabel: '01-07' },
        { id: 2, label: `${mesCorto} 2`, subLabel: '08-14' },
        { id: 3, label: `${mesCorto} 3`, subLabel: '15-21' },
        { id: 4, label: `${mesCorto} 4`, subLabel: '22-Fin' }
    ];

    const checkPago = (socioId, semanaId) => {
        return movimientos.some(m =>
            m.socio_id === socioId &&
            m.tipo === 'aportacion' &&
            new Date(m.fecha_operacion).getMonth() === mes &&
            m.descripcion.includes(`Semana ${semanaId}`)
        );
    };

    const isSelected = (socioId, semanaId) => selectedPayments.includes(`${socioId}-${semanaId}`);

    // Lógica secuencial estricta
    const puedePagar = (socioId, semanaId) => {
        if (semanaId === 1) return true;
        // La semana anterior debe estar pagada (en DB) O estar seleccionada actualmente para pago en este lote
        const pagadaAnterior = checkPago(socioId, semanaId - 1);
        const seleccionadaAnterior = isSelected(socioId, semanaId - 1);

        return pagadaAnterior || seleccionadaAnterior;
    };

    const toggleSelection = (socioId, semanaId) => {
        const pagado = checkPago(socioId, semanaId);
        if (pagado) return; // Ya pagado, no hacer nada

        const currentlySelected = isSelected(socioId, semanaId);

        if (!currentlySelected) {
            // Intentando SELECCIONAR
            if (!puedePagar(socioId, semanaId)) {
                // Feedback visual simple (shake o alert opcional, aquí solo bloqueo)
                return;
            }
            setSelectedPayments(prev => [...prev, `${socioId}-${semanaId}`]);
        } else {
            // Intentando DESELECCIONAR
            // Si deselecciono una semana intermedia, debo deseleccionar todas las posteriores de este mes
            // para mantener la integridad secuencial.
            const newSelection = selectedPayments.filter(key => {
                const [sId, sSem] = key.split('-').map(Number);
                if (sId !== socioId) return true; // Mantener otros socios
                // Para este socio, mantener solo si la semana es MENOR a la deseleccionada
                return sSem < semanaId;
            });
            setSelectedPayments(newSelection);
        }
    };

    const handleBatchPayment = async () => {
        if (selectedPayments.length === 0) return;

        const confirmacion = window.confirm(`¿Registrar ${selectedPayments.length} abonos seleccionados?`);
        if (!confirmacion) return;

        let successCount = 0;

        // Ordenar pagos por semana para procesar en orden (1, 2, 3...)
        const pagosOrdenados = [...selectedPayments].sort((a, b) => {
            const [idA, semA] = a.split('-').map(Number);
            const [idB, semB] = b.split('-').map(Number);
            return semA - semB;
        });

        for (const key of pagosOrdenados) {
            const [socioId, semanaId] = key.split('-').map(Number);
            const socio = socios.find(s => s.id === socioId);
            if (!socio) continue;

            const cupos = parseInt(socio.cupos) || 1;
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
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    {/* Navegación Mes */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: 'auto' }}>
                        <button onClick={() => setMes(m => m === 0 ? 11 : m - 1)} className="btn-secondary" style={{ padding: '5px 10px' }}><ChevronLeft size={16} /></button>
                        <span style={{ fontWeight: '700', minWidth: '120px', textAlign: 'center', fontSize: '1rem' }}>{nombresMeses[mes]} {anio}</span>
                        <button onClick={() => setMes(m => m === 11 ? 0 : m + 1)} className="btn-secondary" style={{ padding: '5px 10px' }}><ChevronRight size={16} /></button>
                    </div>

                    <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar socio..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            style={{
                                padding: '8px 8px 8px 32px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                width: '100%',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    {selectedPayments.length > 0 && (
                        <button
                            onClick={handleBatchPayment}
                            className="btn-primary"
                            style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                        >
                            Pagar ({selectedPayments.length})
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
                                    padding: '10px', textAlign: 'left', minWidth: '160px',
                                    fontSize: '0.75rem'
                                }}>SOCIO</th>
                                <th style={{ textAlign: 'center', padding: '10px 5px', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', width: '70px' }}>CUOTA</th>
                                {semanas.map(s => (
                                    <th key={s.id} style={{ textAlign: 'center', padding: '10px 5px', borderBottom: '1px solid var(--border)', width: '80px' }}>
                                        <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.75rem' }}>{s.label}</div>
                                    </th>
                                ))}
                                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid var(--border)', width: '60px' }}>%</th>
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
                                                fontWeight: '500', padding: '10px 15px',
                                                position: 'sticky', left: 0, background: 'white', zIndex: 10,
                                                borderRight: '1px solid var(--border)', borderBottom: '1px solid #f1f5f9'
                                            }}>
                                                <div style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '0.85rem' }}>{socio.nombre_completo}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {socio.numero_socio} • {cupos}c
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-main)', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                                                ${montoSemanal}
                                            </td>
                                            {semanas.map(sem => {
                                                const pagado = checkPago(socio.id, sem.id);
                                                const habilitado = !pagado && puedePagar(socio.id, sem.id);
                                                const selected = isSelected(socio.id, sem.id);

                                                if (pagado) pagosCount++;

                                                return (
                                                    <td key={sem.id} style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
                                                        {pagado ? (
                                                            <div style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center' }}>
                                                                <Check size={20} strokeWidth={4} />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => toggleSelection(socio.id, sem.id)}
                                                                style={{
                                                                    width: '24px', height: '24px',
                                                                    border: selected ? '2px solid var(--primary)' : '2px solid #cbd5e1',
                                                                    borderRadius: '6px',
                                                                    margin: '0 auto',
                                                                    cursor: habilitado ? 'pointer' : 'not-allowed',
                                                                    background: selected ? 'var(--primary)' : (habilitado ? 'white' : '#f1f5f9'),
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    transition: 'all 0.1s',
                                                                    opacity: habilitado || selected ? 1 : 0.3
                                                                }}
                                                            >
                                                                {selected && <Check size={14} color="white" />}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ width: '40px', height: '6px', background: '#e2e8f0', borderRadius: '10px', margin: '0 auto' }}>
                                                    <div style={{ width: `${(pagosCount / semanas.length) * 100}%`, height: '100%', background: 'var(--success)', borderRadius: '10px' }}></div>
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
