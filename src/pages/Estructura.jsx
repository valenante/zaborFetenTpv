import React, { useState } from 'react';
import { Modal, Button, Collapse } from 'react-bootstrap';
import '../styles/ThreeColumnLayout.css'; // Archivo de estilos donde puedes agregar personalizaciones

const ThreeColumnLayout = () => {
    const [openLeft, setOpenLeft] = useState(false);
    const [openRight, setOpenRight] = useState(false);
    const [showLeftModal, setShowLeftModal] = useState(false); // Estado para el modal izquierdo
    const [showRightModal, setShowRightModal] = useState(false); // Estado para el modal derecho

    // Funciones para abrir y cerrar los modales
    const handleLeftModalClose = () => setShowLeftModal(false);
    const handleLeftModalShow = () => setShowLeftModal(true);

    const handleRightModalClose = () => setShowRightModal(false);
    const handleRightModalShow = () => setShowRightModal(true);

    return (
        <div className="container-fluid text-center mt-3">
            <div className="row">
                {/* Columna izquierda con el botón de hamburguesa */}
                <div className="col-2 d-flex justify-content-center align-items-center">
                    <button
                        className="btn btn-primary"
                        onClick={handleLeftModalShow}
                    >
                        ☰
                    </button>
                </div>

                {/* Columna central con el contenido */}
                <div className="col-8 center-col">
                    <h2>Pedidos</h2>
                    <p>Contenido de los pedidos.</p>
                </div>

                {/* Columna derecha con el botón de hamburguesa */}
                <div className="col-2 d-flex justify-content-center align-items-center">
                    <button
                        className="btn btn-primary"
                        onClick={handleRightModalShow}
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Modal para la columna izquierda */}
            <Modal show={showLeftModal} onHide={handleLeftModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Columna Izquierda</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Contenido del modal de la columna izquierda.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleLeftModalClose}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handleLeftModalClose}>
                        Guardar cambios
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal para la columna derecha */}
            <Modal show={showRightModal} onHide={handleRightModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Columna Derecha</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Contenido del modal de la columna derecha.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleRightModalClose}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handleRightModalClose}>
                        Guardar cambios
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Menú hamburguesa para pantallas pequeñas (se oculta en pantallas grandes) */}
            <div className="d-md-none">
                <Collapse in={openLeft}>
                    <div className="left-col">
                        <h2>Columna Izquierda</h2>
                        <p>Contenido de la columna izquierda.</p>
                    </div>
                </Collapse>

                <Collapse in={openRight}>
                    <div className="right-col">
                        <h2>Columna Derecha</h2>
                        <p>Contenido de la columna derecha.</p>
                    </div>
                </Collapse>
            </div>
        </div>
    );
};

export default ThreeColumnLayout;
