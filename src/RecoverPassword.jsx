import { useState } from 'react';

const RecoverPassword = ({ alCerrar }) => {
    const [email, setEmail] = useState('');
    const [paso, setPaso] = useState(1); // 1: Pedir Email, 2: Resetear
    const [cargando, setCargando] = useState(false);
    const [form, setForm] = useState({ code: '', password: '', password_confirmation: '' });

    const handleSendCode = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/password/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) setPaso(2);
            else alert("El correo no está registrado.");
        } catch (err) {
            alert("Error de conexión");
        } finally {
            setCargando(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, ...form })
            });
            if (res.ok) {
                alert("✅ Contraseña actualizada con éxito.");
                alCerrar(); // Regresa al login
            } else {
                alert("Código incorrecto o expirado.");
            }
        } catch (err) {
            alert("Error al procesar");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="glass-card" style={{ padding: '30px', marginTop: '20px' }}>
            <h2 style={{ color: '#60a5fa', textAlign: 'center', marginTop: 0 }}>
                {paso === 1 ? 'Recuperar Acceso' : 'Restablecer Contraseña'}
            </h2>
            
            {paso === 1 ? (
                <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p style={{ fontSize: '14px', color: '#ccc' }}>Ingresa tu correo para recibir un código de 6 dígitos.</p>
                    <input type="email" placeholder="Correo electrónico" required 
                        onChange={e => setEmail(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white' }} />
                    <button type="submit" disabled={cargando}
                        style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {cargando ? 'Enviando...' : 'Enviar Código'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p style={{ fontSize: '14px', color: '#ccc' }}>Ingresa el código enviado a <b>{email}</b></p>
                    <input type="text" placeholder="Código de 6 dígitos" required maxLength="6"
                        onChange={e => setForm({...form, code: e.target.value})}
                        style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white', textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }} />
                    
                    <input type="password" placeholder="Nueva Contraseña" required 
                        onChange={e => setForm({...form, password: e.target.value})}
                        style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white' }} />
                    
                    <input type="password" placeholder="Confirmar Contraseña" required 
                        onChange={e => setForm({...form, password_confirmation: e.target.value})}
                        style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white' }} />

                    <button type="submit" disabled={cargando}
                        style={{ padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {cargando ? 'Verificando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            )}
            
            <button onClick={alCerrar} style={{ width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px' }}>
                Volver al inicio de sesión
            </button>
        </div>
    );
};

export default RecoverPassword;