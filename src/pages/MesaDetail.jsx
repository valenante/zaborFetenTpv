import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/MesaDetail.css'; // Archivo de estilos
import RightBar from '../component/RightBar';

const MesaDetail = () => {
    const { numeroMesa } = useParams();
    const [pedidos, setPedidos] = useState([]);
    const [pedidosBebida, setPedidosBebida] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://192.168.1.132:3000/api/pedidos/mesa/${numeroMesa}`)
            .then(response => response.json())
            .then(data => {
                setPedidos(data);
            })
            .catch(err => {
                setError(err.message || 'Error al obtener los pedidos');
            });
    }, [numeroMesa]);

    useEffect(() => {
        fetch(`http://192.168.1.132:3000/api/pedidoBebidas/mesa/${numeroMesa}`)
            .then(response => response.json())
            .then(data => {
                setPedidosBebida(data);
            })
            .catch(err => {
                setError(err.message || 'Error al obtener los pedidos');
            });
    }, [numeroMesa]);

    // Función para crear un nuevo pedido
    const crearPedido = (pedido) => {
        fetch(`http://192http://192.168.1.132:3000/api/pedidos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mesa: numeroMesa, ...pedido }),
        })
            .then(response => response.json())
            .then(data => {
                setPedidos(prevPedidos => [...prevPedidos, data]);
            })
            .catch(err => {
                setError(err.message || 'Error al crear el pedido');
            });
    };

    // Función para eliminar un plato
    const eliminarPlato = (pedidoId, platoId) => {
        console.log(platoId);

        // Realizando la solicitud DELETE
        fetch(`http://192.168.1.132:3000/api/pedidos/${pedidoId}/actualizar-plato/${platoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cantidad: 1 }) // Le indicamos al backend que queremos restar 1
        })
            .then(response => response.json())
            .then(data => {
                setPedidos(prevPedidos =>
                    prevPedidos.map(pedido => {
                        if (pedido._id === pedidoId) {
                            // Encontrar la bebida en el pedido
                            const updatedPlatos = pedido.platos.map(plato => {
                                if (plato._id === platoId) {
                                    // Si la cantidad es mayor a 1, restamos 1
                                    if (plato.cantidad > 1) {
                                        return {
                                            ...plato,
                                            cantidad: plato.cantidad - 1, // Reducir la cantidad
                                        };
                                    } else {
                                        // Si la cantidad es 1, la eliminamos
                                        return null;
                                    }
                                }
                                return plato;
                            }).filter(plato => plato !== null); // Filtrar las bebidas eliminadas

                            // Eliminar el pedido si no tiene platos ni bebidas
                            if (updatedPlatos.length === 0) {
                                return null; // Eliminar el pedido
                            }

                            return {
                                ...pedido,
                                bebidas: updatedPlatos,
                            };
                        }
                        return pedido;
                    }).filter(pedido => pedido !== null) // Eliminar pedidos vacíos
                );
            })
            .catch(err => {
                setError(err.message || 'Error al actualizar la bebida');
            });
    };

    const eliminarBebida = (pedidoId, bebidaId) => {
        // Hacer una solicitud PATCH para actualizar la cantidad de la bebida
        fetch(`http://192.168.1.132:3000/api/pedidoBebidas/${pedidoId}/actualizar-bebida/${bebidaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cantidad: 1 }) // Le indicamos al backend que queremos restar 1
        })
            .then(response => response.json())
            .then(data => {
                setPedidosBebida(prevPedidosBebida =>
                    prevPedidosBebida.map(pedido => {
                        if (pedido._id === pedidoId) {
                            // Encontrar la bebida en el pedido
                            const updatedBebidas = pedido.bebidas.map(bebida => {
                                if (bebida._id === bebidaId) {
                                    // Si la cantidad es mayor a 1, restamos 1
                                    if (bebida.cantidad > 1) {
                                        return {
                                            ...bebida,
                                            cantidad: bebida.cantidad - 1, // Reducir la cantidad
                                        };
                                    } else {
                                        // Si la cantidad es 1, la eliminamos
                                        return null;
                                    }
                                }
                                return bebida;
                            }).filter(bebida => bebida !== null); // Filtrar las bebidas eliminadas

                            // Eliminar el pedido si no tiene platos ni bebidas
                            if (updatedBebidas.length === 0) {
                                return null; // Eliminar el pedido
                            }

                            return {
                                ...pedido,
                                bebidas: updatedBebidas,
                            };
                        }
                        return pedido;
                    }).filter(pedido => pedido !== null) // Eliminar pedidos vacíos
                );
            })
            .catch(err => {
                setError(err.message || 'Error al actualizar la bebida');
            });
    };



    return (
        <div className="container-fluid text-center">
            <div className="row">
                {/* Columna vacía (izquierda) */}
                <div className="col-2 bg-light">
                    {/* Puedes añadir algo aquí en el futuro o dejarlo vacío */}
                </div>

                {/* Columna central: Detalles de la Mesa */}
                <div className="col-7">
                    <div className="mesa-detail-container">
                        <h1 className="mesa-title">Detalles de la Mesa {numeroMesa}</h1>
                        {error && <p className="mesa-error text-danger">{error}</p>}
                        <div className="mesa-orders">
                            {/* Verificar si pedidos es un array */}
                            {Array.isArray(pedidos) && pedidos.length > 0 ? (
                                pedidos.map(pedido => (
                                    pedido.platos.length > 0 && (
                                        <div className="pedido-card card mb-3" key={pedido._id}>
                                            <h3 className="pedido-status">{pedido.estado} - Platos</h3>
                                            <ul className="pedido-list list-group">
                                                {pedido.platos.map(plato => (
                                                    <li className="list-group-item d-flex justify-content-between align-items-center" key={plato.platoId}>
                                                        <h4 className="plato-name">{plato.nombre} - {plato.cantidad}</h4>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => eliminarPlato(pedido._id, plato._id)}
                                                        >
                                                            Eliminar Plato
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                ))
                            ) : (
                                <p>No hay platos disponibles.</p>
                            )}

                            {/* Verificar si pedidosBebida es un array */}
                            {Array.isArray(pedidosBebida) && pedidosBebida.length > 0 ? (
                                pedidosBebida.map(pedido => (
                                    pedido.bebidas.length > 0 && (
                                        <div className="pedido-card card mb-3" key={pedido._id}>
                                            <h3 className="pedido-status">{pedido.estado} - Bebidas</h3>
                                            <ul className="pedido-list list-group">
                                                {pedido.bebidas.map(bebida => (
                                                    <li className="list-group-item d-flex justify-content-between align-items-center" key={bebida._id}>
                                                        <h4 className="plato-name">{bebida.nombre} - {bebida.cantidad}</h4>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => eliminarBebida(pedido._id, bebida._id)}
                                                        >
                                                            Eliminar Bebida
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                ))
                            ) : (
                                <p>No hay bebidas disponibles.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha: RightBar */}
                <div className="col-3 bg-light">
                    <RightBar numeroMesa={numeroMesa} crearPedido={crearPedido} />
                </div>

            </div>
        </div>
    );
};

export default MesaDetail;
