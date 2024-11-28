import React, { useEffect, useState } from 'react';

const BebidaAcompanante = ({ bebida }) => {
    const [acompananteNombre, setAcompananteNombre] = useState('');

    useEffect(() => {
        // Verificar que el ID del acompañante exista
        if (bebida.acompañante) {
            // Hacer la solicitud para obtener el nombre del acompañante
            fetch(`http://192.168.1.132:3000/api/bebidas/${bebida.acompañante}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.nombre) {
                        setAcompananteNombre(data.nombre);
                    } else {
                        setAcompananteNombre('Acompañante no encontrado');
                    }
                })
                .catch((error) => {
                    console.error('Error al obtener el acompañante:', error);
                    setAcompananteNombre('Error al obtener el acompañante');
                });
        }
    }, [bebida.acompañante]); // Se ejecuta cada vez que cambia el ID del acompañante

    return (
        <p style={{ fontSize: '1.2rem', color: '#512e5f', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>
            {acompananteNombre}
        </p>
    );
};

export default BebidaAcompanante;
