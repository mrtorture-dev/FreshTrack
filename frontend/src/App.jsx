import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, LogOut, Users } from 'lucide-react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Producer from './pages/Producer';
import Trace from './pages/Trace';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import StoreUsers from './pages/StoreUsers';
import Logo from './components/Logo';

function MainLayout() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <Login />;
  }

  return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', marginBottom: '2rem' }}>
            <Logo size={36} />
            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>FreshTrack</span>
          </div>
          
          <nav className="nav-links">
            {user.role === 'store' && (
              <>
                <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                  <LayoutDashboard size={20} />
                  Panel FEFO
                </NavLink>
                <NavLink to="/users" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                  <Users size={20} />
                  Gestión Usuarios
                </NavLink>
              </>
            )}
            
            {user.role === 'producer' && (
              <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                <Truck size={20} />
                Panel Productor
              </NavLink>
            )}

            <button 
              onClick={logout} 
              className="nav-item" 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginTop: 'auto', textAlign: 'left', width: '100%' }}
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            {user.role === 'store' && (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<StoreUsers />} />
              </>
            )}
            {user.role === 'producer' && (
              <Route path="/" element={<Producer />} />
            )}
            <Route path="/trace/:id" element={<Trace />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}
