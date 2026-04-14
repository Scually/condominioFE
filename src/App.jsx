import { useState, useEffect, useRef } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'; 
import './echo.js'; 
import Notificaciones from './Notificaciones';
import Register from './Register';
import Login from './Login'; // <--- Importamos Login
import Perfil from './Perfil'; // <--- Importamos Perfil

function App() {
  // --- ESTADO DE AUTENTICACIÓN ---
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState("");
  const [usuario, setUsuario] = useState("Cargando...");

  const [cargando, setCargando] = useState(false); 
  const [mostrarAlerta, setMostrarAlerta] = useState(false); 
  
  const alertaRef = useRef(null); 
  const botonRef = useRef(null);

  // Helper para las cabeceras
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  // Función para actualizar el estado cuando alguien entra
  const actualizarSesion = () => {
    setToken(localStorage.getItem('token'));
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    if (!token) return; // Si no hay token, no intentamos cargar nada

    // 1. Obtener datos del usuario logueado para poner su nombre real
    fetch('http://127.0.0.1:8000/api/user', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => setUsuario(data.name))
      .catch(() => cerrarSesion());

    // 2. Cargar historial
    fetch('http://127.0.0.1:8000/api/mensajes', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => setMensajes(data))
      .catch(err => console.error(err.message));

    // 3. WebSockets
    window.Echo.channel('chat-condominio')
      .listen('NuevoMensajeChat', (e) => setMensajes(prev => [...prev, e]));

    return () => window.Echo.leave('chat-condominio');
  }, [token]); // Se vuelve a ejecutar si el token cambia

  const simularNotificacion = async (tipo, texto) => {
    setCargando(true); setMostrarAlerta(false);    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/test-notificacion', {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({ tipo, texto })
        });
        if (!response.ok) throw new Error("Solo los administradores pueden hacer esto.");
        setMostrarAlerta(true); 
        setTimeout(() => setMostrarAlerta(false), 3000); 
    } catch (error) {
        alert(error.message);
    } finally {
        setCargando(false);     
    }
  };

  const enviarMensaje = async (e) => {
      e.preventDefault();
      if (!inputMensaje) return;
      await fetch('http://127.0.0.1:8000/api/enviar-mensaje', {
          method: 'POST', headers: getHeaders(),
          body: JSON.stringify({ usuario, mensaje: inputMensaje })
      });
      setInputMensaje(""); 
  };

  // --- VISTA PARA USUARIOS NO LOGUEADOS ---
  if (!token) {
    return (
        <div style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#60a5fa', marginBottom: '30px' }}>🏢 Condominio App</h1>
            <Login alLoguear={actualizarSesion} />
            <div style={{ textAlign: 'center', margin: '20px 0', color: '#444' }}>— O si eres nuevo —</div>
            <Register />
        </div>
    );
  }

  // --- VISTA PRINCIPAL (LOGUEADOS) ---
  return (
    <div style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
        
        {/* Alerta de Éxito */}
        <CSSTransition nodeRef={alertaRef} in={mostrarAlerta} timeout={300} classNames="alerta" unmountOnExit>
            <div ref={alertaRef} style={{ position: 'fixed', top: '20px', left: '50%', background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '50px', zIndex: 9999, fontWeight: 'bold' }}>
                ✅ Notificación Enviada
            </div>
        </CSSTransition>

        <div className="glass-card" style={{ padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#60a5fa' }}>🏢 Panel Residencial</h1>
                    <small style={{color: '#666'}}>Bienvenido, {usuario}</small>
                </div>
                <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                    <Notificaciones />
                    <button onClick={cerrarSesion} style={{background: 'none', border: '1px solid #444', color: '#888', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}}>Salir</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
                <button onClick={() => simularNotificacion('multa', '🚨 Ruido en área común')} disabled={cargando}
                    style={{ flex: 1, padding: '12px', background: '#ef4444', borderRadius: '10px', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                    {cargando ? '⏳...' : 'Simular Multa'}
                </button>
                <button onClick={() => simularNotificacion('asamblea', '📢 Asamblea Mañana')}
                    style={{ flex: 1, padding: '12px', background: '#10b981', borderRadius: '10px', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                    📢 Asamblea
                </button>
            </div>

            <div style={{ height: '350px', overflowY: 'auto', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '15px', marginBottom: '15px', border: '1px solid #334155' }}>
                {mensajes.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '12px' }}>
                        <div style={{ background: '#1e293b', padding: '10px 15px', borderRadius: '12px', display: 'inline-block', maxWidth: '80%' }}>
                            <strong style={{ color: '#60a5fa', fontSize: '12px', display: 'block' }}>{msg.usuario}</strong>
                            <span style={{ fontSize: '14px' }}>{msg.mensaje}</span>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={enviarMensaje} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={inputMensaje} onChange={(e) => setInputMensaje(e.target.value)} placeholder="Escribe al grupo..." 
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none' }} />
                <button type="submit" style={{ padding: '0 20px', background: '#3b82f6', borderRadius: '10px', border: 'none', color: 'white', cursor: 'pointer' }}>➤</button>
            </form>
        </div>

        {/* --- COMPONENTE DE SEGURIDAD --- */}
        <Perfil />
    </div>
  );
}

export default App;