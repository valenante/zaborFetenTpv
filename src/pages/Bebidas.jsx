import React, { useState, useEffect } from 'react';
import Modal from 'react-modal'; // Librería para manejar modales
import FormularioBebida from '../component/FormularioBebida';
import '../styles/Bebidas.css';
import FormularioNuevaBebida from '../component/FormularioNuevaBebida';
import Navbar from '../component/Navbar';
import SubNavbar from '../component/SubNavbar';

Modal.setAppElement('#root'); // Esto es importante para accesibilidad

const Bebidas = () => {
    const [categorias, setCategorias] = useState([]); // Lista de categorías de bebidas
    const [bebidas, setBebidas] = useState([]); // Todas las bebidas
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null); // Categoría activa
    const [bebidaSeleccionada, setBebidaSeleccionada] = useState(null); // Bebida activa
    const [modalAbierto, setModalAbierto] = useState(false); // Estado del modal para editar bebida
    const [mostrarModalBebidaNueva, setMostrarModalBebidaNueva] = useState(false); // Modal para nueva bebida

    useEffect(() => {
        fetch('http://192.168.1.132:3000/api/bebidas') // Ajusta la URL según tu backend
            .then((response) => response.json())
            .then((data) => {
                setBebidas(data);

                // Extraer categorías únicas de las bebidas
                const categoriasUnicas = [
                    ...new Set(data.map((bebida) => bebida.categoria || 'Sin Categoría')),
                ];
                setCategorias(categoriasUnicas);
            })
            .catch((error) => console.error('Error al obtener las bebidas:', error));
    }, []);

    // Filtrar bebidas por categoría seleccionada
    const bebidasFiltradas = categoriaSeleccionada
        ? bebidas.filter((bebida) => bebida.categoria === categoriaSeleccionada)
        : [];

    // Abrir el modal con los datos de la bebida seleccionada
    const abrirModal = (bebida) => {
        setBebidaSeleccionada(bebida);
        setModalAbierto(true);
    };

    // Cerrar el modal
    const cerrarModal = () => {
        setBebidaSeleccionada(null);
        setModalAbierto(false);
    };

    const abrirModalBebidaNueva = () => setMostrarModalBebidaNueva(true);
    const cerrarModalBebidaNueva = () => setMostrarModalBebidaNueva(false);

    return (
        <>
        <Navbar />
        <SubNavbar />
        <div className="bebidas-contenedor">
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
                    <button onClick={abrirModalBebidaNueva} style={{
                            padding: '10px',
                            fontSize: '16px',
                            border: 'none',
                            borderRadius: '10px',
                            backgroundColor: '#774b89',
                            color: 'white',
                            cursor: 'pointer',
                            marginTop: '20px',
                        }}>Nueva Bebida</button>

                    {/* Modal para nueva bebida */}
                    {mostrarModalBebidaNueva && (
                        <Modal
                            isOpen={mostrarModalBebidaNueva}
                            onRequestClose={cerrarModalBebidaNueva}
                            contentLabel="Agregar Nueva Bebida"
                            style={{
                                content: {
                                    maxWidth: '500px',
                                    margin: 'auto',
                                    border: '2px solid #5e3a69',
                                    borderRadius: '10px',
                                    padding: '20px',
                                    height: 'fit-content',
                                },
                            }}
                        >
                            <FormularioNuevaBebida
                                cerrarModal={cerrarModalBebidaNueva}
                                setBebidas={setBebidas}
                            />
                        </Modal>
                    )}
                </div>
            ) : (
                <div className="bebidas-wrapper">
                    <div className="bebidas-container">
                        {bebidasFiltradas.map((bebida) => (
                            <div key={bebida._id} className="bebida-card">
                                <h4>{bebida.nombre}</h4>
                                <button
                                    className="editar-button"
                                    onClick={() => abrirModal(bebida)}
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

            {/* Modal para editar bebida */}
            {modalAbierto && bebidaSeleccionada && (
                <Modal
                    isOpen={modalAbierto}
                    onRequestClose={cerrarModal}
                    contentLabel="Editar Bebida"
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
                    <FormularioBebida
                        bebida={bebidaSeleccionada}
                        cerrarFormulario={cerrarModal}
                        setBebidas={setBebidas}
                        bebidas={bebidas}
                    />
                </Modal>
            )}
        </div>
        </>
    );
};

export default Bebidas;
