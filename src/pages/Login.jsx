// src/pages/Login.jsx
import React, { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para manejar el submit del formulario
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const loginData = {
      username,
      password,
    };

    try {
      // Realiza la llamada al backend para autenticar al usuario
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        // Si la respuesta es exitosa, guardamos el token en el localStorage
        localStorage.setItem('token', data.token);
        // Redirigir al dashboard o a la página deseada
        window.location.href = '/dashboard';
      } else {
        // Si la respuesta no es exitosa, mostramos el mensaje de error
        setErrorMessage(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      // Si ocurre un error en la llamada, mostramos un mensaje de error
      setErrorMessage('Error de conexión, inténtalo más tarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}

export default Login;
