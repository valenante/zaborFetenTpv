import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RightBar from '../component/RightBar';  // Importamos el componente RightBar
import '../styles/MesaView.css';  // Importar estilos de MesaView
import io from 'socket.io-client';  // Importar socket.io-client
import BebidaAcompanante from '../component/BebidaAcompanante';  // Importar el componente BebidaAcompanante
import BottomBar from '../component/BottomBar';
const socket = io('http://192.168.1.132:3000');  // Conectar con el servidor de Socket.io

const MesaView = () => {
    const { id } = useParams(); // Obtenemos el ID de la mesa desde los parámetros de la URL
    const [showMesaDetail, setShowMesaDetail] = useState(false);  // Controlamos qué sección se muestra (inicialmente false)
    const [pedidos, setPedidos] = useState([]);
    const [pedidosBebida, setPedidosBebida] = useState([]);
    const [error, setError] = useState(null);
    const [mesas, setMesas] = useState([]);
    const [showButtons, setShowButtons] = useState(true);  // Estado para mostrar los botones

    useEffect(() => {
        // Solicitar pedidos inicialmente al servidor
        fetch(`http://192.168.1.132:3000/api/pedidos/mesa/${id}`)
            .then(response => response.json())
            .then(data => {
                setPedidos(Array.isArray(data) ? data : []); // Garantiza que sea un array
            })
            .catch(err => {
                setError(err.message || 'Error al obtener los pedidos');
            });

        fetch(`http://192.168.1.132:3000/api/pedidoBebidas/mesa/${id}`)
            .then(response => response.json())
            .then(data => {
                setPedidosBebida(data);
            })
            .catch(err => {
                setError(err.message || 'Error al obtener los pedidos');
            });

        // Obtener todas las mesas al cargar el componente
        fetch('http://192.168.1.132:3000/api/mesas')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener las mesas');
                }
                return response.json();
            })
            .then((data) => {
                setMesas(data);
            })
            .catch((error) => {
                console.error('Error obteniendo mesas:', error);
            });

        socket.on('nuevoPedido', (nuevoPedido) => {
            setPedidos(prevPedidos => {
                if (!Array.isArray(prevPedidos)) {
                    console.error("El estado de pedidos no es un array:", prevPedidos);
                    return [nuevoPedido];
                }
                return [...prevPedidos, nuevoPedido];
            });
        });

        socket.on('nuevoPedidoBebida', (nuevoPedidoBebida) => {
            setPedidosBebida((prevPedidosBebida) => {
                if (!Array.isArray(prevPedidosBebida)) {
                    console.error("El estado de pedidosBebida no es un array:", prevPedidosBebida);
                    return [nuevoPedidoBebida];
                }
                return [...prevPedidosBebida, nuevoPedidoBebida];
            });
        });

        socket.on('mesarecuperada', (data) => {
            console.log('Mesa recuperada:', data);
        });

        return () => {
            socket.off('nuevoPedido');
            socket.off('nuevoPedidoBebida');
            socket.off('mesarecuperada');
        };
    }, [id]);

    const obtenerNumeroMesa = (mesaId) => {
        const mesa = mesas.find((mesa) => mesa._id === mesaId);
        return mesa ? mesa.numero : 'Desconocido';
    };

    const eliminarPlato = (pedidoId, platoId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No se encontró el token, el usuario no está autenticado.");
            return;
        }

        fetch(`http://192.168.1.132:3000/api/pedidos/${pedidoId}/actualizar-plato/${platoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ cantidad: 1 })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error al actualizar el plato:', data.error);
                } else {
                    setPedidos(prevPedidos =>
                        prevPedidos.map(pedido => {
                            if (pedido._id === pedidoId) {
                                const updatedPlatos = pedido.platos.map(plato => {
                                    if (plato._id === platoId) {
                                        if (plato.cantidad > 1) {
                                            return { ...plato, cantidad: plato.cantidad - 1 };
                                        } else {
                                            return null;
                                        }
                                    }
                                    return plato;
                                }).filter(plato => plato !== null);

                                if (updatedPlatos.length === 0) {
                                    return null;
                                }

                                return { ...pedido, platos: updatedPlatos };
                            }
                            return pedido;
                        }).filter(pedido => pedido !== null)
                    );
                }
            })
            .catch(err => {
                console.error('Error al eliminar el plato:', err);
                setError(err.message || 'Error al actualizar el plato');
            });
    };

    const eliminarBebida = (pedidoId, bebidaId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No se encontró el token, el usuario no está autenticado.");
            return;
        }

        fetch(`http://192.168.1.132:3000/api/pedidoBebidas/${pedidoId}/actualizar-bebida/${bebidaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ cantidad: 1 })
        })
            .then(response => response.json())
            .then(data => {
                setPedidosBebida(prevPedidosBebida =>
                    prevPedidosBebida.map(pedido => {
                        if (pedido._id === pedidoId) {
                            const updatedBebidas = pedido.bebidas.map(bebida => {
                                if (bebida._id === bebidaId) {
                                    if (bebida.cantidad > 1) {
                                        bebida.cantidad -= 1;
                                        return bebida;
                                    } else {
                                        return null;
                                    }
                                }
                                return bebida;
                            }).filter(bebida => bebida !== null);

                            if (updatedBebidas.length === 0) {
                                return null;
                            }

                            return { ...pedido, bebidas: updatedBebidas };
                        }
                        return pedido;
                    }).filter(pedido => pedido !== null)
                );
            })
            .catch(err => {
                console.error('Error al eliminar la bebida:', err);
                setError(err.message || 'Error al actualizar la bebida');
            });
    };

    // Función para mostrar los pedidos y ocultar el RightBar
    const handleShowMesaDetail = () => {
        setShowMesaDetail(true);
        setShowButtons(false); // Ocultar los botones
    };

    // Función para mostrar el RightBar y ocultar los pedidos
    const handleShowRightBar = () => {
        setShowMesaDetail(false);
        setShowButtons(true); // Mostrar los botones de nuevo
    };

    return (
        <>
            <div className="container-fluid text-center mt-3">
                <div className="row">
                    {/* Mostrar los botones solo si showButtons es verdadero */}
                    {showButtons && (
                        <div className="col-12">
                            <div className="button-group">
                                <button
                                    className="btn btn-primary mb-2"
                                    onClick={handleShowMesaDetail} // Mostrar detalles de la mesa
                                >
                                    Mesa
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="row mt-3">
                    {showMesaDetail ? (
                        // Mostrar los detalles de la mesa con pedidos
                        <div className="col-12" id="pedidos-center">
                            {error && <p className="mesa-error text-danger">{error}</p>}
                            {/* Columna central: Detalles de la Mesa */}
                            <div className="col-5" id="pedidos-center">
                                <div className="mesa-detail-container-small">
                                    <h1 className="mesa-title-small">Mesa {obtenerNumeroMesa(id)}</h1>
                                    {error && <p className="mesa-error-small text-danger">{error}</p>}
                                    <div className="mesa-orders-small">
                                        {/* Verificar si pedidos es un array */}
                                        {Array.isArray(pedidos) && pedidos.length > 0 && pedidos.some(pedido => pedido.platos?.length > 0) ? (
                                            pedidos
                                                .filter(pedido => pedido.platos?.length > 0) // Filtrar pedidos con platos
                                                .map(pedido => (
                                                    <div className="pedido-card-small mb-3" key={pedido._id}>
                                                        <h3 className="pedido-status-small">{pedido.estado}</h3>
                                                        <ul className="pedido-list-small list-group">
                                                            {pedido.platos.map(plato => (
                                                                <li
                                                                    className="list-group-item-small d-flex justify-content-between align-items-center"
                                                                    key={plato.platoId}
                                                                >
                                                                    {/* Agregar clase condicional basada en estadoPreparacion */}
                                                                    <h4
                                                                        className={`plato-name-small ${plato.estadoPreparacion === 'listo' ? 'text-green' : ''}`}
                                                                        style={{ color: plato.estadoPreparacion === 'pendiente' ? 'rgb(140, 12, 12)' : '' }}
                                                                    >
                                                                        {plato.nombre} x{plato.cantidad}
                                                                    </h4>
                                                                    <button
                                                                        className="btn-small"
                                                                        onClick={() => eliminarPlato(pedido._id, plato._id)}
                                                                        style={{ backgroundColor: 'rgb(140,12,12)', color: '#fff' }}
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))
                                        ) : (
                                            <p>No hay platos disponibles.</p>
                                        )}

                                        {/* Verificar si pedidosBebida es un array */}
                                        {Array.isArray(pedidosBebida) &&
                                            pedidosBebida.length > 0 &&
                                            pedidosBebida.some(pedido => pedido.bebidas?.length > 0) ? (
                                            pedidosBebida
                                                .filter(pedido => pedido.bebidas?.length > 0) // Filtrar pedidos con bebidas
                                                .map(pedido => (
                                                    <div className="pedido-card-small mb-3" key={pedido._id}>
                                                        <h3 className="pedido-status-small">{pedido.estado}</h3>
                                                        <ul className="pedido-list-small list-group">
                                                            {pedido.bebidas.map(bebida => (
                                                                <li
                                                                    className="list-group-item-small d-flex justify-content-between align-items-center"
                                                                    key={bebida._id}
                                                                >
                                                                    <h4 className="plato-name-small">
                                                                        {bebida.nombre} x{bebida.cantidad}
                                                                    </h4>
                                                                    <BebidaAcompanante bebida={bebida} />
                                                                    <button
                                                                        className="btn-small btn-danger btn-sm"
                                                                        onClick={() => eliminarBebida(pedido._id, bebida._id)}
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))
                                        ) : (
                                            <p>No hay bebidas disponibles.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-secondary mt-3" onClick={handleShowRightBar}>
                                Atrás
                            </button>
                        </div>
                    ) : (
                        // Mostrar RightBar para realizar pedido
                        <div className="col-12">
                            <RightBar mesaId={id} />
                        </div>
                    )}
                </div>

            </div>
            <BottomBar />
        </>
    );
};

export default MesaView;
