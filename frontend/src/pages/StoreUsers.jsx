import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Trash2, User, Key, Shield } from 'lucide-react';

export default function StoreUsers() {
  const { storeUsers, producerUsers, addUser, removeUser, user } = useAuth();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('store');

  const handleAdd = (e) => {
    e.preventDefault();
    if (name.trim() && username.trim() && password.trim()) {
      addUser(name.trim(), username.trim(), password.trim(), role);
      setName('');
      setUsername('');
      setPassword('');
    }
  };

  const renderUsersList = (title, users) => (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {users.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: u.role === 'store' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '8px', color: u.role === 'store' ? '#3b82f6' : 'var(--primary-color)' }}>
                {u.isMain ? <Shield size={20} /> : <User size={20} />}
              </div>
              <div>
                <strong>{u.name}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Usuario: {u.username}</div>
              </div>
            </div>
            {!u.isMain && (
              <button 
                onClick={() => removeUser(u.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                title="Eliminar cuenta"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Bóveda de Accesos (Administración)</h1>
        <p style={{ color: 'var(--text-muted)' }}>Crea y elimina cuentas de empleados de tienda y productores externos.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        <div className="glass-panel">
          <h2>Base de Datos Local (Cifrada)</h2>
          <div style={{ marginTop: '1.5rem' }}>
            {renderUsersList('Personal del Supermercado', storeUsers)}
            {renderUsersList('Productores Aliados', producerUsers)}
          </div>
        </div>

        <div className="glass-panel" style={{ alignSelf: 'start' }}>
          <h2>Nueva Credencial</h2>
          <form onSubmit={handleAdd} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Rol de Sistema</label>
              <select className="form-input" value={role} onChange={e => setRole(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)' }}>
                <option value="store" style={{ color: 'black' }}>Supermercado (Visualizar y Administrar)</option>
                <option value="producer" style={{ color: 'black' }}>Productor (Registrar Lotes)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nombre Completo</label>
              <input type="text" className="form-input" placeholder="Ej. Juan Pérez" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14}/> Usuario (Login)</label>
              <input type="text" className="form-input" placeholder="ej: juanp" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Key size={14}/> Contraseña</label>
              <input type="text" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <UserPlus size={20} /> Guardar y Encriptar Cuenta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
