import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/BebidaModal.css';

const BebidaModal = ({ isModalOpen, handleCloseModal, bebida, onAddBebida }) => {
    const [cantidad, setCantidad] = useState(1);
    const [conHielo, setConHielo] = useState(false);
    const [acompañante, setAcompañante] = useState('');
    const [bebidas, setBebidas] = useState(bebida);
    const { numeroMesa } = useParams();

    useEffect(() => {
        axios.get('http://192.168.1.132:3000/api/bebidas')
            .then(response => {
                setBebidas(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    // Función para crear el pedido
    const handlePedir = async () => {
        let precioTotal = bebidas[0].precio * cantidad; // Precio base por la cantidad

        // Verifica si el precio total es un número
        if (isNaN(precioTotal) || precioTotal <= 0) {
            alert('El precio total no es aaaaaaaaaaaaaaválido');
            return;
        }

        const pedidoData = {
            mesa: numeroMesa,
            bebidas: [
                {
                    bebidaId: bebida._id,
                    nombre: bebida.nombre,
                    cantidad,
                    precio: bebida.precio,
                    categoria: bebida.categoria,
                },
            ],
            total: precioTotal, // Asegúrate de que el total sea un número válido
            estado: 'pendiente',
        };

        try {
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
