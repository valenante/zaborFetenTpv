import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const PlatoOptions = ({
  plato,
  selectedOptions,
  handleOptionChange,
  selectedSize,
  setSelectedSize,
  selectedEspecificacion,
  handleEspecificacionChange,
  selectedPuntosDeCoccion,
  handlePuntosDeCoccionChange,
  mostrarEspecificaciones,
  mostrarTamaño,
  setTipoPlato,
}) => {
  const handleSizeChange = (e) => {
    const size = e.target.value;
    setSelectedSize(size);

    // Actualizar el tipo del plato según la opción seleccionada
    if (size === 'precio') {
      setTipoPlato('plato');
    } else if (size === 'tapa') {
      setTipoPlato('tapa');
    } else if (size === 'racion') {
      setTipoPlato('racion');
    }

  };

  return (
    <div style={{ width: '500px', height: '150px' }}>
      {/* Show size options only if the dish is not "Surtido de Croquetas" */}
      {mostrarTamaño &&
        plato.nombre !== 'Surtido de Croquetas' &&
        (plato.precios.tapa || plato.precios.racion || plato.precios.precio) && (
          <FormControl fullWidth margin="normal">
            <Select value={selectedSize} onChange={handleSizeChange} label="Seleccione tamaño">
              {plato.precios.precio !== null && (
                <MenuItem value="precio">Precio - ${plato.precios.precio}</MenuItem>
              )}
              {plato.precios.tapa !== null && (
                <MenuItem value="tapa">Tapa - ${plato.precios.tapa}</MenuItem>
              )}
              {plato.precios.racion !== null && (
                <MenuItem value="racion">Ración - ${plato.precios.racion}</MenuItem>
              )}
            </Select>
          </FormControl>
        )}

      {/* Show customizable options only if the dish is not "Surtido de Croquetas" */}
      {plato.nombre !== 'Surtido de Croquetas' && plato.opcionesPersonalizables?.length > 0 && plato.opcionesPersonalizables.map((opcion, index) => (
        <FormControl fullWidth margin="normal" key={index}>
          <InputLabel>{opcion.nombre}</InputLabel>
          <Select
            value={selectedOptions[opcion.tipo] || ''}
            onChange={(e) => handleOptionChange(opcion.tipo, e.target.value)}
            label={opcion.nombre}
          >
            {opcion.opciones.map((opcionValue, i) => (
              <MenuItem key={i} value={opcionValue}>
                {opcionValue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      {/* Show cooking level options only if the dish is not "Surtido de Croquetas" */}
      {plato.nombre !== 'Surtido de Croquetas' && plato.puntosDeCoccion?.length > 0 && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Punto de cocción</InputLabel>
          <Select
            value={selectedPuntosDeCoccion}
            onChange={handlePuntosDeCoccionChange}
          >
            {plato.puntosDeCoccion.map((nivel, index) => (
              <MenuItem key={index} value={nivel}>
                {nivel}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Show specifications only if the dish is not "Surtido de Croquetas" */}
      {mostrarEspecificaciones && plato.nombre !== 'Surtido de Croquetas' && plato.especificaciones?.length > 0 && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Especificaciones</InputLabel>
          <Select
            value={selectedEspecificacion}
            onChange={handleEspecificacionChange}
            label="Especificaciones"
          >
            {plato.especificaciones.map((especificacion, index) => (
              <MenuItem key={index} value={especificacion}>
                {especificacion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};

export default PlatoOptions;
