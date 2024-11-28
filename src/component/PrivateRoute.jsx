import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Asumimos que tienes un hook para manejar el estado de autenticación

function PrivateRoute({ element, roles }) {
  const { role, loading } = useAuth(); // Obtiene el rol del usuario y el estado de carga

  // Mientras se obtiene el rol del usuario, mostramos un loading o una pantalla en blanco
  if (loading) {
    return <div>Loading...</div>; // Puedes cambiar esto por un spinner o algo más apropiado
  }

  // Si no hay rol asignado, redirige al login
  if (role === null) {
    return <Navigate to="/login" />;
  }

  // Si el rol tiene acceso, renderiza el componente
  if (roles.includes(role)) {
    return element;
  }

  // Si el rol no tiene acceso, redirige al login
  return <Navigate to="/login" />;
}

export default PrivateRoute;
