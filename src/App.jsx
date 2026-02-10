import { useState, useEffect, useRef } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'; // <--- IMPORTANTE: Las animaciones
import './echo.js'; 
import Notificaciones from './Notificaciones';

function App() {
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState("");
  const [usuario] = useState("Vecino " + Math.floor(Math.random() * 100));

  // --- NUEVOS ESTADOS PARA LA ANIMACIÓN ---
  const [cargando, setCargando] = useState(false); // Controla el estado "Enviando..."
  const [mostrarAlerta, setMostrarAlerta] = useState(false); // Controla la alerta verde
  
  // Referencias necesarias para react-transition-group (evita errores en consola)
  const alertaRef = useRef(null); 
  const botonRef = useRef(null);

  useEffect(() => {
    // 1. Cargar historial
    fetch('http://127.0.0.1:8000/api/mensajes')
      .then(res => res.json())
      .then(data => setMensajes(data))
      .catch(err => console.error(err));

    // 2. WebSockets Chat
    window.Echo.channel('chat-condominio')
      .listen('NuevoMensajeChat', (e) => setMensajes(prev => [...prev, e]));

    return () => window.Echo.leave('chat-condominio');
  }, []);

  // --- FUNCIÓN QUE CONECTA CON EL BACKEND "LENTO" ---
  const simularNotificacion = async (tipo, texto) => {
    setCargando(true);          // 1. Cambia el botón a "Enviando..."
    setMostrarAlerta(false);    // 2. Oculta alerta anterior si existe

    try {
        // Hacemos la petición (Tardará 2 segundos por el sleep del Laravel)
        await fetch('http://127.0.0.1:8000/api/test-notificacion', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ tipo, texto })
        });
        
        // Al terminar la espera:
        setMostrarAlerta(true); // 3. Muestra la alerta verde animada
        
        // 4. Programamos que se oculte sola a los 3 segundos
        setTimeout(() => setMostrarAlerta(false), 3000); 

    } catch (error) {
        console.error(error);
        alert("Error al conectar");
    } finally {
        setCargando(false);     // 5. Restaura el botón a su estado normal
    }
  };

  // Función normal del chat
  const enviarMensaje = async (e) => {
      e.preventDefault();
      if (!inputMensaje) return;
      await fetch('http://127.0.0.1:8000/api/enviar-mensaje', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, mensaje: inputMensaje })
      });
      setInputMensaje(""); 
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial', color: 'white' }}>
      
      {/* --- 1. ALERTA DE ÉXITO ANIMADA (CSSTransition) --- */}
      <CSSTransition
          nodeRef={alertaRef}
          in={mostrarAlerta}
          timeout={300}
          classNames="alerta"
          unmountOnExit
      >
          <div ref={alertaRef} style={{
              position: 'fixed', top: '20px', left: '50%', // Centrado absoluto arriba
              background: '#10b981', color: 'white', padding: '12px 24px', 
              borderRadius: '50px', boxShadow: '0 10px 15px rgba(0,0,0,0.3)', 
              zIndex: 9999, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
              ✅ ¡Notificación Enviada con Éxito!
          </div>
      </CSSTransition>

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{margin: 0}}>🏢 Chat Condominio</h1>
          <Notificaciones />
      </div>

      {/* --- 2. BOTONES CON TRANSICIÓN DE CARGA (SwitchTransition) --- */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        
        {/* Botón Multa (El que tiene la animación compleja) */}
        <button 
            onClick={() => simularNotificacion('multa', '🚨 Ruido excesivo')}
            disabled={cargando}
            style={{ 
                padding: '12px 20px', background: cargando ? '#6b7280' : '#ef4444', 
                color: 'white', border: 'none', borderRadius: '8px', cursor: cargando ? 'wait' : 'pointer',
                fontWeight: 'bold', minWidth: '160px', overflow: 'hidden', position: 'relative'
            }}
        >
            <SwitchTransition mode="out-in">
                <CSSTransition
                    key={cargando ? "cargando" : "multa"}
                    nodeRef={botonRef}
                    timeout={200}
                    classNames="boton"
                >
                    <div ref={botonRef} style={{ display: 'inline-block' }}>
                        {cargando ? "⏳ Enviando..." : "🚨 Simular Multa"}
                    </div>
                </CSSTransition>
            </SwitchTransition>
        </button>

        {/* Botón Asamblea (Simple, usa la misma función) */}
        <button 
             onClick={() => simularNotificacion('asamblea', '📢 Reunión General')}
             disabled={cargando}
             style={{ padding: '12px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
            📢 Simular Asamblea
        </button>
      </div>

      {/* Chat Area */}
      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', marginBottom: '10px', padding: '10px', borderRadius: '8px', background: '#f9f9f9', color: 'black' }}>
        {mensajes.map((msg, index) => (
          <div key={index} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '5px', borderBottom: '1px solid #eee' }}>
            <strong>{msg.usuario}:</strong> {msg.mensaje}
          </div>
        ))}
      </div>

      {/* Formulario Chat */}
      <form onSubmit={enviarMensaje} style={{ display: 'flex', gap: '10px' }}>
        <input type="text" value={inputMensaje} onChange={(e) => setInputMensaje(e.target.value)} placeholder="Escribe un mensaje..." style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd', color: 'black' }} />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Enviar</button>
      </form>
      
      <p style={{fontSize: '12px', color: '#ccc', marginTop: '10px'}}>
        Tu usuario es: <strong>{usuario}</strong>
      </p>
    </div>
  )
}

export default App