import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import PlatoOptions from './PlatoOptions'; 
import SurtidoCroquetasForm from './SurtidoDeCroquetasForm'; 
import { useParams } from 'react-router-dom';
import '../styles/PlatoModal.css';

const PlatoModal = ({ isModalOpen, handleCloseModal, plato }) => {
  const [cantidad, setCantidad] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null); // Default "tapa"
  const [tipoPlato, setTipoPlato] = useState('tapa');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedEspecificacion, setSelectedEspecificacion] = useState(null);
  const [selectedPuntosDeCoccion, setSelectedPuntosDeCoccion] = useState(
    plato.puntosDeCoccion?.[0] || '' // Usa el primer valor del array, o una cadena vacía si no hay opciones
  );  
  const [selectedCroquetas, setSelectedCroquetas] = useState([]);
  const [ingredientes, setIngredientes] = useState(plato.ingredientes);
  const [selectedTipoServicio, setSelectedTipoServicio] = useState('compartir');
  const [precio, setPrecio] = useState(0);
  const { id } = useParams();

  // Configurar el valor predeterminado según los precios del plato
  useEffect(() => {
    if (plato.precios.tapa !== null) {
      setSelectedSize('tapa');
      setTipoPlato('tapa');
    } else if (plato.precios.racion !== null) {
      setSelectedSize('racion');
      setTipoPlato('racion');
    } else if (plato.precios.precio !== null) {
      setSelectedSize('precio');
      setTipoPlato('plato');
    }
  }, [plato, setTipoPlato]);

  const handleSizeChange = (e) => {
    const size = e.target.value;
    setSelectedSize(size);

    if (size === 'precio') {
      setTipoPlato('plato');
    } else if (size === 'tapa') {
      setTipoPlato('tapa');
    } else if (size === 'racion') {
      setTipoPlato('racion');
    }
  };

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

  const handlePuntosDeCoccionChange = (event) => {
    setSelectedPuntosDeCoccion(event.target.value);
  };  

  const handleTipoServicioChange = (e) => {
    setSelectedTipoServicio(e.target.value);
  };


  // Función para crear el pedido
  const handlePedir = async () => {
    let selectedPrice = 0;
  
    // Verificar que el valor de tipoPlato sea uno de los valores válidos
    const tiposValidos = ['plato', 'tapa', 'racion'];
    if (!tiposValidos.includes(plato.tipo)) {
      alert('El tipo del plato no es válido.');
      return;
    }
  
    // Determinar el precio basado en el tipo y el tamaño seleccionado
    if (tipoPlato === 'tapa' && plato.precios.tapa) {
      selectedPrice = plato.precios.tapa;
    } else if (tipoPlato === 'racion' && plato.precios.racion) {
      selectedPrice = plato.precios.racion;
    } else {
      selectedPrice = plato.precios.precio;
    }
  
    console.log(selectedSize);
  
    // Calcular el total del pedido basado en el precio y la cantidad
    let precioTotal = selectedPrice * cantidad; // Precio base por la cantidad
  
    // Verifica si el precio total es un número válido
    if (isNaN(precioTotal) || precioTotal <= 0) {
      alert('El precio total no es válido');
      return;
    }
  
    const pedidoData = {
        mesa: id,
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
          tipo: tipoPlato,
          tipoServicio: selectedTipoServicio,
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

        // Incrementar las ventas de la bebida
        try {
            const incrementarResponse = await fetch(
                `http://192.168.1.132:3000/api/platos/${plato._id}/incrementar-ventas`,
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
                console.log('Ventas de los platos incrementadas:', incrementarData.message);
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
    <Dialog open={isModalOpen} onClose={handleCloseModal} className="plato-modal" sx={{ width: '100%' }}>
      <DialogTitle className="plato-modal-title">{plato.nombre}</DialogTitle>
      <DialogContent>
        {plato.ingredientes?.length > 0 && (
          <>
            <h4 className="plato-ingredients-title mt-3">Ingredientes:</h4>
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
          handleSizeChange={handleSizeChange}
          handleOptionChange={handleOptionChange}
          selectedEspecificacion={selectedEspecificacion}
          handleEspecificacionChange={setSelectedEspecificacion}
          selectedPuntosDeCoccion={handlePuntosDeCoccionChange}
          handlePuntosDeCoccionChange={setSelectedPuntosDeCoccion}
          setTipoPlato={setTipoPlato} // Pasamos la función para actualizar tipoPlato
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
        <div className="col-6">
                <label htmlFor="servingStyle">Para:</label>
                <select
                  id="servingStyle"
                  value={selectedTipoServicio}
                  onChange={handleTipoServicioChange}
                  className="form-control"
                  style={{ marginTop: '10px' }}
                >
                  <option value="compartir">Compartir</option>
                  <option value="individual">Individual</option>
                </select>
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
