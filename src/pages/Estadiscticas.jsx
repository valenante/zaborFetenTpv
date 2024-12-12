import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Estadisticas.css';
import Navbar from '../component/Navbar';
import Subnavbar from '../component/SubNavbar';

const Estadisticas = () => {
    const [vista, setVista] = useState('inicio');
    const [seleccion, setSeleccion] = useState(null);
    const [platos, setPlatos] = useState([]);
    const [bebidas, setBebidas] = useState([]);
    const [categorias, setCategorias] = useState({});
    const [itemsPorCategoria, setItemsPorCategoria] = useState([]);
    const [rangoTiempo, setRangoTiempo] = useState('hoy');
    const [ventas, setVentas] = useState([]);
    const [platosEliminados, setPlatosEliminados] = useState([]);
    const [bebidasEliminadas, setBebidasEliminadas] = useState([]);

    console.log(platosEliminados)


    useEffect(() => {
        // Obtener los datos de la API
        axios.get('http://192.168.1.132:3000/api/platos')
            .then((response) => {
                setPlatos(response.data);
                const categoriasUnicas = [...new Set(response.data.map((plato) => plato.categoria || 'Sin Categoría'))];
                setCategorias((prev) => ({ ...prev, platos: categoriasUnicas }));
            })
            .catch((error) => console.error('Error al obtener los platos:', error));

        axios.get('http://192.168.1.132:3000/api/bebidas')
            .then((response) => {
                setBebidas(response.data);
                const categoriasUnicas = [...new Set(response.data.map((bebida) => bebida.categoria || 'Sin Categoría'))];
                setCategorias((prev) => ({ ...prev, bebidas: categoriasUnicas }));
            })
            .catch((error) => console.error('Error al obtener las bebidas:', error));

        axios.get('http://192.168.1.132:3000/api/ventas')
            .then((response) => {
                setVentas(response.data);
            })
            .catch((error) => console.error('Error al obtener las ventas:', error));

        axios.get('http://192.168.1.132:3000/api/platosEliminados')
            .then((response) => {
                setPlatosEliminados(response.data);
            })
            .catch((error) => console.error('Error al obtener los platos eliminados:', error));

        axios.get('http://192.168.1.132:3000/api/bebidasEliminadas')
            .then((response) => {
                setBebidasEliminadas(response.data);
            })
            .catch((error) => console.error('Error al obtener las bebidas eliminadas:', error));
    }, []);

    const filtrarVentasPorRango = (rango) => {
        const ahora = new Date();
        let fechaLimite;

        switch (rango) {
            case 'hoy':
                fechaLimite = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
                break;
            case 'semana':
                fechaLimite = new Date(ahora);
                fechaLimite.setDate(ahora.getDate() - 7);
                fechaLimite.setHours(0, 0, 0, 0);
                break;
            case 'mes':
                fechaLimite = new Date(ahora);
                fechaLimite.setMonth(ahora.getMonth() - 1);  // El mes anterior
                fechaLimite.setDate(1);  // Establecer el primer día del mes anterior
                fechaLimite.setHours(0, 0, 0, 0);  // Establecer la hora a las 00:00:00
                break;
            case 'año':
                fechaLimite = new Date(ahora);
                fechaLimite.setFullYear(ahora.getFullYear() - 1);  // El año anterior
                fechaLimite.setMonth(0);  // Establecer el primer mes del año anterior
                fechaLimite.setDate(1);  // Establecer el primer día del mes anterior
                fechaLimite.setHours(0, 0, 0, 0);  // Establecer la hora a las 00:00:00
                break;
            case 'todo':
                fechaLimite = new Date(0);  // 1 de enero de 1970
                break;
            default:
                fechaLimite = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
                break;
        }

        return ventas.filter((venta) => {
            const fechaVenta = new Date(venta.fecha);
            return fechaVenta >= fechaLimite;
        });
    };


    // Actualizar la lista de platos o bebidas cuando el rango de tiempo cambia
    useEffect(() => {
        let itemsConVentas = [];
        const ventasFiltradas = filtrarVentasPorRango(rangoTiempo);

        if (seleccion === 'platos') {
            itemsConVentas = platos.map((item) => {
                const ventasItem = ventasFiltradas.filter((venta) => venta.platoId === item._id);
                return {
                    nombre: item.nombre,
                    cantidadVentas: ventasItem.length,
                };
            });
        } else if (seleccion === 'bebidas') {
            itemsConVentas = bebidas.map((item) => {
                const ventasItem = ventasFiltradas.filter((venta) => venta.bebidaId === item._id);
                return {
                    nombre: item.nombre,
                    cantidadVentas: ventasItem.length,
                };
            });
        }

        itemsConVentas.sort((a, b) => b.cantidadVentas - a.cantidadVentas);
        setItemsPorCategoria(itemsConVentas);
    }, [rangoTiempo, seleccion, platos, bebidas, ventas]); // Dependencias para que se actualice

    const mostrarPlatosBebidas = (tipo) => {
        setSeleccion(tipo); // Guardar la selección actual de tipo (platos o bebidas)
        setVista('lista'); // Cambiar la vista a 'lista'
    };

    const mostrarItemsEliminados = (tipo) => {
        setSeleccion(tipo); // Guardar la selección actual de tipo (platos o bebidas)
        setVista('eliminados'); // Cambiar la vista a 'eliminados'
    };

    return (
        <>
            <Navbar />
            <Subnavbar />
            <div className="estadisticas-container">
                <div className="estadisticas-containerMini">
                    {vista === 'inicio' && (
                        <>
                            <button className="estadisticas-btn" onClick={() => mostrarPlatosBebidas('platos')}>
                                Platos
                            </button>
                            <button className="estadisticas-btn" onClick={() => mostrarPlatosBebidas('bebidas')}>
                                Bebidas
                            </button>
                            <button className="estadisticas-btn" onClick={() => mostrarItemsEliminados('platos')}>
                                Platos Eliminados
                            </button>
                            <button className="estadisticas-btn" onClick={() => mostrarItemsEliminados('bebidas')}>
                                Bebidas Eliminadas
                            </button>
                            <button className="estadisticas-btn" onClick={() => window.location.href = '/caja-diaria'}>
                                Caja
                            </button>
                        </>
                    )}

                    {vista === 'eliminados' && (
                        <div className="estadisticas-lista-eliminado">
                            <h2>{seleccion === 'platos' ? 'Platos Eliminados' : 'Bebidas Eliminadas'}</h2>
                            {platosEliminados.length === 0 ? (
                                <div className="no-items-eliminado">
                                    <p>No hay {seleccion === 'platos' ? 'platos' : 'bebidas'} eliminados.</p>
                                </div>
                            ) : (
                                <div className="row-eliminado p-5" style={{ marginTop: '80px' }}>
                                    {platosEliminados.map((item, index) => (
                                        <div key={index} className="lista-item-eliminado">
                                            <div><strong>Plato/Bebida:</strong> {item.platoId ? item.platoId.nombre : item.bebidaId.nombre}</div>
                                            <div><strong>Eliminado por:</strong> {item.userId ? item.userId.username : 'Desconocido'}</div>
                                            <div><strong>Mesa:</strong> {item.mesaId ? item.mesaId.numero : 'Desconocida'}</div>
                                            <div><strong>Fecha de eliminación:</strong> {new Date(item.fechaEliminacion).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}


                    {vista === 'lista' && (
                        <>
                            <div className="estadisticas-lista">
                                <h2>{seleccion === 'platos' ? 'Ventas - Platos' : 'Ventas - Bebidas'}</h2>
                                <div className="filtro-tiempo">
                                    <select value={rangoTiempo} onChange={(e) => setRangoTiempo(e.target.value)} className="form-control">
                                        <option value="hoy">Hoy</option>
                                        <option value="semana">Última semana</option>
                                        <option value="mes">Último mes</option>
                                        <option value="año">Último año</option>
                                        <option value="todo">Desde siempre</option>
                                    </select>
                                </div>

                                {itemsPorCategoria.map((item, index) => {
                                    return (
                                        <div key={index} className="lista-item">
                                            <span className="item-nombre">{item.nombre}</span>
                                            <span className="item-ventas">{item.cantidadVentas} ventas</span>
                                        </div>
                                    );
                                })}

                            </div>
                            <button className="estadisticas-btn-volver" onClick={() => setVista('inicio')}>Volver</button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Estadisticas;
