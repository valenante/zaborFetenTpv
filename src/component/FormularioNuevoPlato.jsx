import React, { useState } from 'react';
import '../styles/FormularioNuevoPlato.css'; // Asegúrate de crear tu CSS para el modal y el formulario

const FormularioNuevoPlato = ({ cerrarModal, setPlatos }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precios: { precio: '', racion: '', tapa: '' },
        ingredientes: [''], // Un array de ingredientes vacío inicialmente
        opcionesPersonalizables: [{ tipo: '', opciones: [''] }],
        puntosDeCoccion: [''], // Lista de puntos de cocción
        especificaciones: [''], // Lista de especificaciones
        imagen: '',
        categoria: 'especiales', // Por defecto 'Especiales'
        estado: 'habilitado', // Por defecto 'activo'
        tipo: 'plato',
    });

    const handleChange = (e, index, tipo) => {
        const { name, value } = e.target;
        if (name.startsWith('precios.')) {
            const key = name.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                precios: { ...prev.precios, [key]: value },
            }));
        } else if (name === 'ingredientes') {
            setFormData({ ...formData, ingredientes: value.split(',') });
        } else if (name.startsWith('opcionesPersonalizables')) {
            const newOptions = [...formData.opcionesPersonalizables];
            if (tipo === 'tipo') {
                newOptions[index].tipo = value; // Actualizar solo el tipo
            } else if (tipo === 'opciones') {
                newOptions[index].opciones = value.split(',').map((opcion) => opcion.trim()); // Convertir las opciones a un array
            }
            setFormData({ ...formData, opcionesPersonalizables: newOptions });
        } else if (name === 'puntosDeCoccion') {
            setFormData({ ...formData, puntosDeCoccion: value.split(',') });
        } else if (name === 'especificaciones') {
            setFormData({ ...formData, especificaciones: value.split(',') });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleChangeTipo = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === 'tapa-racion') {
            setFormData({
                ...formData,
                tipo: ['tapa', 'racion'], // Si selecciona "Tapa y Ración", es un array con ambos tipos
            });
        } else {
            setFormData({
                ...formData,
                tipo: selectedValue, // Si selecciona "Plato", es solo un valor simple
            });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();

            // Convertir los arrays complejos a cadenas JSON antes de agregarlos a FormData
            for (const key in formData) {
                if (formData[key] && Array.isArray(formData[key])) {
                    payload.append(key, JSON.stringify(formData[key])); // Convertir arrays a JSON string
                } else if (formData[key] && typeof formData[key] === 'object') {
                    payload.append(key, JSON.stringify(formData[key])); // Convertir objetos a JSON string
                } else {
                    payload.append(key, formData[key]);
                }
            }

            //Enviar imagen
            payload.append('imagen', formData.imagen);

            const response = await fetch('http://192.168.1.132:3000/api/platos', {
                method: 'POST',
                body: payload,
            });

            console.log(formData);

            const data = await response.json();
            if (response.ok) {
                setPlatos((prevPlatos) => [...prevPlatos, data]); // Actualiza la lista de platos
                cerrarModal(); // Cierra el modal después de guardar
            } else {
                alert('Error al crear el plato: ' + data.error);
            }
        } catch (error) {
            console.error('Error al crear el plato:', error);
        }
    };


    return (
        <div className="modal">
            <div className="modal-content">
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Nombre:</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="modal-input"
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Descripción:</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className="modal-textarea"
                                    required
                                    style={{
                                        maxWidth: '300px',
                                        maxHeight: '200px',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Precios (Plato Unico):</label>
                                <input
                                    type="number"
                                    name="precios.precio"
                                    value={formData.precios.precio}
                                    onChange={handleChange}
                                    className="modal-input"
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Precios (Ración):</label>
                                <input
                                    type="number"
                                    name="precios.racion"
                                    value={formData.precios.racion}
                                    onChange={handleChange}
                                    className="modal-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Precios (Tapa):</label>
                                <input
                                    type="number"
                                    name="precios.tapa"
                                    value={formData.precios.tapa}
                                    onChange={handleChange}
                                    className="modal-input"
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Ingredientes Seleccionables (separados por comas):</label>
                                <input
                                    type="text"
                                    name="ingredientes"
                                    value={formData.ingredientes.join(',')}
                                    onChange={handleChange}
                                    className="modal-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Opciones Personalizables:</label>
                                {formData.opcionesPersonalizables.map((opcion, index) => (
                                    <div key={index} className="modal-opciones-group">
                                        <input
                                            type="text"
                                            name={`opcionesPersonalizables.${index}.tipo`}
                                            value={opcion.tipo}
                                            onChange={(e) => handleChange(e, index, 'tipo')} // Cambiar solo el tipo
                                            className="modal-input"
                                            placeholder="Tipo de opción (Ej: queso, acompañamiento)"
                                        />
                                        <input
                                            type="text"
                                            name={`opcionesPersonalizables.${index}.opciones`}
                                            value={opcion.opciones.join(',')} // Mostrar las opciones como una cadena separada por comas
                                            onChange={(e) => handleChange(e, index, 'opciones')} // Cambiar las opciones
                                            className="modal-input"
                                            placeholder="Opciones separadas por comas"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Puntos de Cocción (separados por comas):</label>
                                <input
                                    type="text"
                                    name="puntosDeCoccion"
                                    value={formData.puntosDeCoccion.join(',')}
                                    onChange={handleChange}
                                    className="modal-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Especificaciones (separadas por comas):</label>
                                <input
                                    type="text"
                                    name="especificaciones"
                                    value={formData.especificaciones.join(',')}
                                    onChange={handleChange}
                                    className="modal-input"
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Seleccionar imagen:</label>
                                <input
                                    type="file"
                                    name="imagen"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            imagen: e.target.files[0],
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Categoría:</label>
                                <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    className="modal-select"
                                    required
                                >
                                    <option value="especiales">Especiales</option>
                                    <option value="carne">Carne</option>
                                    <option value="ensaladas">Ensaladas</option>
                                    <option value="tapas">Tapas</option>
                                    <option value="vegetarianos">Vegetarianos</option>
                                    <option value="mar">Mar</option>
                                    <option value="hambuguesas">Hamburguesas</option>
                                    <option value="postres">Postres</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Estado:</label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    className="modal-select"
                                >
                                    <option value="habilitado">Habilitado</option>
                                    <option value="inhabilitado">Inhabilitado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="modal-form-group">
                                <label className="modal-label">Tipo:</label>
                                <select
                                    name="tipo"
                                    value={Array.isArray(formData.tipo) ? 'tapa-racion' : formData.tipo} // Si es array, mostramos "tapa-racion"
                                    onChange={handleChangeTipo} // Maneja el cambio
                                    className="modal-select"
                                    required
                                >
                                    <option value="plato">Plato</option>
                                    <option value="tapa-racion">Tapa y Ración</option>
                                </select>
                            </div>
                        </div>
                    </div>




                    <div className="modal-buttons">
                        <button type="submit" className="modal-button">Crear Plato</button>
                        <button type="button" onClick={cerrarModal} className="modal-button-cancel">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );

};

export default FormularioNuevoPlato;