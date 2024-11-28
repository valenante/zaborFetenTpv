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
    const navigate = useNavigate(); // Instancia de history para redirigir
    const socket = io('http://localhost:3000'); // Conectar a tu servidor de Socket.IO

    // Hacer la solicitud al backend para obtener las mesas
    useEffect(() => {
        // Obtener las mesas desde el backend
        axios.get('http://localhost:3000/api/mesas')  
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

    // Función para redirigir al detalle de la mesa
    const handleMesaClick = (numeroMesa) => {
        navigate(`/mesas/${numeroMesa}`);  // Redirige a /mesas/:numeroMesa
    };

    return (
        <div className="dashboard">
            <Navbar />  {/* Incluye el Navbar */}
            <SubNavbar />
            <SecondarySubNavbar />
            <div className="content">
                <div className="section" id="mesas">
                    <div className="mesas-container">
                        {/* Aquí se mapean las mesas */}
                        {mesas.map(mesa => (
                            <div
                                key={mesa._id}
                                className={`mesa-card ${mesa.estado === 'abierta' ? 'abierta' : 'cerrada'}`}
                                onClick={() => handleMesaClick(mesa.numero)}
                            >
                                <p>{mesa.numero}</p> {/* Suponiendo que cada mesa tiene un campo "numero" */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
