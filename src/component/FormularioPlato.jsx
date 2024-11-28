import React, { useState, useEffect } from 'react';
import '../styles/FormularioPlato.css';
import axios from 'axios';

const FormularioPlato = ({ plato, cerrarFormulario, setPlatos, platos }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        precios: { tapa: '', racion: '', precio: '' },
        ingredientes: '',
        estado: '',
    });

    console.log(formData);

    useEffect(() => {
        if (plato) {
            setFormData({
                nombre: plato.nombre,
                descripcion: plato.descripcion,
                categoria: plato.categoria || '',
                precios: plato.precios || { tapa: '', racion: '', precio: '' },
                ingredientes: plato.ingredientes || '',
                estado: plato.estado || '',
            });
        }
    }, [plato]);

    // Maneja el cambio en el checkbox
    const handleCheckboxChange = async (e) => {
        const { checked } = e.target;
        const newEstado = checked ? "habilitado" : "deshabilitado";

        const platoId = plato._id;

        // Actualizar el estado del plato en la API
        try {
            await fetch(`http://192.168.1.132:3000/api/platos/${platoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    estado: newEstado,
                }),
            });
            
            // Actualizamos el estado en el formulario
            setFormData((prevState) => ({
                ...prevState,
                estado: newEstado,
            }));
        } catch (error) {
            console.error("Error al actualizar el estado del plato:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('precios.')) {
            const key = name.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                precios: { ...prev.precios, [key]: value },
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Crear una copia del estado formData y transformar precios vacíos a null
        const sanitizedFormData = {
            ...formData,
            precios: {
                tapa: formData.precios.tapa === '' ? null : formData.precios.tapa,
                racion: formData.precios.racion === '' ? null : formData.precios.racion,
                precio: formData.precios.precio === '' ? null : formData.precios.precio,
            },
        };

        const url = `http://192.168.1.132:3000/api/platos/${plato._id}`;
        fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizedFormData),
        })
            .then((response) => response.json())
            .then((data) => {
                setPlatos(platos.map((p) => (p._id === data._id ? data : p)));
                cerrarFormulario();
            })
            .catch((error) => console.error('Error al guardar el plato:', error));
    };

    const handleDelete = () => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este plato?');
        if (!confirmDelete) return;

        const url = `http://192.168.1.132:3000/api/platos/${plato._id}`;
        fetch(url, {
            method: 'DELETE',
        })
            .then((response) => {
                if (response.ok) {
                    setPlatos(platos.filter((p) => p._id !== plato._id));
                    cerrarFormulario();
                } else {
                    console.error('Error al eliminar el plato');
                }
            })
            .catch((error) => console.error('Error al eliminar el plato:', error));
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            <h2 className="form-title">Editar Plato</h2>
            <div className="form-field">
                <label className="form-label">Nombre:</label>
                <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>
            <div className="form-field">
                <label className="form-label">Descripción:</label>
                <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="form-textarea"
                />
            </div>
            <div className="form-field">
                <label className="form-label">Ingredientes: </label>
                <input
                    type="text"
                    name="ingredientes"
                    value={formData.ingredientes}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>
            <div className="form-field">
                <label className="form-label">Categoría:</label>
                <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>
            <div className="form-field">
                <label className="form-label">Precio Tapa:</label>
                <input
                    type="number"
                    name="precios.tapa"
                    value={formData.precios.tapa}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>
            <div className="form-field">
                <label className="form-label">Precio Ración:</label>
                <input
                    type="number"
                    name="precios.racion"
                    value={formData.precios.racion}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>
            <div className="form-field">
                <label className="form-label">Precio General:</label>
                <input
                    type="number"
                    name="precios.precio"
                    value={formData.precios.precio}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>

            <div className="form-field">
                <label className="form-label">
                    Habilitar Plato:
                    <input
                        type="checkbox"
                        name="estado"
                        checked={formData.estado === "habilitado"} // Si está habilitado, el checkbox estará marcado
                        onChange={handleCheckboxChange} // Al marcar/desmarcar cambia el estado
                        style={{ marginLeft: "10px" }} // Añade un margen a la izquierda del checkbox
                    />
                </label>
            </div>

            <div className="form-buttons">
                <button type="submit" className="form-button save-button">
                    Guardar
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="form-button delete-button"
                >
                    Eliminar
                </button>
                <button
                    type="button"
                    onClick={cerrarFormulario}
                    className="form-button"
                >
                    Cancelar
                </button>
            </div>
        </form>

    );
};

export default FormularioPlato;
