import { useState, useEffect, useRef } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'; 
import './echo.js'; 
import Notificaciones from './Notificaciones';
import Register from './Register'; // <--- 1. IMPORTAMOS EL REGISTRO

function App() {
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState("");
  const [usuario] = useState("Vecino " + Math.floor(Math.random() * 100));

  const [cargando, setCargando] = useState(false); 
  const [mostrarAlerta, setMostrarAlerta] = useState(false); 
  
  const alertaRef = useRef(null); 
  const botonRef = useRef(null);

  // Helper para obtener las cabeceras con el Token de seguridad
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}` // <--- LA LLAVE DE SANCTUM
  });

  useEffect(() => {
    // 2. ACTUALIZADO: Pasamos el token al pedir el historial
    fetch('http://127.0.0.1:8000/api/mensajes', { headers: getHeaders() })
      .then(res => {
          if(!res.ok) throw new Error("No autorizado. ¿Ya te registraste?");
          return res.json();
      })
      .then(data => setMensajes(data))
      .catch(err => console.error(err.message));

    window.Echo.channel('chat-condominio')
      .listen('NuevoMensajeChat', (e) => setMensajes(prev => [...prev, e]));

    return () => window.Echo.leave('chat-condominio');
  }, []);

  const simularNotificacion = async (tipo, texto) => {
    setCargando(true);          
    setMostrarAlerta(false);    

    try {
        // 3. ACTUALIZADO: Pasamos el token al simular la notificación
        const response = await fetch('http://127.0.0.1:8000/api/test-notificacion', {
            method: 'POST', 
            headers: getHeaders(), // Usamos la llave
            body: JSON.stringify({ tipo, texto })
        });
        
        if (!response.ok) {
            // Si Laravel nos bloquea por no ser Admin o no tener token
            const errData = await response.json();
            throw new Error(errData.message || "Error de permisos");
        }

        setMostrarAlerta(true); 
        setTimeout(() => setMostrarAlerta(false), 3000); 

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`); // Mostramos el error real en pantalla
    } finally {
        setCargando(false);     
    }
  };

  const enviarMensaje = async (e) => {
      e.preventDefault();
      if (!inputMensaje) return;
      
      // 4. ACTUALIZADO: Pasamos el token al enviar el chat
      await fetch('http://127.0.0.1:8000/api/enviar-mensaje', {
          method: 'POST', 
          headers: getHeaders(), // Usamos la llave
          body: JSON.stringify({ usuario, mensaje: inputMensaje })
      });
      setInputMensaje(""); 
  };

  // ... (mismo código de lógica arriba)
return (
    <div style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
        
        {/* Registro al inicio */}
        <Register />

        <div className="glass-card" style={{ padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', color: '#60a5fa' }}>🏢 Panel Residencial</h1>
                <Notificaciones />
            </div>

            {/* Botones de Acción */}
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

            {/* Caja de Chat Estilizada */}
            <div style={{ height: '350px', overflowY: 'auto', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '15px', marginBottom: '15px', border: '1px solid #334155' }}>
                {mensajes.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '12px', alignSelf: msg.usuario.includes('Vecino') ? 'flex-start' : 'flex-end' }}>
                        <div style={{ background: '#1e293b', padding: '10px 15px', borderRadius: '12px', borderBottomLeftRadius: '2px', display: 'inline-block', maxWidth: '80%' }}>
                            <strong style={{ color: '#60a5fa', fontSize: '12px', display: 'block' }}>{msg.usuario}</strong>
                            <span style={{ fontSize: '14px' }}>{msg.mensaje}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input del Chat */}
            <form onSubmit={enviarMensaje} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={inputMensaje} onChange={(e) => setInputMensaje(e.target.value)} placeholder="Escribe al grupo..." 
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none' }} />
                <button type="submit" style={{ padding: '0 20px', background: '#3b82f6', borderRadius: '10px', border: 'none', color: 'white', cursor: 'pointer' }}>
                    ➤
                </button>
            </form>
        </div>
    </div>
);
}

export default App