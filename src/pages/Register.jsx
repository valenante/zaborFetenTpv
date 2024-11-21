// src/pages/Register.jsx
import React, { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('waiter'); // Valor predeterminado
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para manejar el submit del formulario
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const registerData = {
      username,
      password,
      role,
    };

    try {
      // Realiza la llamada al backend para registrar al usuario
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        // Si la respuesta es exitosa, redirige al login o a una página de éxito
        alert('Usuario registrado con éxito');
        window.location.href = '/login'; // Redirige al login
      } else {
        // Si la respuesta no es exitosa, muestra el mensaje de error
        setErrorMessage(data.message || 'Error al registrar el usuario');
      }
    } catch (error) {
      // Si ocurre un error en la llamada, muestra un mensaje de error
      setErrorMessage('Error de conexión, inténtalo más tarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="waiter">Camarero</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
}

export default Register;
