import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import CerrarCaja from './CerrarCaja';
import '../styles/SecondarySubNavbar.css';

const SecondarySubNavbar = ({ onTransferirMesas, onEstadisticas }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mesasCerradas, setMesasCerradas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const socketConnection = io('http://192.168.1.132:3000');
        setSocket(socketConnection);

        socketConnection.on('mesarecuperada', (mesaActiva) => {
            setMesasCerradas(prevMesas => prevMesas.filter(mesa => mesa._id !== mesaActiva));
            window.location.reload();
        });

        return () => {
            socketConnection.off('mesaRecuperada');
        };
    }, []);

    useEffect(() => {
        const fetchMesasCerradas = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://192.168.1.132:3000/api/mesasEliminadas');
                const data = await response.json();
                setMesasCerradas(data.mesas);
            } catch (error) {
                console.error('Error al obtener las mesas cerradas:', error);
            }
            setLoading(false);
        };

        if (isModalOpen) {
            fetchMesasCerradas();
        }
    }, [isModalOpen]);

    const handleRecuperarMesa = (mesaId) => {
        fetch(`http://192.168.1.132:3000/api/mesasEliminadas/recuperar/${mesaId}`, {
            method: 'POST',
        })
            .then((response) => response.json())
            .then((data) => {
                alert('Mesa recuperada exitosamente');
                socket.emit('mesaRecuperada', mesaId);
                setMesasCerradas(prevMesas => prevMesas.filter(mesa => mesa._id !== mesaId));
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error al recuperar la mesa:', error);
                alert('Hubo un problema al recuperar la mesa');
            });
    };

    const handleUsuariosRedirect = () => {
        navigate('/');
    };

    const handleSetPassword = async () => {
        try {
            const response = await fetch('http://192.168.1.132:3000/api/auth/setPassword', {
                method: 'PUT', // Cambié a PUT para la actualización
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }), // Enviamos la nueva contraseña
            });

            const data = await response.json();

            if (data.success) {
                alert('Contraseña del día establecida exitosamente');
                setIsPasswordModalOpen(false); // Cerrar el modal después de guardar la contraseña
            } else {
                alert(data.message || 'Error al establecer la contraseña');
            }
        } catch (error) {
            console.error('Error al enviar la contraseña:', error);
            alert('Hubo un error al establecer la contraseña');
        }
    };


    useEffect(() => {
        const fetchPassword = async () => {
            try {
                const response = await fetch('http://192.168.1.132:3000/api/auth/getPassword');
                const data = await response.json();
                if (data.success && data.password) {
                    setPassword(data.password); // Establece la contraseña recuperada
                } else {
                    setPassword(''); // Si no hay contraseña, establece un valor vacío
                }
            } catch (error) {
                console.error('Error al obtener la contraseña:', error);
            }
        };

        if (isPasswordModalOpen) {
            fetchPassword(); // Cargar la contraseña cuando se abre el modal
        }
    }, [isPasswordModalOpen]);

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    return (
        <div>
            <div className="secondary-subnavbar">
                <button className="btn" onClick={onTransferirMesas}>
                    Transferir Mesas
                </button>
                <button className="btn" onClick={() => setIsModalOpen(true)}>
                    Recuperar Mesas
                </button>
                <button className="btn" onClick={onEstadisticas}>
                    Estadísticas
                </button>
                <button className="btn" onClick={handleUsuariosRedirect}>
                    Usuarios
                </button>
                {/* Botón para abrir el modal de la contraseña */}
                <button className="btn" onClick={() => setIsPasswordModalOpen(true)}>
                    Contraseña del Día
                </button>
                <div className="secondary-subnavbar">
                    {/* Botón que proviene del componente CerrarCaja */}
                    <CerrarCaja />
                </div>
            </div>

            {/* Modal para la contraseña */}
            {isPasswordModalOpen && (
                <div className="password-modal-overlay">
                    <div className="password-modal-content">
                        <button className="password-modal-close-btn" onClick={() => setIsPasswordModalOpen(false)}>
                            X
                        </button>
                        <h2 className="password-modal-title">Establecer Contraseña del Día</h2>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}  // Muestra u oculta la contraseña
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // Permite modificar la contraseña
                                placeholder="Ingrese la contraseña"
                                className="password-input"
                            />
                            <button className="password-show-btn" onClick={togglePasswordVisibility}>
                                {showPassword ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>
                        <button className="password-btn" onClick={handleSetPassword}>
                            Establecer Contraseña
                        </button>
                    </div>
                </div>
            )}


            {/* Modal superpuesto para recuperar mesas */}
            {isModalOpen && (
                <div className="modal-overlay-recuperar">
                    <div className="modal-content-recuperar">
                        <button className="modal-close-btn-recuperar" onClick={() => setIsModalOpen(false)}>
                            X
                        </button>
                        <h2 className="modal-title-recuperar">Mesas Cerradas</h2>
                        {loading ? (
                            <p className="loading-text-recuperar">Cargando mesas...</p>
                        ) : !Array.isArray(mesasCerradas) || mesasCerradas.length === 0 ? (
                            <p className="no-mesas-recuperar">No hay mesas cerradas.</p>
                        ) : (
                            <ul className="mesas-list-recuperar">
                                {mesasCerradas.map((mesa) => (
                                    <li key={mesa._id} className="mesa-item-recuperar">
                                        {`Mesa ${mesa.numeroMesa}`}
                                        <button className="recover-btn-recuperar" onClick={() => handleRecuperarMesa(mesa._id)}>
                                            Recuperar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecondarySubNavbar;
