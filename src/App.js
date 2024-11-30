import React from 'react';
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
import { Navigate } from 'react-router-dom';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
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
          path="/bebidas"
          element={<PrivateRoute element={<Bebidas />} roles={['admin']} />}
        />
        <Route
          path="/mesas/:id"
          element={<PrivateRoute element={<MesaDetail />} roles={['admin', 'waiter']} />}
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
