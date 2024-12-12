import React, { useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Modal, Box, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const BottomBar = () => {
    const { id } = useParams(); // Asumiendo que el parámetro es 'id'
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(""); // Para mostrar errores en la UI
    const [openModal, setOpenModal] = useState(false); // Controlar la apertura del modal
    const [efectivo, setEfectivo] = useState(""); // Cantidad en efectivo
    const [tarjeta, setTarjeta] = useState(""); // Cantidad en tarjeta
    const [validationError, setValidationError] = useState(""); // Errores de validación en el modal
    const [total, setTotal] = useState(""); // Total a pagar
    console.log(total);

    useEffect(() => {
        // Obtener el total de la mesa desde el backend
        const fetchTotal = async () => {
            try {
                const response = await fetch(`http://192.168.1.132:3000/api/mesas/${id}`);
                const data = await response.json();
                console.log(data.total);
                if (response.ok) {
                    setTotal(data.total); // Actualiza el estado con el total
                } else {
                    console.error("Error al obtener el total:", data.error);
                    setErrorMessage(data.error || "Error desconocido al obtener el total");
                }
            } catch (error) {
                console.error("Error de red:", error);
                setErrorMessage("Error de red: " + error.message);
            }
        };

        fetchTotal(); // Llama a la función para obtener el total
    }, [id]); // El efecto se ejecuta al montar o cuando cambia el `id`

    // Función para validar los montos
    const validatePayment = () => {
        const efectivoValue = parseFloat(efectivo) || 0;
        const tarjetaValue = parseFloat(tarjeta) || 0;

        if (efectivoValue + tarjetaValue !== total) {
            setValidationError(`El total pagado (${efectivoValue + tarjetaValue}) no coincide con el total (${total}).`);
            return false;
        }

        setValidationError(""); // Limpia errores si todo es válido
        return true;
    };

    // Realizar la solicitud PUT para cerrar la mesa
    const onCloseTable = async () => {
        if (total > 0) {
            if (!validatePayment()) return; // Valida antes de cerrar la mesa si el total es mayor que 0
        }

        try {
            const response = await fetch(`http://192.168.1.132:3000/api/mesas/cerrar/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pagos: {
                        efectivo: parseFloat(efectivo) || 0,
                        tarjeta: parseFloat(tarjeta) || 0,
                    },
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Mesa cerrada correctamente:", data);
                setOpenModal(false); // Cierra el modal
                navigate("/dashboard"); // Redirige
            } else {
                console.error("Error al cerrar la mesa:", data.error);
                setErrorMessage(data.error || "Error desconocido al cerrar la mesa");
            }
        } catch (error) {
            console.error("Error de red:", error);
            setErrorMessage("Error de red: " + error.message);
        }
    };

    return (
        <>
            <Paper
                sx={{
                    bottom: 0,
                    left: 0,
                    right: 0
                }}
                elevation={3}
            >
                <BottomNavigation showLabels sx={{ height: '80px', backgroundColor: '#774b89', padding: '10px' }}>
                    <BottomNavigationAction
                        label="Cerrar Mesa"
                        icon={<CloseIcon />}
                        onClick={() => {
                            if (total > 0) {
                                setOpenModal(true); // Abre el modal solo si el total es mayor que 0
                            } else {
                                onCloseTable(); // Cierra la mesa directamente si el total es 0
                            }
                        }}
                        sx={{ backgroundColor: 'rgb(140,12,12)', borderRadius: '10px', marginRight: '10px', color: 'white' }}
                    />
                    <BottomNavigationAction
                        label="Imprimir Cuenta"
                        icon={<PrintIcon />}
                        sx={{ backgroundColor: 'rgb(140,12,12)', borderRadius: '10px', color: 'white' }}
                    />
                </BottomNavigation>

                {errorMessage && (
                    <div style={{ color: 'red', padding: '10px', textAlign: 'center' }}>
                        {errorMessage} {/* Mostrar el mensaje de error en la UI */}
                    </div>
                )}
            </Paper>

            {/* Modal para el pago */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: '#512e5f',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        minWidth: 300,
                        color: 'white',
                    }}
                >
                    <h2 style={{ textAlign: 'center' }}>Cerrar Mesa</h2>
                    <p>Total a pagar: <b>{total} €</b></p>
                    <TextField
                        label="Pago en Efectivo (€)"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={efectivo}
                        onChange={(e) => setEfectivo(e.target.value)}
                        style={{ marginBottom: '10px', backgroundColor: 'white',borderRadius: '5px' }}
                    />
                    <TextField
                        label="Pago con Tarjeta (€)"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={tarjeta}
                        onChange={(e) => setTarjeta(e.target.value)}
                        style={{ marginBottom: '10px', backgroundColor: 'white',borderRadius: '5px' }}
                    />
                    {validationError && (
                        <p style={{ color: 'red', textAlign: 'center' }}>{validationError}</p>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setOpenModal(false)}
                            style={{ backgroundColor: 'rgba(204, 102, 0, 1)', color: 'white' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onCloseTable}
                            style={{ backgroundColor: 'rgba(204, 102, 0, 1)', color: 'white' }}
                        >
                            Confirmar
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default BottomBar;
