import { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '' // Laravel exige este campo exacto para confirmar contraseñas
    });
    
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError(null);
        setMensaje(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Importante para que Laravel devuelva errores en JSON
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Si Laravel detecta errores (ej. correo duplicado, password corto)
                throw new Error(data.message || 'Error al registrar el usuario');
            }

            // Si todo sale bien
            setMensaje(data.message); 
            
            // Aquí guardamos el Token de Sanctum en la memoria del navegador
            localStorage.setItem('token', data.access_token);

            // Limpiamos el formulario
            setFormData({ name: '', email: '', password: '', password_confirmation: '' });

        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    
return (
    <div className="glass-card" style={{ padding: '30px', width: '100%', boxSizing: 'border-box', marginBottom: '30px' }}>
        <h2 style={{ textAlign: 'center', color: '#60a5fa', marginTop: 0 }}>Crear Cuenta</h2>
        
        {mensaje && <div style={{ background: '#065f46', color: '#34d399', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{mensaje}</div>}
        {error && <div style={{ background: '#7f1d1d', color: '#f87171', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} required 
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
            
            <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required 
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
                <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required 
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
                
                <input type="password" name="password_confirmation" placeholder="Confirmar" value={formData.password_confirmation} onChange={handleChange} required 
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
            </div>

            <button type="submit" disabled={cargando} 
                style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}>
                {cargando ? 'Procesando...' : 'Unirse al Condominio'}
            </button>
        </form>
    </div>
);

};

export default Register;