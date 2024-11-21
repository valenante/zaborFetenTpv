import React, { useState, useEffect } from 'react';
import PlatoModal from './PlatoModal'; // Asegúrate de que la ruta sea correcta
import '../styles/RightBar.css'; // Archivo de estilos
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BebidaModal from './BebidaModal';

const RightBar = ({ numeroMesa, actualizarPedidos }) => {
    const [activo, setActivo] = useState('comidas'); // Puede ser 'comidas' o 'bebidas'
    const [categorias, setCategorias] = useState([]);
    const [elementos, setElementos] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [modalPlatoVisible, setModalPlatoVisible] = useState(false); // Estado para el modal de platos
    const [modalBebidaVisible, setModalBebidaVisible] = useState(false); // Estado para el modal de bebidas
    const [platoSeleccionado, setPlatoSeleccionado] = useState(null); // Plato que se ha seleccionado para el modal
    const [bebidaSeleccionada, setBebidaSeleccionada] = useState([]);
    const [bebidas, setBebidas] = useState([]); // Bebidas seleccionadas
    const [platos, setPlatos] = useState([]); // Platos seleccionados
    const elementosConTipo = elementos.map((elemento) => {
        if (elemento.precios || elemento.opcionesPersonalizables || elemento.puntosDeCoccion) {
            return { ...elemento, tipo: 'plato' }; // Es un plato
        } else if (elemento.conHielo !== undefined || elemento.conLimon !== undefined || elemento.categoria === 'cerveza') {
            return { ...elemento, tipo: 'bebida' }; // Es una bebida
        } else {
            return { ...elemento, tipo: 'desconocido' }; // Por si no encaja en ninguno
        }
    });


    const agregarBebida = (bebida) => {
        setBebidaSeleccionada((prevBebida) => {
            return Array.isArray(prevBebida) ? [...prevBebida, bebida] : [bebida];
        });
    };
    

    const { mesa } = useParams();


    // Cargar categorías al cambiar entre comidas y bebidas
    useEffect(() => {
        const endpoint = activo === 'comidas'
            ? 'http://192.168.1.132:3000/api/platos/categorias/platos'
            : 'http://192.168.1.132:3000/api/bebidas/categorias/bebidas';

        fetch(endpoint)
            .then(response => response.json())
            .then(data => setCategorias(data))
            .catch(err => console.error('Error al cargar categorías:', err));
    }, [activo]);

    // Función para cargar los elementos de la categoría seleccionada
    const cargarElementos = (categoria) => {
        if (!categoria) return;

        const endpoint = activo === 'comidas'
            ? `http://192.168.1.132:3000/api/platos/categorias/${categoria}`
            : `http://192.168.1.132:3000/api/bebidas/categorias/${categoria}`;

        fetch(endpoint)
            .then(response => response.json())
            .then(data => setElementos(data))
            .catch(err => console.error('Error al cargar elementos:', err));
    };

    const abrirModalPlato = (plato) => {
        setPlatoSeleccionado(plato); // Guardar el plato seleccionado
        setModalPlatoVisible(true); // Mostrar el modal de platos
        setModalBebidaVisible(false); // Asegurarse de cerrar el modal de bebidas
    };

    const cerrarModalPlato = () => {
        setModalPlatoVisible(false); // Ocultar el modal de platos
        setPlatoSeleccionado(null); // Limpiar el plato seleccionado
    };

    const abrirModalBebida = (bebida) => {
        setBebidaSeleccionada(bebida); // Guardar la bebida seleccionada
        setModalBebidaVisible(true); // Mostrar el modal de bebidas
        setModalPlatoVisible(false); // Asegurarse de cerrar el modal de platos
    };

    const cerrarModalBebida = () => {
        setModalBebidaVisible(false); // Ocultar el modal de bebidas
        setBebidaSeleccionada(null); // Limpiar la bebida seleccionada
    };

    const sendOrder = async () => {

        // Preparar datos para los pedidos
        const platosParaEnviar = platos.map(plato => ({
            platoId: plato._id,
            nombre: plato.nombre,
            cantidad: plato.cantidad || 1,
            ingredientes: plato.ingredientes,
            descripcion: plato.descripcion,
            size: plato.size,
            opcionesPersonalizables: plato.opcionesPersonalizables,
            puntosDeCoccion: plato.puntosDeCoccion,
            especificaciones: plato.especificacion,
            precios: plato.precio ? [plato.precio] : [],
        }));

        const bebidasParaEnviar = bebidas.map(bebida => ({
            bebidaId: bebida._id,
            nombre: bebida.nombre,
            cantidad: bebida.cantidad || 1,
            ingredientes: bebida.ingredientes,
            descripcion: bebida.descripcion,
            conHielo: bebida.conHielo,
            acompañante: bebida.acompañante,
            precio: bebida.precio,
            categoria: bebida.categoria,
        }));

        // Calcular totales
        const totalPlatos = platosParaEnviar.reduce((acc, plato) => acc + (plato.precios[0] || 0) * plato.cantidad, 0);
        const totalBebidas = bebidasParaEnviar.reduce((acc, bebida) => acc + bebida.precio * bebida.cantidad, 0);

        if (!mesa) {
            console.error("El campo 'mesa' es obligatorio");
            return;
        }

        try {
            // Crear pedido de platos
            if (platosParaEnviar.length > 0) {
                const responsePlatos = await axios.post("http://192.168.1.132:3000/api/pedidos", {
                    mesa,
                    platos: platosParaEnviar,
                    total: totalPlatos.toFixed(2),
                });

                if (responsePlatos.data && responsePlatos.data.message) {
                    console.log('Pedido de platos creado:', responsePlatos.data.message);
                }
            }

            // Crear pedido de bebidas
            if (bebidasParaEnviar.length > 0) {
                const responseBebidas = await axios.post("http://192.168.1.132:3000/api/pedidoBebidas", {
                    mesa,
                    bebidas: bebidasParaEnviar,
                    total: totalBebidas.toFixed(2),
                    precio: bebidasParaEnviar.precio,
                    categoria: bebidasParaEnviar.categoria,
                });

                if (responseBebidas.data && responseBebidas.data.message) {
                    console.log('Pedido de bebidas creado:', responseBebidas.data.message);
                }
            }

        } catch (error) {
            console.error('Error al realizar el pedido:', error);
        }
    };

    return (
        <div className="right-bar">
            {/* Botones de selección */}
            <div className="right-bar-header">
                <button
                    className={`right-bar-btn ${activo === 'comidas' ? 'activo' : ''}`}
                    onClick={() => {
                        setActivo('comidas');
                        setCategoriaSeleccionada(null);
                        setElementos([]);
                    }}
                >
                    Comidas
                </button>
                <button
                    className={`right-bar-btn ${activo === 'bebidas' ? 'activo' : ''}`}
                    onClick={() => {
                        setActivo('bebidas');
                        setCategoriaSeleccionada(null);
                        setElementos([]);
                    }}
                >
                    Bebidas
                </button>
            </div>

            {/* Categorías */}
            {categorias.length > 0 && !categoriaSeleccionada && (
                <div className="categorias">
                    <ul>
                        {categorias.map(categoria => (
                            <li
                                key={categoria._id}  // Asumiendo que cada categoría tiene un _id único
                                className="categoria-item"
                                onClick={() => {
                                    setCategoriaSeleccionada(categoria);
                                    cargarElementos(categoria);  // Cargar los platos al hacer clic
                                }}
                            >
                                {categoria} {/* Asegúrate de que 'nombre' es el campo correcto */}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <ul>
                {elementosConTipo.map((elemento) => (
                    <li
                        key={elemento._id}
                        className="elemento-item"
                        onClick={() =>
                            elemento.tipo === 'plato'
                            ? abrirModalPlato(elemento) // Abrir modal de plato
                            : abrirModalBebida(elemento) // Abrir modal de bebida
                        }
                    >
                        {elemento.nombre}
                    </li>
                ))}
            </ul>

            {/* Modal de Plato */}
            {modalPlatoVisible && platoSeleccionado && (
                <PlatoModal
                    isModalOpen={modalPlatoVisible} // Se pasa la propiedad de apertura del modal
                    handleCloseModal={cerrarModalPlato} // Función para cerrar el modal
                    plato={platoSeleccionado} // El plato seleccionado
                />
            )}

            {/* Modal de Bebida */}
            {modalBebidaVisible && bebidaSeleccionada && (
                <BebidaModal
                    isModalOpen={modalBebidaVisible} // Se pasa la propiedad de apertura del modal
                    handleCloseModal={cerrarModalBebida} // Función para cerrar el modal
                    bebida={bebidaSeleccionada} // La bebida seleccionada
                    onAddBebida={agregarBebida} // Función para agregar bebida
                />
            )}
        </div>
    );
};

export default RightBar;
