import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Importa useNavigate para redirigir
import '../styles/SecondarySubNavbar.css'; // Archivo CSS para estilos personalizados

const SecondarySubNavbar = ({ onTransferirMesas, onEstadisticas }) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para mostrar el modal
    const [mesasCerradas, setMesasCerradas] = useState([]); // Estado para almacenar las mesas cerradas
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();  // Inicializa el hook de navegación

    useEffect(() => {
        // Función para obtener las mesas cerradas desde el backend
        const fetchMesasCerradas = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://192.168.1.132:3000/api/mesasEliminadas'); // Aquí debe estar tu endpoint para obtener mesas cerradas
                const data = await response.json();
                console.log(data);
                setMesasCerradas(data.mesas); // Suponemos que el backend devuelve un array de mesas cerradas
            } catch (error) {
                console.error('Error al obtener las mesas cerradas:', error);
            }
            setLoading(false);
        };

        if (isModalOpen) {
            fetchMesasCerradas(); // Cargar mesas cuando el modal se abre
        }
    }, [isModalOpen]);

    const handleRecuperarMesa = (mesaId) => {
        // Función para recuperar una mesa cuando el usuario haga clic
        fetch(`http://192.168.1.132:3000/api/mesasEliminadas/recuperar/${mesaId}`, {
            method: 'POST',
        })
            .then((response) => response.json())
            .then((data) => {
                alert('Mesa recuperada exitosamente');
                setIsModalOpen(false); // Cerrar el modal después de recuperar la mesa
            })
            .catch((error) => {
                console.error('Error al recuperar la mesa:', error);
                alert('Hubo un problema al recuperar la mesa');
            });
    };

    // Función para redirigir a la página principal (/)
    const handleUsuariosRedirect = () => {
        navigate('/'); // Redirige a la página principal
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
                {/* Botón Usuarios que redirige a la página principal */}
                <button className="btn" onClick={handleUsuariosRedirect}>
                    Usuarios
                </button>
            </div>

            {/* Modal superpuesto */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                            X
                        </button>
                        <h2 className="modal-title">Mesas Cerradas</h2>
                        {loading ? (
                            <p className="loading-text">Cargando mesas...</p>
                        ) : !Array.isArray(mesasCerradas) || mesasCerradas.length === 0 ? (
                            <p className="no-mesas">No hay mesas cerradas.</p>
                        ) : (
                            <ul className="mesas-list">
                                {mesasCerradas.map((mesa) => (
                                    <li key={mesa._id} className="mesa-item">
                                        {`Mesa ${mesa.numeroMesa}`}
                                        <button className="recover-btn" onClick={() => handleRecuperarMesa(mesa._id)}>
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
