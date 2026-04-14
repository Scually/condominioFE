import { useState } from 'react';

const Login = ({ alLoguear }) => {
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');

    const acceder = async (e) => {
        e.preventDefault();
        const res = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: correo,
                password: clave,
                device_name: navigator.userAgent // <--- Identifica el dispositivo actual
            })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.access_token); // Guarda la sesión
            alLoguear(); // Avisa a App.jsx que ya hay usuario
        } else {
            alert(data.message);
        }
    };

    return (
        <form className="glass-card" onSubmit={acceder} style={{ padding: '20px', marginBottom: '20px' }}>
            <h2 style={{color: '#60a5fa'}}>Iniciar Sesión</h2>
            <input type="email" placeholder="Correo" onChange={e => setCorreo(e.target.value)} style={{width: '100%', marginBottom: '10px', padding: '10px', background: '#0f172a', border: 'none', color: 'white'}} />
            <input type="password" placeholder="Contraseña" onChange={e => setClave(e.target.value)} style={{width: '100%', marginBottom: '10px', padding: '10px', background: '#0f172a', border: 'none', color: 'white'}} />
            <button type="submit" style={{width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer'}}>Entrar</button>
        </form>
    );
};

export default Login;