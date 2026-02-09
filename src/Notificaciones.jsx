import { useState, useEffect } from 'react';

const Notificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [abierto, setAbierto] = useState(false);

    useEffect(() => {
        // Escuchamos el canal de notificaciones
        window.Echo.channel('canal-notificaciones')
            .listen('NuevaNotificacion', (e) => {
                console.log('Notificación recibida:', e.data);
                
                // Agregamos la nueva al principio de la lista
                setNotificaciones(prev => [e.data, ...prev]);
                // Aumentamos el contador rojo
                setNoLeidas(prev => prev + 1);
                
                // Opcional: Sonido de alerta
                // new Audio('/ding.mp3').play().catch(e => {}); 
            });

        return () => {
            window.Echo.leave('canal-notificaciones');
        };
    }, []);

    const manejarClick = () => {
        setAbierto(!abierto);
        if (!abierto) {
            setNoLeidas(0); // Al abrir, reseteamos el contador rojo
        }
    };

    // Diccionario de iconos/colores según tipo
    const estilos = {
        mensaje: { color: '#3b82f6', icono: '💬' },        // Azul
        multa: { color: '#ef4444', icono: '🚨' },          // Rojo
        asamblea: { color: '#10b981', icono: '📢' },       // Verde
        pago_atrasado: { color: '#f59e0b', icono: '💸' }   // Naranja
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* --- BOTÓN CAMPANA --- */}
            <button 
                onClick={manejarClick}
                style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    position: 'relative'
                }}
            >
                🔔
                {noLeidas > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {noLeidas}
                    </span>
                )}
            </button>

            {/* --- LISTA DESPLEGABLE --- */}
            {abierto && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '40px',
                    width: '300px',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    color: 'black',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <h3 style={{ padding: '10px', borderBottom: '1px solid #eee', margin: 0, fontSize: '14px', background: '#f8f9fa' }}>
                        Notificaciones Recientes
                    </h3>
                    
                    {notificaciones.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                            Sin novedades 💤
                        </div>
                    ) : (
                        notificaciones.map((notif, i) => (
                            <div 
                                key={i} 
                                onClick={() => window.location.href = notif.url} // Redirección simple
                                style={{
                                    padding: '10px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'start',
                                    gap: '10px',
                                    background: 'white',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f0f9ff'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <div style={{ fontSize: '20px' }}>
                                    {estilos[notif.tipo]?.icono || 'ℹ️'}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', textTransform: 'capitalize' }}>
                                        {notif.tipo.replace('_', ' ')}
                                    </p>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#555' }}>
                                        {notif.mensaje}
                                    </p>
                                    <span style={{ fontSize: '10px', color: '#999' }}>{notif.fecha}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Notificaciones;