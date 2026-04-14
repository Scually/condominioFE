import { useState } from 'react';

const Perfil = () => {
    const [pass, setPass] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setPass({ ...pass, [e.target.name]: e.target.value });
    };

    const actualizarPassword = async (e) => {
        e.preventDefault();
        setMensaje(null);
        setError(null);

        const res = await fetch('http://127.0.0.1:8000/api/change-password', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify(pass)
        });
        
        const data = await res.json();

        if (res.ok) {
            setMensaje("✅ Contraseña cambiada. Cerrando todas las sesiones...");
            // Esperamos 2 segundos para que el usuario lea el mensaje y luego cerramos sesión
            setTimeout(() => {
                localStorage.removeItem('token'); 
                window.location.reload(); 
            }, 2000);
        } else {
            setError(data.message || "Error al cambiar contraseña");
        }
    };

    return (
        <div className="glass-card" style={{ padding: '20px', marginTop: '20px' }}>
            <h3 style={{ color: '#60a5fa', marginTop: 0 }}>Seguridad de la Cuenta</h3>
            <p style={{ fontSize: '13px', color: '#ccc' }}>Al cambiar tu contraseña, se cerrarán todas las sesiones activas en otros dispositivos.</p>
            
            {mensaje && <div style={{ background: '#065f46', color: '#34d399', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{mensaje}</div>}
            {error && <div style={{ background: '#7f1d1d', color: '#f87171', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}

            <form onSubmit={actualizarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="password" name="current_password" placeholder="Contraseña Actual" onChange={handleChange} 
                    style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white' }} required />
                
                <input type="password" name="new_password" placeholder="Nueva Contraseña" onChange={handleChange} 
                    style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white' }} required />
                
                <input type="password" name="new_password_confirmation" placeholder="Confirmar Nueva Contraseña" onChange={handleChange} 
                    style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white' }} required />

                <button type="submit" style={{ padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Actualizar y Cerrar Sesiones
                </button>
            </form>
        </div>
    );
};

export default Perfil;