import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../styles/Barra.css';  // Asegúrate de tener un archivo de estilo similar para el componente Barra

const Barra = () => {
    const [pedidosBebidas, setPedidosBebidas] = useState([]);
    const [mostrarTerminados, setMostrarTerminados] = useState(false);
    const [mesas, setMesas] = useState([]);
    const socket = io('http://192.168.1.132:3000'); // Cambia la URL si es necesario

    useEffect(() => {
        // Suscribirse a los eventos del socket
        socket.on('nuevoPedidoBebida', (pedidoBebida) => {
            console.log('Nuevo pedido de bebida recibido:', pedidoBebida);
            // Obtener los pedidos actualizados desde el servidor en lugar de solo actualizar localmente
            axios.get('http://192.168.1.132:3000/api/pedidoBebidas')
                .then((response) => {
                    setPedidosBebidas(response.data); // Actualiza el estado con los pedidos actualizados
                })
                .catch((error) => {
                    console.error('Error obteniendo pedidos de bebidas:', error);
                });
        });

        socket.on('estadoPedidoBebidaActualizado', (pedidoBebidaActualizado) => {
            setPedidosBebidas((prevPedidosBebidas) =>
                prevPedidosBebidas.map((pedidoBebida) =>
                    pedidoBebida.id === pedidoBebidaActualizado.id ? pedidoBebidaActualizado : pedidoBebida
                )
            );
        });

        socket.on('pedidoBebidaActualizado', (pedidoBebidaActualizado) => {
            setPedidosBebidas((prevPedidosBebidas) =>
                prevPedidosBebidas.map((pedidoBebida) =>
                    pedidoBebida.id === pedidoBebidaActualizado.bebidaId
                        ? {
                            ...pedidoBebida,
                            bebidas: pedidoBebida.bebidas.map((bebida) =>
                                bebida.id === pedidoBebidaActualizado.bebidasid
                                    ? {
                                        ...bebida,
                                        estadoPreparacion: pedidoBebidaActualizado.estadoPreparacion // Solo actualiza el estado del bebida
                                    }
                                    : bebida
                            )
                        }
                        : pedidoBebida
                )
            );
        });

        socket.on('pedidoBebidaFinalizado', (pedidoBebidaActualizado) => {
            setPedidosBebidas((prevPedidosBebidas) =>
                prevPedidosBebidas.map((pedidoBebida) =>
                    pedidoBebida.id === pedidoBebidaActualizado.id
                        ? { ...pedidoBebida, estado: 'completado' }
                        : pedidoBebida
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []); 

    useEffect(() => {
        // Obtener todos los pedidos de bebidas al cargar el componente
        axios
            .get('http://192.168.1.132:3000/api/pedidoBebidas')
            .then((response) => {
                setPedidosBebidas(response.data);
            })
            .catch((error) => {
                console.error('Error obteniendo pedidos de bebidas:', error);
            });

        // Obtener todas las mesas al cargar el componente
        axios
            .get('http://192.168.1.132:3000/api/mesas')
            .then((response) => {
                setMesas(response.data);
            })
            .catch((error) => {
                console.error('Error obteniendo mesas:', error);
            });
    }, []);

    // Función para obtener el número de la mesa basado en el id
    const obtenerNumeroMesa = (mesaId) => {
        const mesa = mesas.find((mesa) => mesa._id === mesaId);
        return mesa ? mesa.numero : 'Desconocido';
    };

    const marcarComoTerminado = (pedidoBebidaId) => {
        const pedidoBebida = pedidosBebidas.find((pedidoBebida) => pedidoBebida._id === pedidoBebidaId);

        if (!pedidoBebida) {
            console.log('Pedido de bebida no encontrado');
            return;
        }

        const todosLosbebidasListos = pedidoBebida.bebidas.every(
            (bebida) => bebida.estadoPreparacion === 'listo'
        );

        if (!todosLosbebidasListos) {
            console.log('No todos los bebidas de bebida están listos para ser terminados.');
            return;
        }

        axios
            .put(`http://192.168.1.132:3000/api/pedidoBebidas/${pedidoBebidaId}/completado`)
            .then((response) => {
                if (response.status === 200) {
                    setPedidosBebidas((prevPedidosBebidas) =>
                        prevPedidosBebidas.map((pedidoBebida) =>
                            pedidoBebida._id === pedidoBebidaId
                                ? { ...pedidoBebida, estado: 'completado' }
                                : pedidoBebida
                        )
                    );
                }
            })
            .catch((error) => {
                console.error('Error al actualizar estado del pedido de bebida:', error);
            });
    };

    const actualizarEstadoPreparacion = (pedidoBebidaId, bebidaId, estado) => {
        axios
            .put(`http://192.168.1.132:3000/api/pedidoBebidas/${pedidoBebidaId}/bebida/${bebidaId}/listo`)
            .then(() => {
                setPedidosBebidas((prevPedidosBebidas) =>
                    prevPedidosBebidas.map((pedidoBebida) =>
                        pedidoBebida.id === pedidoBebidaId
                            ? {
                                ...pedidoBebida,
                                bebidas: pedidoBebida.bebidas.map((bebida) =>
                                    bebida.id === bebidaId
                                        ? {
                                            ...bebida,
                                            estadoPreparacion: estado, // Actualiza el estado del bebida
                                        }
                                        : bebida
                                ),
                            }
                            : pedidoBebida
                    )
                );
            })
            .catch((error) => {
                console.error('Error al actualizar estado de preparación de bebida:', error);
            });
    };

    const manejarCambioCheckbox = (pedidoBebidaId, bebidaId) => {
        const pedidoBebida = pedidosBebidas.find((pedidoBebida) => pedidoBebida._id === pedidoBebidaId);

        if (!pedidoBebida || !pedidoBebida.bebidas) {
            console.error('Pedido de bebida o bebidas no encontrados');
            return;
        }

        const bebida = pedidoBebida.bebidas.find((bebida) => bebida._id === bebidaId);

        if (!bebida) {
            console.error('Plato de bebida no encontrado');
            return;
        }

        const nuevoEstado = bebida.estadoPreparacion === 'listo' ? 'pendiente' : 'listo';

        setPedidosBebidas((prevPedidosBebidas) =>
            prevPedidosBebidas.map((pedidoBebida) =>
                pedidoBebida._id === pedidoBebidaId
                    ? {
                        ...pedidoBebida,
                        bebidas: pedidoBebida.bebidas.map((bebida) =>
                            bebida._id === bebidaId
                                ? { ...bebida, estadoPreparacion: nuevoEstado }
                                : bebida
                        ),
                    }
                    : pedidoBebida
            )
        );

        actualizarEstadoPreparacion(pedidoBebidaId, bebidaId, nuevoEstado);
    };

    const mostrarPedidosTerminados = () => {
        setMostrarTerminados(!mostrarTerminados);
    };

    return (
        <div className="container barra-container mt-4">
            <h2 className="barra-title">Barra</h2>

            <button
                className="btn barra-toggle-btn mb-3"
                onClick={mostrarPedidosTerminados}
            >
                {mostrarTerminados ? 'Pedidos Pendientes' : 'Pedidos Terminados'}
            </button>

            {/* Mostrar pedidos según el estado */}
            {!mostrarTerminados && (
                <div>
                    <h3 className="barra-subtitle">Pedidos Pendientes</h3>
                    {pedidosBebidas.filter((pedidoBebida) => pedidoBebida.estado === 'pendiente').length === 0 ? (
                        <p className="barra-empty">No hay pedidos pendientes.</p>
                    ) : (
                        <div className="row barra-list">
                            {pedidosBebidas
                                .filter((pedidoBebida) => pedidoBebida.estado === 'pendiente')
                                .map((pedidoBebida) => (
                                    <div key={pedidoBebida._id} className="col-12 col-md-6 col-lg-3 col-xl-2 barra-pedido">
                                        <div className="list-group-item" style={{ height: 'fit-content' }}>
                                            <h5 className="barra-time">
                                                Mesa {obtenerNumeroMesa(pedidoBebida.mesa)} - {new Date(pedidoBebida.createdAt).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </h5>
                                            <ul className="barra-items">
                                                {pedidoBebida.bebidas.map((bebida) => (
                                                    <li key={bebida._id} className="barra-item mb-3">
                                                        {bebida.nombre} x{bebida.cantidad} 
                                                        <input
                                                            type="checkbox"
                                                            checked={bebida.estadoPreparacion === 'listo'}
                                                            onChange={() => manejarCambioCheckbox(pedidoBebida._id, bebida._id)}
                                                            style={{ marginLeft: '10px' }}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                            <button
                                                className="btn barra-complete-btn"
                                                onClick={() => marcarComoTerminado(pedidoBebida._id)}
                                            >
                                                Marcar como completado
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Mostrar pedidos terminados */}
            {mostrarTerminados && (
                <div>
                    <h3 className="barra-subtitle">Pedidos Terminados</h3>
                    {pedidosBebidas.filter((pedidoBebida) => pedidoBebida.estado === 'completado').length === 0 ? (
                        <p className="barra-empty">No hay pedidos terminados.</p>
                    ) : (
                        <div className="row barra-list">
                            {pedidosBebidas
                                .filter((pedidoBebida) => pedidoBebida.estado === 'completado')
                                .map((pedidoBebida) => (
                                    <div key={pedidoBebida._id} className="col-12 col-md-6 col-lg-3 col-xl-2 barra-pedido">
                                        <div className="list-group-item">
                                            <h5 className="barra-time">
                                                Mesa {obtenerNumeroMesa(pedidoBebida.mesa)} - {new Date(pedidoBebida.createdAt).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </h5>
                                            <ul className="barra-items">
                                                {pedidoBebida.bebidas.map((bebida) => (
                                                    <li key={bebida._id} className="barra-item">
                                                        {bebida.nombre} - {bebida.estadoPreparacion}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Barra;
