import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const BottomBar = () => {
    const {numeroMesa} = useParams();
    const navigate = useNavigate();

        // Realizar la solicitud PUT para cerrar la mesa
        const onCloseTable = async () => {
          try {
            const response = await fetch(`http://192.168.1.132:3000/api/mesas/cerrar/${numeroMesa}`, {
              method: "PUT", // Usamos el método PUT para actualizar la mesa
              headers: {
                "Content-Type": "application/json", // Indicamos que el cuerpo es JSON
              },
            });
    
            const data = await response.json();
            
            if (response.ok) {
              console.log("Mesa cerrada correctamente:", data);
              navigate("/dashboard");
              // Aquí puedes agregar un mensaje de éxito o redirigir al usuario
            } else {
              console.error("Error al cerrar la mesa:", data.error);
              // Puedes manejar el error aquí (mostrar mensaje, etc.)
            }
          } catch (error) {
            console.error("Error de red:", error);
          }
        };
    
    

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}
      elevation={3}
    >
      <BottomNavigation showLabels sx={{height: '80px', backgroundColor: 'rgb(117, 10, 156)', padding: '10px'
}}>
        <BottomNavigationAction
          label="Cerrar Mesa"
          icon={<CloseIcon />}
          onClick={onCloseTable }
          sx={{ backgroundColor: 'rgb(140,12,12)', borderRadius: '10px', marginRight: '10px', color: 'white' }}
        />
        <BottomNavigationAction
          label="Imprimir Cuenta"
          icon={<PrintIcon />}
          sx={{ backgroundColor: 'rgb(140,12,12)', borderRadius: '10px', color: 'white' }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomBar;
