import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../styles/Cocina.css';

const Cocina = () => {
    const [pedidos, setPedidos] = useState([]);
    const [mostrarTerminados, setMostrarTerminados] = useState(false);

    useEffect(() => {
        const socket = io('http://192.168.1.132:3000'); // Cambia la URL si es necesario

        socket.on('nuevoPedido', (pedido) => {
            setPedidos((prevPedidos) => [...prevPedidos, pedido]);
        });

        socket.on('estadoPedidoActualizado', (pedidoActualizado) => {
            setPedidos((prevPedidos) =>
                prevPedidos.map((pedido) =>
                    pedido.id === pedidoActualizado.id ? pedidoActualizado : pedido
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        axios
            .get('http://192.168.1.132:3000/api/pedidos')
            .then((response) => setPedidos(response.data))
            .catch((error) =>
                console.error('Error obteniendo pedidos:', error)
            );
    }, []);

    const marcarComoTerminado = (pedidoId) => {
        axios
            .put(`http://192.168.1.132:3000/api/pedidos/${pedidoId}/completado`)
            .then(() => {
                setPedidos((prevPedidos) =>
                    prevPedidos.map((pedido) =>
                        pedido.id === pedidoId
                            ? { ...pedido, estado: 'Terminado' }
                            : pedido
                    )
                );
            })
            .catch((error) =>
                console.error('Error al actualizar estado del pedido:', error)
            );
    };

    const mostrarPedidosTerminados = () => {
        setMostrarTerminados(!mostrarTerminados);
    };

    return (
        <div className="container cocina-container mt-4">
            <h2 className="cocina-title">Cocina</h2>
    
            {/* Botón para alternar entre pedidos pendientes y terminados */}
            <button
                className="btn cocina-toggle-btn mb-3"
                onClick={mostrarPedidosTerminados}
            >
                {mostrarTerminados
                    ? 'Pedidos Pendientes'
                    : 'Pedidos Terminados'}
            </button>
    
            {/* Mostrar pedidos según el estado */}
            {!mostrarTerminados && (
                <div>
                    <h3 className="cocina-subtitle">Pedidos Pendientes</h3>
                    {pedidos.filter((pedido) => pedido.estado === 'pendiente').length === 0 ? (
                        <p className="cocina-empty">No hay pedidos pendientes.</p>
                    ) : (
                        <div className="row cocina-list">
                            {pedidos
                                .filter((pedido) => pedido.estado === 'pendiente')
                                .map((pedido) => (
                                    <div key={pedido.id} className="col-12 col-md-6 col-lg-3 col-xl-2 cocina-pedido">
                                        <div className="list-group-item" style={{ height: 'fit-content' }}>
                                            <h5 className="cocina-time">
                                                {new Date(pedido.createdAt).toLocaleTimeString(
                                                    'es-ES',
                                                    { hour: '2-digit', minute: '2-digit' }
                                                )}
                                            </h5>
                                            <p className="cocina-mesa">Mesa: {pedido.mesa}</p>
                                            {pedido.platos.map((plato, index) => (
                                                <div key={index}>
                                                    <p className="cocina-plato">
                                                        {plato.nombre} x{plato.cantidad} {plato.tipo}
                                                    </p>
                                                    {plato.ingredientesEliminados.length > 0 && (
                                                        <p className="cocina-ingredientes">
                                                            Sin {plato.ingredientesEliminados.join(', ')}
                                                        </p>
                                                    )}
                                                    {plato.opcionesPersonalizables && (
                                                        <ul className="cocina-opciones">
                                                            {Object.entries(plato.opcionesPersonalizables).map(([key, value], index) => (
                                                                <li key={index}>
                                                                    {value}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                className="btn cocina-btn-terminado"
                                                onClick={() => marcarComoTerminado(pedido._id)}
                                            >
                                                Terminado
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}
    
            {mostrarTerminados && (
                <div>
                    <h3 className="cocina-subtitle">Pedidos Terminados</h3>
                    {pedidos.filter((pedido) => pedido.estado === 'completado').length === 0 ? (
                        <p className="cocina-empty">No hay pedidos terminados.</p>
                    ) : (
                        <div className="row cocina-list">
                            {pedidos
                                .filter((pedido) => pedido.estado === 'completado')
                                .map((pedido) => (
                                    <div key={pedido.id} className="col-12 col-md-6 col-lg-4 col-xl-2 cocina-pedido">
                                        <div className="list-group-item w-100" style={{ height: 'fit-content' }}>
                                            <h5 className="cocina-time">
                                                {new Date(pedido.createdAt).toLocaleTimeString(
                                                    'es-ES',
                                                    { hour: '2-digit', minute: '2-digit' }
                                                )}
                                            </h5>
                                            <p className="cocina-mesa">Mesa: {pedido.mesa}</p>
                                            {pedido.platos.map((plato, index) => (
                                                <div key={index}>
                                                    <p className="cocina-plato">
                                                        {plato.nombre} x{plato.cantidad}
                                                    </p>
                                                    {plato.ingredientesEliminados && (
                                                        <p className="cocina-ingredientes">
                                                            Sin {plato.ingredientesEliminados.join(', ')}
                                                        </p>
                                                    )}
                                                    {plato.tipo && (
                                                        <p className="cocina-tipo">Tipo: {plato.tipo}</p>
                                                    )}
                                                </div>
                                            ))}
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

export default Cocina;