import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAllBatches } from '../utils/blockchain';

export default function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const onChainBatches = await fetchAllBatches();
        
        const now = Math.floor(Date.now() / 1000);
        
        // Calculate days remaining and condition
        const processedBatches = onChainBatches.map(b => {
          const daysLeft = Math.ceil((b.expiresRaw - now) / 86400);
          
          let condition = 'success';
          if (daysLeft <= 3) condition = 'danger';
          else if (daysLeft <= 7) condition = 'warning';
          
          return {
            ...b,
            expires: daysLeft,
            condition
          };
        });

        const sorted = processedBatches.sort((a, b) => a.expires - b.expires);
        setBatches(sorted);
      } catch (error) {
        console.error("Failed to fetch from Arbitrum:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Panel del Supermercado</h1>
        <p style={{ color: 'var(--text-muted)' }}>Control de inventario en tiempo real con sistema FEFO (First-Expired, First-Out).</p>
      </header>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-color)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>Lotes Críticos (Por Caducar)</h3>
            <p className="value">{batches.filter(b => b.condition === 'danger').length}</p>
          </div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning-color)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>En Alerta Media</h3>
            <p className="value">{batches.filter(b => b.condition === 'warning').length}</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>Lotes Totales (Blockchain)</h3>
            <p className="value">{batches.length}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem' }}>
        <h2>Inventario Inteligente (Ordenado por FEFO)</h2>
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <table className="fefo-table">
            <thead>
              <tr>
                <th>ID Lote</th>
                <th>Producto</th>
                <th>Productor</th>
                <th>Origen</th>
              <th>Cantidad (kg)</th>
              <th>Estado</th>
              <th>Acción Recomendada</th>
              <th>Verificación Web3</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>Sincronizando con Arbitrum Sepolia...</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>No hay lotes registrados aún.</td></tr>
            ) : (
              batches.map(batch => (
                <tr key={batch.id}>
                  <td><strong>#{batch.id.toString().padStart(4, '0')}</strong></td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {batch.imageUrl ? (
                      <img src={batch.imageUrl} alt={batch.type} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} color="var(--text-muted)" />
                      </div>
                    )}
                    {batch.type}
                  </td>
                  <td>{batch.creatorName || 'Productor Demo'}</td>
                  <td>{batch.origin}</td>
                  <td>{batch.quantity} kg</td>
                  <td>
                    <span className={`badge ${batch.condition}`}>
                      {batch.expires} días restantes
                    </span>
                  </td>
                  <td>
                    {batch.condition === 'danger' && <span style={{color: 'var(--danger-color)', fontWeight: 600}}>¡Priorizar Venta!</span>}
                    {batch.condition === 'warning' && <span style={{color: 'var(--warning-color)', fontWeight: 600}}>Mover a góndola</span>}
                    {batch.condition === 'success' && <span style={{color: 'var(--primary-color)', fontWeight: 600}}>Almacenar</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Link to={`/trace/${batch.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        <ShieldCheck size={14} color="var(--primary-color)"/> Trazabilidad
                      </Link>
                      <a href={batch.txHash ? `https://sepolia.arbiscan.io/tx/${batch.txHash}` : `https://sepolia.arbiscan.io/address/0xb278d88fAE2c640634d3bcb30edB08bA0afdAc04`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        <ExternalLink size={14} /> Arbiscan (Tx)
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
