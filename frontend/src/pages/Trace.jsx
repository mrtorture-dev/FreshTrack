import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Package, MapPin, Calendar, Clock, CheckCircle, Truck, ExternalLink } from 'lucide-react';
import { fetchAllBatches } from '../utils/blockchain';

export default function Trace() {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBatch = async () => {
      try {
        const onChainBatches = await fetchAllBatches();
        const found = onChainBatches.find(b => b.id.toString() === id);
        
        if (found) {
          const now = Math.floor(Date.now() / 1000);
          const daysLeft = Math.ceil((found.expiresRaw - now) / 86400);
          setBatch({ ...found, daysLeft });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadBatch();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Consultando Blockchain de Arbitrum...</h2>
      </div>
    );
  }

  if (!batch) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Lote #{id} no encontrado en la Blockchain</h2>
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Trazabilidad del Lote #{id.padStart(4, '0')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>Historial inmutable registrado en Arbitrum Sepolia.</p>
      </header>

      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', overflow: 'hidden', padding: 0 }}>
        {batch.imageUrl && (
          <div style={{ width: '100%', height: '250px' }}>
            <img src={batch.imageUrl} alt={batch.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon"><Package size={24} /></div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Producto Registrado por <strong>{batch.creatorName || 'Productor'}</strong></p>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{batch.type} ({batch.quantity} kg)</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon"><MapPin size={24} /></div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Origen</p>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{batch.origin}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon"><Truck size={24} /></div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Estado Actual</p>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary-color)' }}>{batch.status}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon"><Clock size={24} /></div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Vida Útil Estimada</p>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{batch.daysLeft} días restantes</h3>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
              <CheckCircle size={20} />
              <strong style={{ fontSize: '0.9rem' }}>Verificado criptográficamente en Arbitrum</strong>
            </div>
            
            <a href={batch.txHash ? `https://sepolia.arbiscan.io/tx/${batch.txHash}` : `https://sepolia.arbiscan.io/address/0xb278d88fAE2c640634d3bcb30edB08bA0afdAc04`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
              <ExternalLink size={14} /> Ver Transacción de Origen en Arbiscan
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
