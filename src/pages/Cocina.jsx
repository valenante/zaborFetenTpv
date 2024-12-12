import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../styles/Cocina.css';

const Cocina = () => {
    const [pedidos, setPedidos] = useState([]);
    const [mostrarTerminados, setMostrarTerminados] = useState(false);
    const [mesas, setMesas] = useState([]);
    const socket = io('http://192.168.1.132:3000'); // Cambia la URL si es necesario

    useEffect(() => {
        // Suscribirse a los eventos del socket
        socket.on('nuevoPedido', (pedido) => {
            console.log('Nuevo pedido recibido:', pedido);
            // Obtener los pedidos actualizados desde el servidor en lugar de solo actualizar localmente
            axios.get('http://192.168.1.132:3000/api/pedidos')
                .then((response) => {
                    setPedidos(response.data); // Actualiza el estado con los pedidos actualizados
                })
                .catch((error) => {
                    console.error('Error obteniendo pedidos:', error);
                });
        });

        socket.on('estadoPedidoActualizado', (pedidoActualizado) => {
            setPedidos((prevPedidos) =>
                prevPedidos.map((pedido) =>
                    pedido.id === pedidoActualizado.id ? pedidoActualizado : pedido
                )
            );
        });

        socket.on('pedidoActualizado', (pedidoActualizado) => {
            setPedidos((prevPedidos) =>
                prevPedidos.map((pedido) =>
                    pedido.id === pedidoActualizado.platoId
                        ? {
                            ...pedido,
                            platos: pedido.platos.map((plato) =>
                                plato.id === pedidoActualizado.platosid
                                    ? {
                                        ...plato,
                                        estadoPreparacion: pedidoActualizado.estadoPreparacion // Solo actualiza el estado del plato
                                    }
                                    : plato
                            )
                        }
                        : pedido
                )
            );
        });

        socket.on('pedidoFinalizado', (pedidoActualizado) => {
            // Actualizar el estado local de los pedidos cuando se recibe el evento
            setPedidos((prevPedidos) =>
                prevPedidos.map((pedido) =>
                    pedido.id === pedidoActualizado.id
                        ? { ...pedido, estado: 'completado' } // Actualizar el estado a 'completado'
                        : pedido
                )
            );
        });

        // Limpiar la conexión del socket cuando el componente se desmonta
        return () => {
            socket.disconnect();
        };
    }, []); // El array vacío asegura que este useEffect solo se ejecute una vez al montar el componente

    useEffect(() => {
        // Obtener todos los pedidos al cargar el componente
        axios
            .get('http://192.168.1.132:3000/api/pedidos')
            .then((response) => {
                setPedidos(response.data);
            })
            .catch((error) => {
                console.error('Error obteniendo pedidos:', error);
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

    const marcarComoTerminado = (pedidoId) => {
        const pedido = pedidos.find((pedido) => pedido._id === pedidoId);

        if (!pedido) {
            console.log('Pedido no encontrado');
            return;
        }

        const todosLosPlatosListos = pedido.platos.every(
            (plato) => plato.estadoPreparacion === 'listo'
        );

        if (!todosLosPlatosListos) {
            console.log('No todos los platos están listos para ser terminados.');
            return;
        }

        axios
            .put(`http://192.168.1.132:3000/api/pedidos/${pedidoId}/completado`)
            .then((response) => {
                // Verifica que la respuesta tenga el estado esperado
                if (response.status === 200) {
                    setPedidos((prevPedidos) =>
                        prevPedidos.map((pedido) =>
                            pedido._id === pedidoId
                                ? { ...pedido, estado: 'completado' }
                                : pedido
                        )
                    );
                }
            })
            .catch((error) => {
                console.error('Error al actualizar estado del pedido:', error);
            });
    };



    const actualizarEstadoPreparacion = (pedidoId, platoId, estado) => {
        axios
            .put(`http://192.168.1.132:3000/api/pedidos/${pedidoId}/plato/${platoId}/listo`)
            .then(() => {
                setPedidos((prevPedidos) =>
                    prevPedidos.map((pedido) =>
                        pedido.id === pedidoId
                            ? {
                                ...pedido,
                                platos: pedido.platos.map((plato) =>
                                    plato.id === platoId
                                        ? {
                                            ...plato,
                                            estadoPreparacion: estado, // Actualiza el estado del plato
                                        }
                                        : plato
                                ),
                            }
                            : pedido
                    )
                );
            })
            .catch((error) => {
                console.error('Error al actualizar estado de preparación:', error);
            });
    };

    const manejarCambioCheckbox = (pedidoId, platoId) => {
        const pedido = pedidos.find((pedido) => pedido._id === pedidoId);

        if (!pedido || !pedido.platos) {
            console.error('Pedido o platos no encontrados');
            return;
        }

        const plato = pedido.platos.find((plato) => plato._id === platoId);

        if (!plato) {
            console.error('Plato no encontrado');
            return;
        }

        // Determina el nuevo estado del plato (pendiente o listo)
        const nuevoEstado = plato.estadoPreparacion === 'listo' ? 'pendiente' : 'listo';

        // Actualiza el estado localmente primero
        setPedidos((prevPedidos) =>
            prevPedidos.map((pedido) =>
                pedido._id === pedidoId
                    ? {
                        ...pedido,
                        platos: pedido.platos.map((plato) =>
                            plato._id === platoId
                                ? { ...plato, estadoPreparacion: nuevoEstado }
                                : plato
                        ),
                    }
                    : pedido
            )
        );

        // Luego actualiza el estado en el backend
        actualizarEstadoPreparacion(pedidoId, platoId, nuevoEstado);
    };



    const mostrarPedidosTerminados = () => {
        setMostrarTerminados(!mostrarTerminados);
    };

    return (
        <div className="container cocina-container mt-4">
            <h2 className="cocina-title">Cocina</h2>

            <button
                className="btn cocina-toggle-btn mb-3"
                onClick={mostrarPedidosTerminados}
            >
                {mostrarTerminados ? 'Pedidos Pendientes' : 'Pedidos Terminados'}
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
                                    <div key={pedido._id} className="col-12 col-md-6 col-lg-3 col-xl-2 cocina-pedido">
                                        <div className="list-group-item" style={{ height: 'fit-content' }}>
                                            <h5 className="cocina-time">
                                                Mesa {obtenerNumeroMesa(pedido.mesa)} - {new Date(pedido.createdAt).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </h5>
                                            <p className="cocina-mesa"></p>

                                            {pedido.comensales && (
                                                <p className="cocina-comensales">Comensales: {pedido.comensales}</p>
                                            )}

                                            {pedido.alergias && pedido.alergias.length > 0 && (
                                                <p className="cocina-alergias">
                                                    Alergias: {pedido.alergias.join(', ')}
                                                </p>
                                            )}

                                            {pedido.platos.map((plato, index) => {
                                                return (
                                                    <div
                                                        key={index}
                                                    >
                                                        <p className="cocina-plato m-1" style={{
                                                            color: plato.tipoServicio === 'compartir' ? '#774b89' : 'rgb(140,12,12)',
                                                        }}>
                                                            {plato.nombre} x{plato.cantidad} {plato.tipo} <input
                                                                type="checkbox"
                                                                checked={plato.estadoPreparacion === 'listo'}
                                                                onChange={() => manejarCambioCheckbox(pedido._id, plato._id)}
                                                            />

                                                        </p>

                                                        {plato.croquetas.length > 0 && (
                                                            <p className="cocina-ingredientes">
                                                                {
                                                                    // Agrupar los sabores y contar las repeticiones
                                                                    Object.entries(
                                                                        plato.croquetas.reduce((acc, sabor) => {
                                                                            acc[sabor] = (acc[sabor] || 0) + 1;
                                                                            return acc;
                                                                        }, {})
                                                                    ).map(([sabor, cantidad], index) => {
                                                                        // Mostrar el sabor y la cantidad si es mayor a 1
                                                                        return `${sabor}${cantidad > 1 ? ` x${cantidad}` : ''}` + (index < plato.croquetas.length - 1 ? ', ' : '');
                                                                    })
                                                                }
                                                            </p>
                                                        )}

                                                        {plato.ingredientesEliminados.length > 0 && (
                                                            <p className="cocina-ingredientes">
                                                                Sin {plato.ingredientesEliminados.join(', ')}
                                                            </p>
                                                        )}

                                                        {(plato.nombre === 'Croquetas' || plato.nombre === 'Surtido de Croquetas') &&
                                                            plato.ingredientes && plato.ingredientes.length > 0 && (
                                                                <p className="cocina-ingredientes">
                                                                    Ingredientes: {plato.ingredientes.join(', ')}
                                                                </p>
                                                            )}


                                                        {plato.opcionesPersonalizables && (
                                                            <ul className="cocina-opciones">
                                                                {Object.entries(plato.opcionesPersonalizables).map(
                                                                    ([key, value], index) => (
                                                                        <li key={index}>{value}</li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        )}
                                                        {plato.especificaciones && plato.especificaciones.length > 0 && (
                                                            <ul className="cocina-ingredientes">
                                                                {plato.especificaciones.map((especificacion, index) => (
                                                                    <li key={index}>{especificacion}</li>
                                                                ))}
                                                            </ul>
                                                        )}



                                                    </div>
                                                );
                                            })}

                                            <button
                                                className="btn cocina-btn-terminado mt-3"
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
                    <h3 className="cocina-subtitle">Pedidos Terminados (Últimos 20 minutos)</h3>
                    {pedidos.filter((pedido) => {
                        if (pedido.estado !== 'completado') return false;

                        // Calcula la diferencia de tiempo en minutos
                        const tiempoActual = new Date();
                        const tiempoCreacion = new Date(pedido.createdAt);
                        const diferenciaMinutos = (tiempoActual - tiempoCreacion) / (1000 * 60); // Diferencia en minutos

                        return diferenciaMinutos <= 20; // Solo incluir si la diferencia es <= 20 minutos
                    }).length === 0 ? (
                        <p className="cocina-empty">No hay pedidos terminados en los últimos 20 minutos.</p>
                    ) : (
                        <div className="row cocina-list">
                            {pedidos
                                .filter((pedido) => {
                                    if (pedido.estado !== 'completado') return false;

                                    // Calcula la diferencia de tiempo en minutos
                                    const tiempoActual = new Date();
                                    const tiempoCreacion = new Date(pedido.createdAt);
                                    const diferenciaMinutos = (tiempoActual - tiempoCreacion) / (1000 * 60); // Diferencia en minutos

                                    return diferenciaMinutos <= 20; // Solo incluir si la diferencia es <= 20 minutos
                                })
                                .map((pedido) => (
                                    <div key={pedido._id} className="col-12 col-md-6 col-lg-4 col-xl-2 cocina-pedido">
                                        <div className="list-group-item w-100" style={{ height: 'fit-content' }}>
                                            <h5 className="cocina-time">
                                                {new Date(pedido.createdAt).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </h5>
                                            <h5 className="cocina-time">
                                                Mesa {obtenerNumeroMesa(pedido.mesa)} - {new Date(pedido.createdAt).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </h5>
                                            {pedido.comensales && (
                                                <p className="cocina-comensales">Comensales: {pedido.comensales}</p>
                                            )}

                                            {pedido.alergias && pedido.alergias.length > 0 && (
                                                <p className="cocina-alergias">
                                                    Alergias: {pedido.alergias.join(', ')}
                                                </p>
                                            )}

                                            {pedido.platos.map((plato, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        color: plato.tipoServicio === 'compartir' ? '#774b89' : 'rgb(140,12,12)',
                                                    }}
                                                >
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
                                                            {Object.entries(plato.opcionesPersonalizables).map(
                                                                ([key, value], index) => (
                                                                    <li key={index}>{value}</li>
                                                                )
                                                            )}
                                                        </ul>
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
