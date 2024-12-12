import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Plato.css';
import PlatoOptions from './PlatoOptions'; // Extraemos opciones personalizables a un componente

const PlatoCard = ({ plato, onAddToCart }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredientes, setIngredientes] = useState(plato.ingredientes);
  const [descripcion, setDescripcion] = useState(plato.descripcion);
  const [selectedCroquetas, setSelectedCroquetas] = useState([]);
  const [cantidad, setCantidad] = useState(1); // Cantidad seleccionada
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleBlur = () => {
    if (cantidad === "") setCantidad(1); // Si el campo está vacío, lo ponemos en 1
  };

  const handleAddToCart = () => {
    if (selectedCroquetas.length !== 6) {
      setSnackbarMessage("Debes seleccionar exactamente 6 croquetas.");
      setOpenSnackbar(true);
      return;
    }

    const platoParaCarrito = {
      ...plato,
      ingredientes,
      descripcion,
      cantidad,
      opcionesPersonalizables: selectedOptions,
      croquetas: selectedCroquetas,
      tipo: 'plato',
    };

    onAddToCart(platoParaCarrito);
    setIsModalOpen(false);
    setSnackbarMessage("Producto agregado correctamente.");
    setOpenSnackbar(true);
  };

  const handleRemoveIngredient = (ingredientToRemove) => {
    setIngredientes(ingredientes.filter((ingrediente) => ingrediente !== ingredientToRemove));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="container my-4">
      <div className="row align-items-center custom-container">
        <div className="col-12 col-md-8 mb-3 mb-md-0">
          <h3 className="plato-title">{plato.nombre}</h3>
          <p className="plato-description">{plato.descripcion}</p>
          <Button
            onClick={handleOpenModal}
            sx={{
              backgroundColor: '#414f7f',
              color: 'white',
              border: 'none',
              '&:hover': { backgroundColor: '#6c7cb4' }
            }}
            className="order-2 order-md-3"
          >
            Agregar al carrito
          </Button>
        </div>
        <div className="col-12 col-md-4 text-center order-1 order-md-2">
          <img src={plato.imagen} alt={plato.nombre} className="img-fluid rounded-img" />
          <div className="plato-price mt-2">
            {plato.precios && <div translate="no">Precio - ${plato.precios.precio}</div>}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} className="plato-modal" sx={{ width: '100%' }}>
        <DialogTitle className="plato-modal-title">{plato.nombre}</DialogTitle>
        <DialogContent>
          <div>{plato.descripcion}</div>
          <h4 className="plato-ingredients-title">Ingredientes:</h4>
          <ul className="list-unstyled">
            {ingredientes.map((ingrediente, index) => (
              <li key={index} className="d-flex justify-content-between align-items-center mb-2">
                {ingrediente}
                <Button variant="outlined" color="error" onClick={() => handleRemoveIngredient(ingrediente)}>
                  Quitar
                </Button>
              </li>
            ))}
          </ul>

          <PlatoOptions
            plato={plato}
            selectedOptions={selectedOptions}
            handleOptionChange={(field, value) =>
              setSelectedOptions({ ...selectedOptions, [field]: value })
            }
            setSelectedCroquetas={setSelectedCroquetas}
          />

          <div className="mt-3">
            <label htmlFor="cantidad">Cantidad:</label>
            <input
              id="cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              onBlur={handleBlur}
              min="1"
              max="10"
              className="form-control"
              style={{ width: '100px', marginTop: '10px' }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleAddToCart} color="primary">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        sx={{
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '16px',
        }}
      />
    </div>
  );
};

export default PlatoCard;
