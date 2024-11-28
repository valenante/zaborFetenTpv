// src/api/index.js

const BASE_URL = 'http://192.168.1.132:3000/api';

export const obtenerMesas = async () => {
    const response = await fetch(`${BASE_URL}/mesas/mesas`);
    if (!response.ok) throw new Error('Error al obtener mesas');
    return response.json();
};

export const obtenerPedidosPorMesa = async (mesaId) => {
    const response = await fetch(`${BASE_URL}/pedidos/mesa/${mesaId}`);
    if (!response.ok) throw new Error('Error al obtener pedidos');
    return response.json();
};

export const agregarPlato = async (platoData) => {
    const response = await fetch(`${BASE_URL}/platos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(platoData),
    });
    if (!response.ok) throw new Error('Error al agregar plato');
    return response.json();
};

export const modificarPlato = async (id, platoData) => {
    const response = await fetch(`${BASE_URL}/platos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(platoData),
    });
    if (!response.ok) throw new Error('Error al modificar plato');
    return response.json();
};

export const eliminarPlato = async (id) => {
    const response = await fetch(`${BASE_URL}/platos/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar plato');
    return response.json();
};

export const actualizarPedido = async (id, pedidoData) => {
    const response = await fetch(`${BASE_URL}/pedidos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData),
    });
    if (!response.ok) throw new Error('Error al actualizar pedido');
    return response.json();
};

export const obtenerPedidosPendientes = async () => {
    const response = await fetch('http://192.168.1.132:3000/api/pedidos/pendientes');
    if (!response.ok) {
        throw new Error('Error al obtener pedidos pendientes');
    }
    const data = await response.json();
    console.log(data)
    return data;
};

export const marcarPedidoComoFinalizado = async (pedidoId) => {
    const response = await fetch(`http://192.168.1.132:3000/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'finalizado' }), // Cambia el estado a 'finalizado'
    });
    if (!response.ok) {
        throw new Error('Error al marcar el pedido como finalizado');
    }
    return response.json();
};


// Nueva función para cerrar la mesa
export const cerrarMesa = async (mesaId) => {
    const response = await fetch(`http://192.168.1.132:3000/api/mesas/cerrar-mesa/${mesaId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Error al cerrar la mesa');
    }
    return response.json();
};
export const obtenerPlatos = async () => {
    const response = await fetch(`${BASE_URL}/platos`);
    if (!response.ok) throw new Error('Error al obtener platos');
    return response.json();
}

export const eliminarPlatoDePedido = async (pedidoId, productoId) => {
    const response = await fetch(`${BASE_URL}/pedidos/${pedidoId}/eliminar-plato`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productoId }),
    });
    
    if (!response.ok) throw new Error('Error al eliminar plato del pedido');
    return response.json();
};


export const agregarPlatoAPedido = async (pedidoId, platoId, cantidad) => {
    console.log(pedidoId, 'EL PEDIDO')
    console.log(platoId, 'EL PLATO')
    const response = await fetch(`${BASE_URL}/pedidos/${pedidoId}/agregar-plato`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platoId, cantidad }),
    });
    if (!response.ok) throw new Error('Error al agregar plato al pedido');
    return response.json();
};
