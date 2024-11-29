import React, { useState, useEffect } from 'react';
import '../styles/FormularioNuevaBebida.css';

const FormularioNuevaBebida = ({ cerrarModal, setBebidas }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: '',
        img: null,
    });
    const [categorias, setCategorias] = useState([]); // Para guardar las categorías dinámicas

    useEffect(() => {
        // Cargar categorías desde la API
        const fetchCategorias = async () => {
            try {
                const response = await fetch('http://192.168.1.132:3000/api/bebidas/categorias/bebidas');
                const data = await response.json();
                if (response.ok) {
                    setCategorias(data); // Supongo que `data` es un array de categorías
                } else {
                    console.error('Error al cargar las categorías:', data.error);
                }
            } catch (error) {
                console.error('Error al conectar con la API de categorías:', error);
            }
        };

        fetchCategorias();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'img') {
            setFormData((prev) => ({
                ...prev,
                [name]: e.target.files[0], // Almacena el archivo directamente
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
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
            payload.append('img', formData.img);

            const response = await fetch('http://192.168.1.132:3000/api/bebidas', {
                method: 'POST',
                body: payload,
            });

            console.log(formData.img);

            if (!formData.img) {
                alert('Por favor, selecciona una imagen antes de enviar el formulario.');
                return;
            }


            const data = await response.json();
            if (response.ok) {
                setBebidas((prevBebidas) => [...prevBebidas, data]);
                cerrarModal(); // Cierra el modal
            } else {
                alert('Error al crear la bebida: ' + data.error);
            }
        } catch (error) {
            console.error('Error al crear la bebida:', error);
        }
    };

    return (
        <div className="formulario-nueva-bebida">
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        required
                        style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                        }}
                    />
                </div>
                <div>
                    <label htmlFor="categoria">Categoría</label>
                    <select
                        id="categoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Seleccionar una categoría
                        </option>
                        {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.nombre}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="precio">Precio</label>
                    <input
                        type="number"
                        id="precio"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="img">Seleccionar Imagen</label>
                    <input
                        type="file"
                        id="img"
                        name="img"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </div>
                <div className="botones">
                    <button type="submit" className='boton'>Agregar Bebida</button>
                    <button type="button" onClick={cerrarModal} className="modal-button-cancel">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioNuevaBebida;
