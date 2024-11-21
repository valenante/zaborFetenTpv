import React from 'react';
import '../styles/Navbar.css'; // Este archivo contendrá los estilos

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
            <img src="/images/logoZF.webp" alt="Logo ZF" className="logo" />
            </div>
        </nav>
    );
};

export default Navbar;
