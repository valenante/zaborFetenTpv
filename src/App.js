import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MesaDetail from './pages/MesaDetail';
import Platos from './pages/Platos';
import Bebidas from './pages/Bebidas';
import Cocina from './pages/Cocina';
import PrivateRoute from './component/PrivateRoute'; // Importa la ruta protegida
import Barra from './pages/Barra';
import CajaDiaria from './component/CajaDiaria';
import { Navigate } from 'react-router-dom';
import ThreeColumnLayout from './pages/Estructura';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Estadisticas from './pages/Estadiscticas';
import MesaView from './pages/MesaView';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Detectar si es una pantalla pequeña

  // Actualizar el estado al cambiar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    // Cleanup al desmontar el componente
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path='/prueba' element={<ThreeColumnLayout />} />
        {/* Ruta pública */}
        <Route path="/" element={<PrivateRoute element={<Register />} roles={['admin']} />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas para el admin */}
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<Dashboard />} roles={['admin', 'waiter']} />}
        />
        <Route
          path="/platos"
          element={<PrivateRoute element={<Platos />} roles={['admin']} />}
        />
        <Route
          path="/estadisticas"
          element={<PrivateRoute element={<Estadisticas />} roles={['admin']} />}
        />
        <Route
          path="/bebidas"
          element={<PrivateRoute element={<Bebidas />} roles={['admin']} />}
        />
        <Route
          path="/caja-diaria"
          element={<PrivateRoute element={<CajaDiaria />} roles={['admin']} />}
        />
        
        {/* Aquí usamos el mismo path para la mesa, pero renderizamos diferente según el tamaño */}
        <Route
          path="/mesas/:id"
          element={
            <PrivateRoute
              element={
                isMobile ? (
                  <div>
                    {/* Aquí renderizas un componente que es diferente para pantallas pequeñas */}
                    {/* Este componente podría ser un `MesaViewMobile` o similar */}
                    <MesaView /> 
                  </div>
                ) : (
                  <div>
                    {/* En pantallas grandes, mostramos el detalle completo */}
                    <MesaDetail />
                  </div>
                )
              }
              roles={['admin', 'waiter']}
            />
          }
        />
        
        <Route
          path="/cocina"
          element={<PrivateRoute element={<Cocina />} roles={['admin','cocinero']} />}
        />
        <Route
          path="/barra"
          element={<PrivateRoute element={<Barra />} roles={['admin','waiter']} />}
        />

        {/* Ruta por defecto para el resto de los casos */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
