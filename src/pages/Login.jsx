// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  // Usamos 'useNavigate' para redirigir

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

        // Verifica el rol del usuario para redirigir al dashboard adecuado
        const decodedToken = jwtDecode(data.token); // Decodifica el JWT
        if (decodedToken.role === 'admin' || decodedToken.role === 'waiter') {
          navigate('/dashboard');  // Redirige al dashboard de admin
        } else {
          navigate('/cocina');   // Redirige a una vista para usuarios normales
        }
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
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}

export default Login;
