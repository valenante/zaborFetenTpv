import React, { useState, useEffect } from 'react';
import '../styles/SecondarySubNavbar.css';

const CerrarCaja = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal de resumen de caja
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Modal para ingresar la contraseña
    const [resumenCaja, setResumenCaja] = useState({ efectivo: 0, tarjeta: 0, total: 0 });
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState(''); // Estado para la contraseña
    const [passwordFromDB, setPasswordFromDB] = useState(''); // Contraseña desde la DB

    // Función para recuperar la contraseña del día desde la base de datos
    const obtenerContraseñaDelDia = async () => {
        try {
            const response = await fetch('http://192.168.1.132:3000/api/auth/getPassword'); // Ruta de la API
            const data = await response.json();
            if (data && data.password) {
                setPasswordFromDB(data.password);
            } else {
                alert('No se pudo obtener la contraseña del día.');
            }
        } catch (error) {
            console.error('Error al obtener la contraseña:', error);
            alert('Hubo un error al obtener la contraseña del día.');
        }
    };

    // Función para calcular el resumen de caja
    const calcularCaja = async () => {
        setLoading(true);
        await obtenerContraseñaDelDia(); // Recuperar la contraseña del día al abrir el modal
        try {
            const response = await fetch('http://192.168.1.132:3000/api/mesasEliminadas');
            const data = await response.json();

            const efectivo = data.mesas.reduce((acc, mesa) => acc + (mesa.metodoPago?.efectivo || 0), 0);
            const tarjeta = data.mesas.reduce((acc, mesa) => acc + (mesa.metodoPago?.tarjeta || 0), 0);
            const total = efectivo + tarjeta;

            setResumenCaja({ efectivo, tarjeta, total });
        } catch (error) {
            console.error('Error al calcular la caja:', error);
            alert('Hubo un error al calcular el resumen de la caja.');
        }
        setLoading(false);
    };

    // Función para verificar la contraseña
    const verificarContraseña = () => {
        if (password === passwordFromDB) {
            cerrarCaja(); // Si la contraseña es correcta, cierra la caja
        } else {
            alert('Contraseña incorrecta. Intenta de nuevo.');
            setPassword(''); // Limpiar el campo de la contraseña
        }
    };

    // Función para enviar el resumen por correo y limpiar la base de datos
    const cerrarCaja = async () => {
        setLoading(true);
        try {
            // Generar y enviar el informe por correo
            const informeResponse = await fetch('http://192.168.1.132:3000/api/caja/enviarInforme', {
                method: 'POST',
            });
            const informeResult = await informeResponse.json();
            if (!informeResult.success) throw new Error('Error al enviar el informe por correo.');

            // Vaciar las colecciones
            const limpiarResponse = await fetch('http://192.168.1.132:3000/api/caja/limpiar', {
                method: 'POST',
            });
            const limpiarResult = await limpiarResponse.json();
            if (!limpiarResult.success) throw new Error('Error al limpiar las colecciones.');

            //Refrescar la página
            alert('Caja cerrada exitosamente. Informe enviado.');

            window.location.reload();

            setIsModalOpen(false); // Cierra el modal de resumen de caja
        } catch (error) {
            console.error('Error al cerrar la caja:', error);
            alert('Hubo un problema al cerrar la caja.');
        }
        setLoading(false);
    };

    return (
        <div>
            {/* Botón para abrir el modal con el resumen de la caja */}
            <button className="btn" onClick={() => { setIsModalOpen(true); calcularCaja(); }}>
                Cerrar Caja
            </button>

            {/* Modal con el resumen de la caja */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                            X
                        </button>
                        <h2 className="modal-title">Resumen de Caja</h2>

                        {loading ? (
                            <p className="loading-text">Calculando...</p>
                        ) : (
                            <div>
                                <p>Efectivo: {resumenCaja.efectivo.toFixed(2)} €</p>
                                <p>Tarjeta: {resumenCaja.tarjeta.toFixed(2)} €</p>
                                <p><strong>Total: {resumenCaja.total.toFixed(2)} €</strong></p>

                                {/* Botón para abrir el modal de la contraseña */}
                                <button
                                    className="btn"
                                    onClick={() => setIsPasswordModalOpen(true)} // Abre el modal para ingresar la contraseña
                                    disabled={loading}
                                >
                                    Confirmar y Cerrar Caja
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal para ingresar la contraseña */}
            {isPasswordModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-btn" onClick={() => setIsPasswordModalOpen(false)}>
                            X
                        </button>
                        <h2 className="modal-title">Ingrese la Contraseña</h2>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="btn" onClick={verificarContraseña}>
                            Verificar Contraseña
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CerrarCaja;
