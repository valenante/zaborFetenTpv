import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import PlatoOptions from './PlatoOptions'; 
import SurtidoCroquetasForm from './SurtidoDeCroquetasForm'; 
import { useParams } from 'react-router-dom';
import '../styles/PlatoModal.css';

const PlatoModal = ({ isModalOpen, handleCloseModal, plato, handleAddToCart, actualizarPedidos }) => {
  const [cantidad, setCantidad] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedEspecificacion, setSelectedEspecificacion] = useState(null);
  const [selectedPuntosDeCoccion, setSelectedPuntosDeCoccion] = useState(null);
  const [selectedCroquetas, setSelectedCroquetas] = useState([]);
  const [ingredientes, setIngredientes] = useState(plato.ingredientes);
  const [precio, setPrecio] = useState(0);

  const { numeroMesa } = useParams();

  useEffect(() => {
    if (!plato.precios.tapa && !plato.precios.racion) {
      setPrecio(plato.precios.precio);
      setSelectedSize('precio');
    }
  }, [plato.precios]);

  const handleCantidadChange = (e) => {
    const value = Math.min(Math.max(e.target.value, 1), 10);
    setCantidad(value);
  };

  const handleOptionChange = (option) => {
    setSelectedOptions((prevOptions) => {
      const isOptionSelected = prevOptions.includes(option);
      return isOptionSelected
        ? prevOptions.filter((opt) => opt !== option)
        : [...prevOptions, option];
    });
  };

  const handleRemoveIngredient = (ingredientToRemove) => {
    setIngredientes((prevIngredientes) => prevIngredientes.filter((ingrediente) => ingrediente !== ingredientToRemove));
  };

  // Función para crear el pedido
  const handlePedir = async () => {
    let selectedPrice = 0;

    if (selectedSize === 'tapa' && plato.precios.tapa) {
      selectedPrice = plato.precios.tapa;
    } else if (selectedSize === 'racion' && plato.precios.racion) {
      selectedPrice = plato.precios.racion;
    } else {
      selectedPrice = plato.precios.precio;
    }

    console.log(selectedSize)

    // Calcular el total del pedido basado en el precio y la cantidad
    let precioTotal = selectedPrice * cantidad; // Precio base por la cantidad
    
    
    // Verifica si el precio total es un número
    if (isNaN(precioTotal) || precioTotal <= 0) {
      alert('El precio total no es válido');
      return;
    }
  
    const pedidoData = {
        mesa: numeroMesa,
      platos: [
        {
          platoId: plato._id,
          nombre: plato.nombre,
          cantidad,
          opciones: selectedOptions,
          size: selectedSize,
          especificacion: selectedEspecificacion,
          puntosDeCoccion: selectedPuntosDeCoccion,
          croquetas: selectedCroquetas,
          ingredientes,
          precios: selectedPrice,
        },
      ],
      total: precioTotal, // Asegúrate de que el total sea un número válido
      estado: 'pendiente',
    };
  
    try {
      const response = await fetch('http://192.168.1.132:3000/api/pedidos', {
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
    <Dialog open={isModalOpen} onClose={handleCloseModal} className="plato-modal" sx={{ width: '100%' }}>
      <DialogTitle className="plato-modal-title">{plato.nombre}</DialogTitle>
      <DialogContent>
        {plato.ingredientes?.length > 0 && (
          <>
            <h4 className="plato-ingredients-title">Ingredientes:</h4>
            <ul className="list-unstyled">
              {ingredientes.map((ingrediente, index) => (
                <li key={index} className="d-flex justify-content-between align-items-center mb-2">
                  {ingrediente}
                  <Button variant="outlined" onClick={() => handleRemoveIngredient(ingrediente)}>
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}

        <PlatoOptions
          plato={plato}
          mostrarEspecificaciones={plato.nombre !== 'Surtido de Croquetas'}
          mostrarTamaño={plato.nombre !== 'Surtido de Croquetas'}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedOptions={selectedOptions}
          handleOptionChange={handleOptionChange}
          selectedEspecificacion={selectedEspecificacion}
          handleEspecificacionChange={setSelectedEspecificacion}
          selectedPuntosDeCoccion={selectedPuntosDeCoccion}
          handlePuntosDeCoccionChange={setSelectedPuntosDeCoccion}
        />

        {plato.nombre === 'Surtido de Croquetas' && (
          <SurtidoCroquetasForm onUpdateCroquetas={setSelectedCroquetas} plato={plato} />
        )}

        <div className="mt-3">
          <label htmlFor="cantidad">Cantidad:</label>
          <input
            id="cantidad"
            type="number"
            value={cantidad}
            onChange={handleCantidadChange}
            min="1"
            max="10"
            className="form-control"
            style={{ width: '100px', marginTop: '10px' }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal}>Cancelar</Button>
        <Button color="primary" onClick={handlePedir}>
          Pedir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlatoModal;
