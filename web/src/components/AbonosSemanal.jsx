import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, AlertCircle, Save, ChevronLeft, ChevronRight } from 'lucide-react';

const AbonosSemanal = () => {
    const [socios, setSocios] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mes, setMes] = useState(new Date().getMonth());
    const [anio, setAnio] = useState(new Date().getFullYear());

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
    }, []);

    // Función para obtener las semanas del mes seleccionado
    const getSemanasDelMes = (m, a) => {
        const semanas = [];
        const primerDia = new Date(a, m, 1);
        const ultimoDia = new Date(a, m + 1, 0);

        // Simplificado: 4 semanas por mes para control de caja
        return [
            { id: 1, label: 'Sem 1' },
            { id: 2, label: 'Sem 2' },
            { id: 3, label: 'Sem 3' },
            { id: 4, label: 'Sem 4' }
        ];
    };

    const semanas = getSemanasDelMes(mes, anio);

    const checkPago = (socioId, semanaId) => {
        // Lógica simplificada: buscar si hay un movimiento de aportación en ese mes/semana
        // Por ahora buscamos coincidencias en la descripción o fecha para demo
        return movimientos.some(m =>
            m.socio_id === socioId &&
            m.tipo === 'aportacion' &&
            new Date(m.fecha_operacion).getMonth() === mes &&
            m.descripcion.includes(`Semana ${semanaId}`)
        );
    };

    const registrarAbono = async (socio, semanaId) => {
        const monto = socio.cupos * 100;
        const confirmacion = window.confirm(`¿Registrar abono de $${monto} para ${socio.nombre_completo} (Semana ${semanaId})?`);

        if (!confirmacion) return;

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
            if (data.success) {
                fetchDatos(); // Recargar datos
            }
        } catch (error) {
            alert('Error al registrar abono');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar color="var(--primary)" /> Control de Abonos Semanales
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>$100.00 MXN por cupo registrado</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'white', padding: '5px 15px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <button onClick={() => setMes(m => m === 0 ? 11 : m - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                    <span style={{ fontWeight: '600', minWidth: '100px', textAlign: 'center' }}>{nombresMeses[mes]} {anio}</span>
                    <button onClick={() => setMes(m => m === 11 ? 0 : m + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '250px' }}>Socio / Cupos</th>
                                <th style={{ textAlign: 'center' }}>Monto Semanal</th>
                                {semanas.map(s => (
                                    <th key={s.id} style={{ textAlign: 'center' }}>{s.label}</th>
                                ))}
                                <th style={{ textAlign: 'center' }}>Total Mes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={semanas.length + 3} style={{ textAlign: 'center', padding: '40px' }}>Cargando matriz de pagos...</td></tr>
                            ) : socios.length === 0 ? (
                                <tr><td colSpan={semanas.length + 3} style={{ textAlign: 'center', padding: '40px' }}>No hay socios registrados.</td></tr>
                            ) : (
                                socios.map(socio => {
                                    const montoSemanal = socio.cupos * 100;
                                    let pagosMes = 0;
                                    return (
                                        <tr key={socio.id} className="table-row-hover">
                                            <td style={{ fontWeight: '500' }}>
                                                <div>{socio.nombre_completo}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {socio.cupos} {socio.cupos === 1 ? 'cupo' : 'cupos'} registrado(s)
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--primary)' }}>
                                                ${montoSemanal.toLocaleString()}
                                            </td>
                                            {semanas.map(sem => {
                                                const pagado = checkPago(socio.id, sem.id);
                                                if (pagado) pagosMes += montoSemanal;
                                                return (
                                                    <td key={sem.id} style={{ textAlign: 'center' }}>
                                                        {pagado ? (
                                                            <div style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center' }}>
                                                                <Check size={22} strokeWidth={3} />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => registrarAbono(socio, sem.id)}
                                                                style={{
                                                                    background: '#f1f5f9',
                                                                    border: '1px dashed #cbd5e1',
                                                                    borderRadius: '6px',
                                                                    padding: '4px 8px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.75rem',
                                                                    color: '#64748b'
                                                                }}
                                                            >
                                                                Cobrar
                                                            </button>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid var(--border)', background: '#f8fafc' }}>
                                                ${pagosMes.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--success)' }}></div> Pagado
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px dashed #cbd5e1', background: '#f1f5f9' }}></div> Pendiente
                </div>
            </div>
        </div>
    );
};

export default AbonosSemanal;
