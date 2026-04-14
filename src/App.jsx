import { useState, useEffect, useRef } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'; 
import './echo.js'; 
import Notificaciones from './Notificaciones';
import Register from './Register';
import Login from './Login';
import Perfil from './Perfil';
import RecoverPassword from './RecoverPassword'; // <--- IMPORTAMOS EL NUEVO COMPONENTE

function App() {
  // --- ESTADOS DE AUTENTICACIÓN Y NAVEGACIÓN ---
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [vistaActiva, setVistaActiva] = useState('chat'); 
  const [mostrandoRecuperar, setMostrandoRecuperar] = useState(false); // <--- NUEVO ESTADO
  
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState("");
  const [usuario, setUsuario] = useState("Cargando...");

  const [cargando, setCargando] = useState(false); 
  const [mostrarAlerta, setMostrarAlerta] = useState(false); 
  
  const alertaRef = useRef(null); 
  const botonRef = useRef(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const actualizarSesion = () => {
    setToken(localStorage.getItem('token'));
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    if (!token) return;

    fetch('http://127.0.0.1:8000/api/user', { headers: getHeaders() })
      .then(res => {
          if(!res.ok) throw new Error("Sesión expirada");
          return res.json();
      })
      .then(data => setUsuario(data.name))
      .catch(() => cerrarSesion());

    fetch('http://127.0.0.1:8000/api/mensajes', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => setMensajes(data))
      .catch(err => console.error(err.message));

    window.Echo.channel('chat-condominio')
      .listen('NuevoMensajeChat', (e) => setMensajes(prev => [...prev, e]));

    return () => window.Echo.leave('chat-condominio');
  }, [token]);

  const simularNotificacion = async (tipo, texto) => {
    setCargando(true); 
    setMostrarAlerta(false);    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/test-notificacion', {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({ tipo, texto })
        });
        if (!response.ok) throw new Error("Acceso denegado.");
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

  // --- RENDERIZADO PARA USUARIOS NO AUTENTICADOS ---
  if (!token) {
    return (
        <div style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#60a5fa', marginBottom: '30px' }}>🏢 Condominio App</h1>
            
            {/* LÓGICA DE RECUPERACIÓN O LOGIN */}
            {mostrandoRecuperar ? (
                <RecoverPassword alCerrar={() => setMostrandoRecuperar(false)} />
            ) : (
                <>
                    <Login alLoguear={actualizarSesion} />
                    <button 
                        onClick={() => setMostrandoRecuperar(true)}
                        style={{ display: 'block', margin: '0 auto', background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>
                        ¿Olvidaste tu contraseña?
                    </button>
                    <div style={{ textAlign: 'center', margin: '20px 0', color: '#444' }}>— O —</div>
                    <Register />
                </>
            )}
        </div>
    );
  }

  // --- RENDERIZADO PARA USUARIOS AUTENTICADOS ---
  return (
    <div style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px' }}>
            <button onClick={() => setVistaActiva('chat')} style={{ background: 'none', border: 'none', color: vistaActiva === 'chat' ? '#60a5fa' : '#666', fontWeight: 'bold', cursor: 'pointer', borderBottom: vistaActiva === 'chat' ? '2px solid #60a5fa' : 'none', paddingBottom: '5px' }}>💬 Mensajes</button>
            <button onClick={() => setVistaActiva('perfil')} style={{ background: 'none', border: 'none', color: vistaActiva === 'perfil' ? '#60a5fa' : '#666', fontWeight: 'bold', cursor: 'pointer', borderBottom: vistaActiva === 'perfil' ? '2px solid #60a5fa' : 'none', paddingBottom: '5px' }}>👤 Mi Perfil</button>
            <button onClick={cerrarSesion} style={{ background: '#7f1d1d', color: '#f87171', border: 'none', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Salir</button>
        </div>

        <CSSTransition nodeRef={alertaRef} in={mostrarAlerta} timeout={300} classNames="alerta" unmountOnExit>
            <div ref={alertaRef} style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '50px', zIndex: 9999, fontWeight: 'bold', boxShadow: '0 10px 15px rgba(0,0,0,0.3)' }}>✅ Notificación Enviada con Éxito</div>
        </CSSTransition>

        {vistaActiva === 'chat' ? (
            <div className="glass-card" style={{ padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px', color: '#60a5fa' }}>🏢 Panel Residencial</h2>
                        <small style={{color: '#666'}}>Bienvenido, <strong>{usuario}</strong></small>
                    </div>
                    <Notificaciones />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
                    <button onClick={() => simularNotificacion('multa', '🚨 Ruido en área común')} disabled={cargando} style={{ flex: 1, padding: '12px', background: '#ef4444', borderRadius: '10px', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{cargando ? '⏳ Procesando...' : '🚨 Simular Multa'}</button>
                    <button onClick={() => simularNotificacion('asamblea', '📢 Asamblea Mañana')} style={{ flex: 1, padding: '12px', background: '#10b981', borderRadius: '10px', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>📢 Asamblea</button>
                </div>

                <div style={{ height: '350px', overflowY: 'auto', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '15px', marginBottom: '15px', border: '1px solid #334155' }}>
                    {mensajes.length === 0 && <p style={{textAlign: 'center', color: '#444', marginTop: '150px'}}>No hay mensajes en el historial.</p>}
                    {mensajes.map((msg, index) => (
                        <div key={index} style={{ marginBottom: '12px' }}>
                            <div style={{ background: '#1e293b', padding: '10px 15px', borderRadius: '12px', display: 'inline-block', maxWidth: '85%' }}>
                                <strong style={{ color: '#60a5fa', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>{msg.usuario}</strong>
                                <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{msg.mensaje}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={enviarMensaje} style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" value={inputMensaje} onChange={(e) => setInputMensaje(e.target.value)} placeholder="Escribe un mensaje al grupo..." style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none' }} />
                    <button type="submit" style={{ padding: '0 25px', background: '#3b82f6', borderRadius: '10px', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>➤</button>
                </form>
            </div>
        ) : (
            <Perfil />
        )}
    </div>
  );
}

export default App;