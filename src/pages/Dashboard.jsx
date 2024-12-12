import React, { useState, useEffect } from 'react';
import Navbar from '../component/Navbar'; // Importa el Navbar
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Estilos para el dashboard
import axios from 'axios'; // Asegúrate de tener axios instalado para las peticiones HTTP
import SubNavbar from '../component/SubNavbar';
import io from 'socket.io-client'; // Importa Socket.IO Client
import SecondarySubNavbar from '../component/SecondarySubNavbar';

const Dashboard = () => {
    const [mesas, setMesas] = useState([]);
    const [mesaNumero, setMesaNumero] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate(); // Instancia de history para redirigir
    const socket = io('http://192.168.1.132:3000'); // Conectar a tu servidor de Socket.IO

    // Hacer la solicitud al backend para obtener las mesas
    useEffect(() => {
        // Obtener las mesas desde el backend
        axios.get('http://192.168.1.132:3000/api/mesas')
            .then(response => {
                setMesas(response.data);  // Almacena los datos de mesas en el estado
            })
            .catch(error => {
                console.error('Error al obtener las mesas:', error);
            });

        // Escuchar eventos de actualización de mesas en tiempo real
        socket.on('mesa-actualizada', (mesaActualizada) => {
            // Actualizar la lista de mesas cuando se recibe una mesa actualizada
            setMesas(prevMesas =>
                prevMesas.map(mesa =>
                    mesa._id === mesaActualizada._id ? mesaActualizada : mesa
                )
            );
        });

        socket.on('mesa-cerrada', (data) => {
            // Actualizar la lista de mesas cuando una mesa se cierra
            setMesas(prevMesas =>
                prevMesas.map(mesa =>
                    mesa.numero === data.mesa.numero ? data.mesa : mesa
                )
            );
        });

        // Limpiar la conexión de Socket.IO cuando el componente se desmonte
        return () => {
            socket.off('mesa-actualizada');
            socket.off('mesa-cerrada');
        };
    }, []);

    // Detectar el tamaño de la pantalla
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Si el ancho de la pantalla es menor o igual a 768px, es móvil
        };

        handleResize(); // Comprobar al cargar el componente
        window.addEventListener('resize', handleResize); // Actualizar cuando la ventana cambie de tamaño

        return () => {
            window.removeEventListener('resize', handleResize); // Limpiar el evento al desmontar
        };
    }, []);

    // Función para redirigir al detalle de la mesa usando su ID
    const handleMesaClick = (mesaId) => {
        navigate(`/mesas/${mesaId}`);  // Redirige a /mesas/:mesaId
    };

    // Manejar el cambio de input del número de mesa
    const handleMesaChange = (e) => {
        setMesaNumero(e.target.value);
    };

    // Manejar el submit del número de mesa (en pantalla móvil)
    const handleSubmitMesa = (e) => {
        e.preventDefault();
        if (mesaNumero) {
            // Buscar la mesa correspondiente al número ingresado
            const mesa = mesas.find(mesa => mesa.numero === parseInt(mesaNumero));
            if (mesa) {
                navigate(`/mesas/${mesa._id}`);  // Redirige al detalle de la mesa usando su ID
            } else {
                console.error('Mesa no encontrada');
            }
        }
    };

    return (
        <div className="dashboard">
            <Navbar /> {/* Incluye el Navbar */}
            <SubNavbar />
            <SecondarySubNavbar />
            <div className="content">
                <div className="section" id="mesas">
                    {/* Si estamos en una pantalla pequeña, mostrar el input para número de mesa */}
                    {isMobile ? (
                        <div className="dashboard-mesa-input-container">
                            <h3 className="dashboard-mesa-input-title">Ingresa el número de mesa</h3>
                            <form
                                onSubmit={handleSubmitMesa}
                                className="dashboard-mesa-input-form"
                            >
                                <input
                                    type="number"
                                    value={mesaNumero}
                                    onChange={handleMesaChange}
                                    placeholder="Número de mesa"
                                    className="dashboard-mesa-input"
                                />
                                <button
                                    type="submit"
                                    className="dashboard-mesa-button"
                                >
                                    Ir a la mesa
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="mesas-container">
                            {mesas.map((mesa) => (
                                <div
                                    key={mesa._id}
                                    className={`mesa-card ${
                                        mesa.estado === 'abierta' ? 'abierta' : 'cerrada'
                                    }`}
                                    onClick={() => handleMesaClick(mesa._id)}
                                >
                                    <p>{mesa.numero}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};    

export default Dashboard;
