import React from 'react';
import '../styles/SubNavbar.css'; // Este archivo contendrá los estilos

const SubNavbar = () => {
    return (
        <nav className="subnavbar">
            <ul className="nav-links">
                <li><a href="/dashboard">Inicio</a></li>
                <li><a href="/platos">Platos</a></li>
                <li><a href="/bebidas">Bebidas</a></li>
                <li><a href="/cocina">Cocina</a></li>
                <li><a href="/barra">Barra</a></li>
            </ul>
        </nav>
    );
};

export default SubNavbar;
