import React, { useState } from 'react';
import { User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const success = login(username.trim(), password);
    if (!success) {
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', filter: 'drop-shadow(0 10px 15px rgba(16,185,129,0.2))' }}>
          <Logo size={96} />
        </div>
        <h1 style={{ fontSize: '3rem', margin: '0', color: 'var(--text-main)', letterSpacing: '-0.02em', fontWeight: '800' }}>FreshTrack</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>Trazabilidad Blockchain Inteligente</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Iniciar Sesión</h2>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> Usuario</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ej. admin" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={16} /> Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
            Ingresar a la Bóveda
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <p><strong>Cuentas Demo:</strong></p>
          <p>Supermercado: <code>admin</code> / <code>123</code></p>
          <p>Productor: <code>productor1</code> / <code>123</code></p>
        </div>
      </div>
    </div>
  );
}
