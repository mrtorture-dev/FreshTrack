import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { registerBatchOnChain } from '../utils/blockchain';
import { useAuth } from '../context/AuthContext';
import { PlusCircle } from 'lucide-react';

const INITIAL_TEMPLATES = [
  { id: 1, name: 'Paltas Hass Premium', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&q=80', defaultOrigin: 'Ica, Perú', defaultExpires: 14 },
  { id: 2, name: 'Tomate Cherry Orgánico', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80', defaultOrigin: 'Huaral, Perú', defaultExpires: 10 },
  { id: 3, name: 'Lechuga Seda', image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=300&q=80', defaultOrigin: 'Trujillo, Perú', defaultExpires: 7 }
];

export default function Producer() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', image: '', defaultOrigin: '', defaultExpires: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    productType: '',
    quantity: '',
    origin: '',
    expiresIn: '',
    imageUrl: ''
  });
  
  const [generatedBatchId, setGeneratedBatchId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    
    try {
      const batchId = await registerBatchOnChain(
        formData.productType, 
        formData.quantity, 
        formData.expiresIn, 
        formData.origin,
        user.name,
        formData.imageUrl
      );
      
      if (batchId) {
        setGeneratedBatchId(batchId);
      } else {
        alert("Hubo un problema registrando el lote.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al firmar en Arbitrum.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSelectTemplate = (t) => {
    setSelectedTemplate(t.id);
    setFormData({
      productType: t.name,
      quantity: '',
      origin: t.defaultOrigin,
      expiresIn: t.defaultExpires,
      imageUrl: t.image
    });
  };

  const handleAddTemplate = (e) => {
    e.preventDefault();
    const t = { ...newTemplate, id: Date.now() };
    setTemplates([...templates, t]);
    setIsAddingTemplate(false);
    setNewTemplate({ name: '', image: '', defaultOrigin: '', defaultExpires: '' });
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Panel de Productor</h1>
        <p style={{ color: 'var(--text-muted)' }}>Bienvenido, {user.name}. Registra un nuevo lote para subirlo a la red de Arbitrum.</p>
      </header>

      <div className="glass-panel" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>1. Selecciona o Crea un Producto</h2>
          <button onClick={() => setIsAddingTemplate(!isAddingTemplate)} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Nuevo Producto
          </button>
        </div>

        {isAddingTemplate && (
          <form onSubmit={handleAddTemplate} style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nuevo Producto (Nombre)</label>
              <input type="text" className="form-input" required value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>URL de la Imagen (JPG/PNG)</label>
              <input type="url" className="form-input" required value={newTemplate.image} onChange={e => setNewTemplate({...newTemplate, image: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <button type="submit" className="btn-primary">Guardar Plantilla</button>
            </div>
          </form>
        )}

        {!isAddingTemplate && (
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="🔍 Buscar plantilla por nombre del producto..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ padding: '0.8rem', fontSize: '1rem' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', flexWrap: 'nowrap' }}>
          {filteredTemplates.map(t => (
            <div 
              key={t.id} 
              onClick={() => handleSelectTemplate(t)}
              style={{ 
                minWidth: '220px', 
                flexShrink: 0,
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: selectedTemplate === t.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                cursor: 'pointer',
                background: 'var(--panel-bg)',
                transition: 'transform 0.2s, border 0.2s'
              }}
            >
              <img src={t.image} alt={t.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
              <div style={{ padding: '0.75rem' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>{t.name}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ opacity: selectedTemplate ? 1 : 0.5, pointerEvents: selectedTemplate ? 'auto' : 'none' }}>
          <h2>2. Completar Datos del Lote</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>Tipo de Producto</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej. Paltas Hass" 
                value={formData.productType}
                onChange={e => setFormData({...formData, productType: e.target.value})}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Cantidad (kg)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ej. 500" 
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                required 
              />
            </div>

            <div className="form-group">
              <label>Lugar de Origen</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej. Ica, Perú" 
                value={formData.origin}
                onChange={e => setFormData({...formData, origin: e.target.value})}
                required 
              />
            </div>

            <div className="form-group">
              <label>Días Estimados para Vencimiento</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ej. 14" 
                value={formData.expiresIn}
                onChange={e => setFormData({...formData, expiresIn: e.target.value})}
                required 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isRegistering}>
              {isRegistering ? 'Firmando en Arbitrum...' : 'Registrar y Generar QR'}
            </button>
          </form>
        </div>

        <div>
          {generatedBatchId ? (
            <div className="glass-panel" style={{ textAlign: 'center' }}>
              <h2>¡Lote Registrado con Éxito!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Tx Guardada en Arbitrum Sepolia. Imprime este código QR y pégalo en el empaque.
              </p>
              
              <div className="qr-container">
                <QRCodeSVG 
                  value={`https://freshtrack-ecru.vercel.app/trace/${generatedBatchId}`} 
                  size={200}
                  level="H"
                />
                <p>LOTE #{generatedBatchId.toString().padStart(4, '0')}</p>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
              <p>El Código QR aparecerá aquí una vez que registres el lote.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
