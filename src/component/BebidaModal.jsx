import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/BebidaModal.css';
import { Checkbox, FormControlLabel, MenuItem, Select } from '@mui/material';

const BebidaModal = ({ isModalOpen, handleCloseModal, bebida, onAddBebida }) => {
    const [cantidad, setCantidad] = useState(1);
    const [conHielo, setConHielo] = useState(false);
    const [bebidas, setBebidas] = useState(bebida);
    const { numeroMesa } = useParams();
    const [refresco, setRefresco] = useState({ refrescoSeleccionado: '', tomarSolo: false });
    const [refrescos, setRefrescos] = useState([]);  // Estado para almacenar los refrescos disponibles

    const { id } = useParams();

    useEffect(() => {
        axios.get('http://192.168.1.132:3000/api/bebidas')
            .then(response => {
                setBebidas(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    // Cargar refrescos desde la base de datos
    useEffect(() => {
        const fetchRefrescos = async () => {
            try {
                const response = await fetch('http://192.168.1.132:3000/api/bebidas?categoria=refresco');
                const data = await response.json();
                setRefrescos(data);  // Asumiendo que la respuesta es un arreglo de refrescos
            } catch (error) {
                console.error("Error al obtener refrescos:", error);
            }
        };

        fetchRefrescos();
    }, []);

    const handleTomarSoloChange = (event) => {
        setRefresco({ ...refresco, tomarSolo: event.target.checked, refrescoSeleccionado: '' }); // Si toma solo, vacía el refresco
    };

    const handleRefrescoChange = (event) => {
        setRefresco({ ...refresco, refrescoSeleccionado: event.target.value, tomarSolo: false }); // Actualiza el refresco
    };


    // Función para crear el pedido
    const handlePedir = async () => {
        let precioTotal = bebida.precio * cantidad; // Precio base por la cantidad

        // Verifica si el precio total es un número
        if (isNaN(precioTotal) || precioTotal <= 0) {
            alert('El precio total no es válido');
            return;
        }

        const pedidoData = {
            mesa: id,
            bebidas: [
                {
                    bebidaId: bebida._id,
                    nombre: bebida.nombre,
                    cantidad,
                    precio: bebida.precio,
                    categoria: bebida.categoria,
                    acompañante: refresco.tomarSolo ? 'Solo' : refresco.refrescoSeleccionado, // Si toma solo, no asigna refresco
                },
            ],
            total: precioTotal, // Asegúrate de que el total sea un número válido
            estado: 'pendiente',
        };

        try {
            // Crear el pedido
            const response = await fetch('http://192.168.1.132:3000/api/pedidoBebidas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedidoData),
            });
            const data = await response.json();

            if (response.ok) {
                alert(`Pedido creado con éxito! ID: ${data.pedidoId}`);

                // Incrementar las ventas de la bebida
                try {
                    const incrementarResponse = await fetch(
                        `http://192.168.1.132:3000/api/bebidas/${bebida._id}/incrementar-ventas`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ cantidad }), // Incrementa en base a la cantidad pedida
                        }
                    );

                    const incrementarData = await incrementarResponse.json();
                    if (incrementarResponse.ok) {
                        console.log('Ventas de la bebida incrementadas:', incrementarData.message);
                    } else {
                        console.error('Error al incrementar las ventas:', incrementarData.error);
                    }
                } catch (error) {
                    console.error('Error al realizar el incremento de ventas:', error);
                }

                handleCloseModal(); // Cierra el modal al crear el pedido
            } else {
                alert('Error al crear el pedido: ' + data.error);
            }
        } catch (error) {
            console.error('Error al realizar el pedido:', error);
            alert('Hubo un error al realizar el pedido.');
        }
    };


    return (
        <Dialog open={isModalOpen} onClose={handleCloseModal}>
            <DialogTitle>{bebida.nombre}</DialogTitle>
            <DialogContent>
                <div>{bebida.descripcion}</div>

                {/* Selección de refresco o "Tomar solo" */}
                {['ron', 'whisky', 'vodka', 'ginebra', 'licor'].includes(bebida.categoria) && (
                    <>
                        <FormControlLabel
                            control={<Checkbox checked={refresco.tomarSolo} onChange={handleTomarSoloChange} />}
                            label="Tomar solo"
                        />
                        {!refresco.tomarSolo && (
                            <Select
                                value={refresco.refrescoSeleccionado}
                                onChange={handleRefrescoChange}
                                fullWidth
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    Selecciona un refresco
                                </MenuItem>
                                {refrescos.map((refresco, index) => (
                                    <MenuItem key={index} value={refresco._id}>
                                        {refresco.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    </>
                )}
                <label>Cantidad:</label>
                <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, e.target.value))}
                    min="1"
                    className="form-control"
                />
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={conHielo}
                            onChange={(e) => setConHielo(e.target.checked)}
                        />
                        Con hielo
                    </label>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal}>Cancelar</Button>
                <Button onClick={handlePedir} color="primary">Agregar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BebidaModal;
