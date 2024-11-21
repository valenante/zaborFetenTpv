import React, { useState, useEffect } from 'react';
import Navbar from '../component/Navbar'; // Importa el Navbar
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Estilos para el dashboard
import axios from 'axios'; // Asegúrate de tener axios instalado para las peticiones HTTP
import SubNavbar from '../component/SubNavbar';

const Dashboard = () => {
    const [mesas, setMesas] = useState([]);
    const navigate = useNavigate(); // Instancia de history para redirigir

    // Hacer la solicitud al backend para obtener las mesas
    useEffect(() => {
        axios.get('http://localhost:3000/api/mesas')  // Suponiendo que el backend está en el puerto 3000
            .then(response => {
                setMesas(response.data);  // Almacena los datos de mesas en el estado
            })
            .catch(error => {
                console.error('Error al obtener las mesas:', error);
            });
    }, []);

    // Función para redirigir al detalle de la mesa
    const handleMesaClick = (numeroMesa) => {
        navigate(`/mesas/${numeroMesa}`);  // Redirige a /mesas/:numeroMesa
    };

    return (
        <div className="dashboard">
            <Navbar />  {/* Incluye el Navbar */}
            <SubNavbar />
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
