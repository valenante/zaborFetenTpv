// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/Login.css';

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
      const response = await fetch('http://192.168.1.132:3000/api/auth/login', {
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
    <div className="lody">
    <div className="login-container">
      <h2 className="login-title">Iniciar sesión</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`login-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
    </div>
  );
}

export default Login;
