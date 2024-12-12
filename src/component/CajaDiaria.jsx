import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/CajaDiaria.css'; // Asegúrate de tener este archivo para los estilos personalizados
import Navbar from './Navbar';
import Subnavbar from './SubNavbar';
import zoomPlugin from 'chartjs-plugin-zoom';


const CajaDiaria = () => {
    const [cajas, setCajas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Obtener los datos de la caja diaria desde el backend
        axios.get('http://192.168.1.132:3000/api/cajaDiaria')
            .then((response) => {
                setCajas(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError('Error al obtener los datos de la caja diaria.');
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p>{error}</p>;

    // Preparar datos para el gráfico
    const data = {
        labels: cajas.map(caja => new Date(caja.fecha).toLocaleDateString()), // Fechas como etiquetas en el eje X
        datasets: [
            {
                label: 'Caja Diaria (€)',
                data: cajas.map(caja => caja.total), // Valores de la caja
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                tension: 0.1, // Suavidad de las líneas
            },
        ],
    };

    const downloadChart = () => {
        const canvas = document.querySelector('canvas');
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'grafico-caja-diaria.png';
        link.click();
      };

    const options = {
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'xy',  // Permite mover el gráfico tanto en el eje X como en el Y
            },
            zoom: {
              enabled: true,
              mode: 'xy',  // Permite hacer zoom tanto en el eje X como en el Y
            },
          },
          legend: {
            position: 'top',
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fecha',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Total (€)',
            },
            beginAtZero: true,
          },
        },
      };

    return (
        <>
        <Navbar />
        <Subnavbar />
        <div className="parent-container">
            <div className="caja-diaria-container centered">
                <h2>Histórico de Caja Diaria</h2>
                <div className="chart-wrapper">
                <button onClick={downloadChart} class="descarga-grafico">Descargar Gráfico</button>
                    <Line data={data} options={options} />
                </div>
            </div>
        </div>
        </>
    );
};

export default CajaDiaria;