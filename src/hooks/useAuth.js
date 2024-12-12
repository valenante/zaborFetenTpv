import { useState, useEffect } from 'react';

function useAuth() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Añadimos un estado de carga

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://192.168.1.132:3000/api/auth', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setRole(data.user.role); // Almacena el rol del usuario
        }
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      } finally {
        setLoading(false); // Cuando termine la solicitud, cambiamos el estado de carga
      }
    };

    fetchUserRole();
  }, []);

  return { role, loading };
}

export default useAuth;
