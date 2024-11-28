import React, { useState, useEffect } from 'react';

const FormularioBebida = ({ bebida, cerrarFormulario, setBebidas, bebidas }) => {
    const [nombre, setNombre] = useState(bebida.nombre);
    const [descripcion, setDescripcion] = useState(bebida.descripcion);
    const [categoria, setCategoria] = useState(bebida.categoria);
    const [precio, setPrecio] = useState(bebida.precio);
    const [imagen, setImagen] = useState(bebida.imagen || '');
    const [imagenFile, setImagenFile] = useState(null);  // Para almacenar la imagen seleccionada
    const [estado, setEstado] = useState(bebida.estado === 'habilitado');  // Checkbox marcado si está habilitada

    useEffect(() => {
        setNombre(bebida.nombre);
        setDescripcion(bebida.descripcion);
        setCategoria(bebida.categoria);
        setPrecio(bebida.precio);
        setImagen(bebida.imagen || '');
        setEstado(bebida.estado);  // Sincronizar estado con el valor de la bebida
    }, [bebida]);

    // Función para manejar el cambio de la imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImagenFile(file);
        if (file) {
            setImagen(URL.createObjectURL(file)); // Vista previa de la imagen
        }
    };

    const handleEstadoChange = () => {
        const newEstado = !estado;  // Alterna entre habilitado y deshabilitado
        setEstado(newEstado);  // Actualiza el estado en el frontend
    
        // Realizar una actualización en la base de datos
        fetch(`http://192.168.1.132:3000/api/bebidas/${bebida._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                estado: newEstado ? 'habilitado' : 'deshabilitado', // Actualiza el estado en la DB
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setBebidas(bebidas.map((b) => (b._id === data._id ? data : b))); // Actualiza la bebida en el estado
            })
            .catch((error) => console.error('Error al actualizar el estado de la bebida:', error));
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedBebida = {
            ...bebida,
            nombre,
            descripcion,
            categoria,
            precio,
            imagen: imagenFile ? imagen : bebida.imagen, // Si hay una imagen nueva, usarla
            estado: estado ? 'HABILITADO' : 'DESHABILITADO', // Actualiza el estado según el checkbox
        };

        // Crear un FormData para enviar los datos y la imagen
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('categoria', categoria);
        formData.append('precio', precio);
        formData.append('imagen', imagenFile); // Agregar la imagen al FormData
        formData.append('estado', estado ? 'HABILITADO' : 'DESHABILITADO'); // Agregar el estado

        // Enviar los datos al backend
        fetch(`http://192.168.1.132:3000/api/bebidas/${bebida._id}`, {
            method: 'PUT',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                setBebidas(bebidas.map((b) => (b._id === data._id ? data : b))); // Actualizamos el estado
                cerrarFormulario();
            })
            .catch((error) => console.error('Error al actualizar la bebida:', error));
    };

    const handleDelete = () => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta bebida?');
        if (!confirmDelete) return;

        const url = `http://192.168.1.132:3000/api/bebidas/${bebida._id}`;
        fetch(url, {
            method: 'DELETE',
        })
            .then((response) => {
                if (response.ok) {
                    setBebidas(bebidas.filter((p) => p._id !== bebida._id));
                    cerrarFormulario();
                } else {
                    console.error('Error al eliminar la bebida');
                }
            })
            .catch((error) => console.error('Error al eliminar la bebida:', error));
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Editar Bebida</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-input"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea
                        className="form-textarea"
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="categoria" className="form-label">Categoría</label>
                    <input
                        type="text"
                        className="form-input"
                        id="categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        required
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="precio" className="form-label">Precio</label>
                    <input
                        type="number"
                        className="form-input"
                        id="precio"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                    />
                </div>

                {/* Imagen */}
                <div className="form-field">
                    <label htmlFor="imagen" className="form-label">Imagen</label>
                    <input
                        type="file"
                        className="form-input"
                        id="imagen"
                        onChange={handleImageChange}
                    />
                    {/* Mostrar imagen previa si existe */}
                    {imagen && <img src={imagen} alt="Vista previa" className="mt-2" style={{ width: '100px', height: 'auto' }} />}
                </div>

                {/* Checkbox de estado */}
                <div className='mb-2'>
                    <label htmlFor="estado" className="form-label">Habilitar Bebida</label>
                    <input
                        type="checkbox"
                        id="estado"
                        checked={estado}
                        onChange={handleEstadoChange}
                        style={{ marginLeft: '10px' }}
                    />
                </div>

                <div className="form-buttons">
                    <button type="submit" className="form-button-bebida save-button-bebida">Guardar</button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="form-button-bebida cancel-button"
                    >
                        Eliminar
                    </button>
                    <button type="button" className="form-button-bebida" onClick={cerrarFormulario}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default FormularioBebida;
