import React, { useState, useEffect } from 'react';
import Modal from 'react-modal'; // Librería para manejar modales
import FormularioPlato from '../component/FormularioPlato';
import '../styles/Platos.css';
import FormularioNuevoPlato from '../component/FormularioNuevoPlato';
import Navbar from '../component/Navbar';
import SubNavbar from '../component/SubNavbar';

Modal.setAppElement('#root'); // Esto es importante para accesibilidad

const Platos = () => {
    const [categorias, setCategorias] = useState([]); // Lista de categorías
    const [platos, setPlatos] = useState([]); // Todos los platos
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null); // Categoría activa
    const [platoSeleccionado, setPlatoSeleccionado] = useState(null); // Plato activo
    const [modalAbierto, setModalAbierto] = useState(false); // Estado del modal
    const [mostrarModal, setMostrarModalPlatoNuevo] = useState(false); // Estado del modal para nuevo plato

    // Cargar los platos al cargar el componente
    useEffect(() => {
        fetch('http://192.168.1.132:3000/api/platos')
            .then((response) => response.json())
            .then((data) => {
                setPlatos(data);

                // Extraer categorías únicas de los platos
                const categoriasUnicas = [
                    ...new Set(data.map((plato) => plato.categoria || 'Sin Categoría')),
                ];
                setCategorias(categoriasUnicas);
            })
            .catch((error) => console.error('Error al obtener los platos:', error));
    }, []);

    // Filtrar platos por categoría seleccionada
    const platosFiltrados = categoriaSeleccionada
        ? platos.filter((plato) => plato.categoria === categoriaSeleccionada)
        : [];

    // Abrir el modal con los datos del plato seleccionado
    const abrirModal = (plato) => {
        setPlatoSeleccionado(plato);
        setModalAbierto(true);
    };

    // Cerrar el modal
    const cerrarModal = () => {
        setPlatoSeleccionado(null);
        setModalAbierto(false);
    };

    const abrirModalPlatoNuevo = () => setMostrarModalPlatoNuevo(true);
    const cerrarModalPlatoNuevo = () => setMostrarModalPlatoNuevo(false);


    return (
        <>
            <Navbar />
            <SubNavbar />
            <div className="platos-contenedor">
                {!categoriaSeleccionada ? (
                    <div className="categorias-wrapper">
                        <div className="categorias-container">
                            {categorias.map((categoria, index) => (
                                <div
                                    key={index}
                                    className="categoria-box"
                                    onClick={() => setCategoriaSeleccionada(categoria)}
                                >
                                    <span className="categoria-text">{categoria}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={abrirModalPlatoNuevo} style={{
                            padding: '10px',
                            fontSize: '16px',
                            border: 'none',
                            borderRadius: '10px',
                            backgroundColor: '#620375',
                            color: 'white',
                            cursor: 'pointer',
                            marginTop: '20px',
                        }}>Nuevo Plato</button>

                        {mostrarModal && (
                            <Modal
                                isOpen={mostrarModal}
                                onRequestClose={cerrarModalPlatoNuevo}
                                contentLabel="Nuevo Plato"
                                style={{
                                    content: {
                                        maxWidth: '500px',
                                        margin: 'auto',
                                        borderRadius: '10px',
                                        padding: '20px',
                                        height: 'fit-content',
                                    },
                                }}
                            >
                            <FormularioNuevoPlato
                                cerrarModal={cerrarModalPlatoNuevo}
                                setPlatos={setPlatos}
                            />
                            </Modal>
                            )}
                            
                    </div>
                ) : (
                    <div className="platos-wrapper">
                        <div className="platos-container">
                            {platosFiltrados.map((plato) => (
                                <div key={plato._id} className="plato-card">
                                    <h4>{plato.nombre}</h4>
                                    <button
                                        className="editar-button"
                                        onClick={() => abrirModal(plato)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            className="volver-button"
                            onClick={() => setCategoriaSeleccionada(null)}
                        >
                            Volver a Categorías
                        </button>
                    </div>

                )}

                {/* Modal para editar plato */}
                {modalAbierto && platoSeleccionado && (
                    <Modal
                        isOpen={modalAbierto}
                        onRequestClose={cerrarModal}
                        contentLabel="Editar Plato"
                        style={{
                            content: {
                                maxWidth: '500px',
                                margin: 'auto',
                                borderRadius: '10px',
                                padding: '20px',
                                height: 'fit-content',
                            },
                        }}
                    >
                        <FormularioPlato
                            plato={platoSeleccionado}
                            cerrarFormulario={cerrarModal}
                            setPlatos={setPlatos}
                            platos={platos}
                        />
                    </Modal>
                )}
            </div>
        </>
    );
};

export default Platos;
