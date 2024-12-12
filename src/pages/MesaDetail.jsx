import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';  // Importar socket.io-client
import '../styles/MesaDetail.css'; // Archivo de estilos
import RightBar from '../component/RightBar';
import BottomBar from '../component/BottomBar';
import BebidaAcompanante from '../component/BebidaAcompanante';

const socket = io('http://192.168.1.132:3000');  // Conectar con el servidor de Socket.io


const MesaDetail = () => {
    const { id } = useParams();
    const [pedidos, setPedidos] = useState([]);
    const [pedidosBebida, setPedidosBebida] = useState([]);
    const [error, setError] = useState(null);
    const [mesas, setMesas] = useState([]);
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
                // Verificar si la respuesta es exitosa
                if (!response.ok) {
                    throw new Error('Error al obtener las mesas');
                }
                return response.json(); // Convertir la respuesta en formato JSON
            })
            .then((data) => {
                setMesas(data); // Actualizar el estado con los datos de las mesas
            })
            .catch((error) => {
                console.error('Error obteniendo mesas:', error);
            });

        socket.on('nuevoPedido', (nuevoPedido) => {
            setPedidos(prevPedidos => {
                if (!Array.isArray(prevPedidos)) {
                    console.error("El estado de pedidos no es un array:", prevPedidos);
                    return [nuevoPedido]; // Reinicia con el nuevo pedido
                }
                return [...prevPedidos, nuevoPedido];
            });
        });


        // Escuchar el evento 'nuevoPedido' para pedidos de bebida
        socket.on('nuevoPedidoBebida', (nuevoPedidoBebida) => {
            setPedidosBebida((prevPedidosBebida) => {
                if (!Array.isArray(prevPedidosBebida)) {
                    console.error("El estado de pedidosBebida no es un array:", prevPedidosBebida);
                    return [nuevoPedidoBebida]; // Reinicia con el nuevo pedido
                }
                return [...prevPedidosBebida, nuevoPedidoBebida];
            });
        });

        // Escuchar el evento 'mesaRecuperada' emitido desde el servidor
        socket.on('mesarecuperada', (data) => {
            console.log('Mesa recuperada:', data);
        });

        // Limpiar los eventos cuando el componente se desmonta
        return () => {
            socket.off('nuevoPedido');
            socket.off('nuevoPedidoBebida');
            socket.off('mesarecuperada');
        };
    }, [id]);

    // Función para obtener el número de la mesa basado en el id
    const obtenerNumeroMesa = (mesaId) => {
        const mesa = mesas.find((mesa) => mesa._id === mesaId);
        return mesa ? mesa.numero : 'Desconocido';
    };

    // Configurar el socket para escuchar los nuevos pedidos
    useEffect(() => {
        socket.on('actualizarPedidos', (nuevoPedido) => {
            // Aquí actualizamos el estado con el nuevo pedido
            setPedidos(prevPedidos => [...prevPedidos, nuevoPedido]);
        });

        return () => {
            socket.off('actualizarPedidos'); // Limpiar el evento cuando el componente se desmonte
        };
    }, []);

    const eliminarPlato = (pedidoId, platoId) => {
        // Obtener el token JWT del localStorage
        const token = localStorage.getItem('token');

        console.log("Token enviado en la solicitud:", token);  // Verifica que el token sea válido

        if (!token) {
            console.error("No se encontró el token, el usuario no está autenticado.");
            return;
        }

        // Realizar la solicitud PUT para eliminar un plato
        fetch(`http://192.168.1.132:3000/api/pedidos/${pedidoId}/actualizar-plato/${platoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Agregar el token al encabezado de la solicitud
            },
            body: JSON.stringify({ cantidad: 1 }) // Eliminar 1 de la cantidad
        })
            .then(response => response.json()) // Esperar la respuesta como JSON
            .then(data => {
                if (data.error) {
                    console.error('Error al actualizar el plato:', data.error);
                } else {
                    console.log('Plato eliminado:', data);
                    // Actualizar el estado de los pedidos
                    setPedidos(prevPedidos =>
                        prevPedidos.map(pedido => {
                            if (pedido._id === pedidoId) {
                                const updatedPlatos = pedido.platos.map(plato => {
                                    if (plato._id === platoId) {
                                        if (plato.cantidad > 1) {
                                            return { ...plato, cantidad: plato.cantidad - 1 };
                                        } else {
                                            return null; // Si la cantidad es 1, eliminamos el plato
                                        }
                                    }
                                    return plato;
                                }).filter(plato => plato !== null);

                                if (updatedPlatos.length === 0) {
                                    return null; // Eliminar el pedido si no quedan platos
                                }

                                return { ...pedido, platos: updatedPlatos };
                            }
                            return pedido;
                        }).filter(pedido => pedido !== null) // Filtrar pedidos vacíos
                    );
                }
            })
            .catch(err => {
                console.error('Error al eliminar el plato:', err);
                setError(err.message || 'Error al actualizar el plato');
            });
    };


    const eliminarBebida = (pedidoId, bebidaId) => {
        // Obtener el token JWT del localStorage
        const token = localStorage.getItem('token');

        console.log("Token enviado en la solicitud:", token);  // Verifica que el token sea válido

        if (!token) {
            console.error("No se encontró el token, el usuario no está autenticado.");
            return;
        }

        // Hacer una solicitud PUT para actualizar la cantidad de la bebida
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
                console.log('Respuesta de eliminar bebida:', data);  // Verifica la respuesta del servidor
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

    return (
        <div className="container-fluid text-center mt-3">
            <div className="row">
                {/* Columna vacía (izquierda) */}
                <div className="col-3">
                    {/* Puedes añadir algo aquí en el futuro o dejarlo vacío */}
                </div>

                {/* Columna central: Detalles de la Mesa */}
                <div className="col-5" id="pedidos-center">
                    <div className="mesa-detail-container">
                        <h1 className="mesa-title">Mesa {obtenerNumeroMesa(id)}</h1>
                        {error && <p className="mesa-error text-danger">{error}</p>}
                        <div className="mesa-orders">
                            {/* Verificar si pedidos es un array */}
                            {Array.isArray(pedidos) && pedidos.length > 0 && pedidos.some(pedido => pedido.platos?.length > 0) ? (
                                pedidos
                                    .filter(pedido => pedido.platos?.length > 0) // Filtrar pedidos con platos
                                    .map(pedido => (
                                        <div className="pedido-card card mb-3" key={pedido._id}>
                                            <h3 className="pedido-status">{pedido.estado}</h3>
                                            <ul className="pedido-list list-group">
                                                {pedido.platos.map(plato => (
                                                    <li
                                                        className="list-group-item d-flex justify-content-between align-items-center"
                                                        key={plato.platoId}
                                                    >
                                                        {/* Agregar clase condicional basada en estadoPreparacion */}
                                                        <h4
                                                            className={`plato-name ${plato.estadoPreparacion === 'listo' ? 'text-green' : ''}`}
                                                            style={{ color: plato.estadoPreparacion === 'pendiente' ? 'rgb(140, 12, 12)' : '' }}
                                                        >
                                                            {plato.nombre} x{plato.cantidad}
                                                        </h4>
                                                        <button
                                                            className="btn"
                                                            onClick={() => eliminarPlato(pedido._id, plato._id)}
                                                            style={{ backgroundColor: 'rgb(140,12,12)', color: '#fff' }}
                                                        >
                                                            Eliminar Plato
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
                                        <div className="pedido-card card mb-3" key={pedido._id}>
                                            <h3 className="pedido-status">{pedido.estado}</h3>
                                            <ul className="pedido-list list-group">
                                                {pedido.bebidas.map(bebida => (
                                                    <li
                                                        className="list-group-item d-flex justify-content-between align-items-center"
                                                        key={bebida._id}
                                                    >
                                                        <h4 className="plato-name">
                                                            {bebida.nombre} x{bebida.cantidad}
                                                        </h4>
                                                        <BebidaAcompanante bebida={bebida} />
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
                                    ))
                            ) : (
                                <p>No hay bebidas disponibles.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha: RightBar */}
                <div className="col-3">
                    <RightBar />
                </div>
            </div>
            <BottomBar />
        </div>
    );
};

export default MesaDetail;
