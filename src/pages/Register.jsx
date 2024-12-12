import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import '../styles/Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // Este es el rol fijo para enviar al backend
  const [selectedRole, setSelectedRole] = useState('waiter'); // Estado para manejar el rol visible en el formulario
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Usamos useNavigate para redirigir

  // Obtener los datos del usuario autenticado
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token'); // Suponiendo que guardaste el token en localStorage

      try {
        const response = await fetch('http://192.168.1.132:3000/api/auth', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Incluir el token en los encabezados
          },
        });

        const data = await response.json();

        setRole(data.user.role); // Almacena el rol del usuario

      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        setErrorMessage('Error de conexión, inténtalo más tarde');
      }
    };

    fetchUserData();
  }, [navigate]); // Dependencia de navigate para asegurar que se use la redirección

  // Función para manejar el submit del formulario
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const registerData = {
      username,
      password,
      role: selectedRole, // Enviamos el rol seleccionado en el formulario
    };

    console.log(role);

    try {
      // Realiza la llamada al backend para registrar al usuario
      const response = await fetch('http://192.168.1.132:3000/api/auth/register', {
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
        navigate('/login'); // Redirige al login
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
    <div className="lody">
      <div className="register-container">
        <h2 className="register-title">Registro de Usuario</h2>
        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label className="label">Username:</label>
            <input
              className="input-field"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Password:</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {setRole && (
            <div className="form-group">
              <label className="label">Role:</label>
              <select
                className="input-field"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                required
              >
                <option value="waiter">Camarero</option>
                <option value="admin">Administrador</option>
                <option value="cocinero">Cocinero</option>
              </select>
            </div>
          )}
          {!setRole && (
            <div className="form-group">
              <label className="label">Role:</label>
              <input
                className="input-field"
                type="text"
                value={role}
                readOnly
              />
            </div>
          )}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button className={`login-button ${loading ? 'loading' : ''}`} type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrar'}
          </button>
        </form>
      </div>
    </div>
  )
};

export default Register;
