import { useState, useEffect } from 'react'
import './echo.js'; 

function App() {
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState("");
  // Generamos un usuario random, pero si quieres puedes poner uno fijo
  const [usuario] = useState("Vecino " + Math.floor(Math.random() * 100));

  useEffect(() => {
    // 1. CARGAR HISTORIAL DE LA BASE DE DATOS (¡ESTO ES LO NUEVO!)
    fetch('http://127.0.0.1:8000/api/mensajes')
      .then(response => response.json())
      .then(data => {
        console.log("Historial cargado:", data);
        setMensajes(data); // Llenamos el chat con lo que había guardado
      })
      .catch(error => console.error("Error cargando historial:", error));

    // 2. ESCUCHAR NUEVOS MENSAJES (WEBSOCKETS)
    window.Echo.channel('chat-condominio')
      .listen('NuevoMensajeChat', (evento) => {
        console.log("Mensaje nuevo en vivo:", evento);
        // Agregamos el nuevo mensaje a la lista
        setMensajes((mensajesAnteriores) => [...mensajesAnteriores, evento]);
      });

    return () => {
      window.Echo.leave('chat-condominio');
    };
  }, []);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!inputMensaje) return;

    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/enviar-mensaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuario,
          mensaje: inputMensaje
        })
      });

      if (!respuesta.ok) throw new Error("Error en el servidor");
      
      setInputMensaje(""); 
    } catch (error) {
      alert("⚠️ Error: No se pudo enviar.");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial', color: 'white' }}>
      <h1>🏢 Chat del Condominio</h1>
      
      {/* Área de mensajes */}
      <div style={{ 
        border: '1px solid #ccc', 
        height: '300px', 
        overflowY: 'scroll', 
        marginBottom: '10px', 
        padding: '10px',
        borderRadius: '8px',
        background: '#f9f9f9',
        color: 'black' 
      }}>
        {mensajes.length === 0 ? <p style={{color: '#999'}}>Cargando historial o chat vacío...</p> : null}
        
        {mensajes.map((msg, index) => (
          <div key={index} style={{ 
            marginBottom: '10px', 
            padding: '8px', 
            background: 'white', 
            borderRadius: '5px',
            borderBottom: '1px solid #eee' 
          }}>
            <strong>{msg.usuario}:</strong> {msg.mensaje}
          </div>
        ))}
      </div>

      <form onSubmit={enviarMensaje} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={inputMensaje}
          onChange={(e) => setInputMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd', color: 'black' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Enviar
        </button>
      </form>
      
      <p style={{fontSize: '12px', color: '#ccc', marginTop: '10px'}}>
        Tu usuario es: <strong>{usuario}</strong>
      </p>
    </div>
  )
}

export default App