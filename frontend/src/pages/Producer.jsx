import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { registerBatchOnChain, mintNFTAndGetTokenId } from '../utils/blockchain';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Wallet, Key, Award, Copy } from 'lucide-react';
import { animate, stagger } from 'animejs';

const INITIAL_TEMPLATES = [
  { id: 1, name: 'Paltas Hass Premium', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&q=80', defaultOrigin: 'Ica, Perú', defaultExpires: 14 },
  { id: 2, name: 'Tomate Cherry Orgánico', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80', defaultOrigin: 'Huaral, Perú', defaultExpires: 10 },
  { id: 3, name: 'Lechuga Seda', image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=300&q=80', defaultOrigin: 'Trujillo, Perú', defaultExpires: 7 },
  { id: 4, name: 'Mango Kent Exportación', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=300&q=80', defaultOrigin: 'Piura, Perú', defaultExpires: 12 },
  { id: 5, name: 'Arándanos Azules', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=300&q=80', defaultOrigin: 'La Libertad, Perú', defaultExpires: 21 },
  { id: 6, name: 'Espárragos Verdes', image: 'https://images.unsplash.com/photo-1515002246320-8af3aa169730?auto=format&fit=crop&w=300&q=80', defaultOrigin: 'Ica, Perú', defaultExpires: 18 }
];

export default function Producer() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('freshtrack_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', image: '', defaultOrigin: '', defaultExpires: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    productType: 'Paltas Hass Premium',
    quantity: '',
    expiresIn: 14,
    imageUrl: INITIAL_TEMPLATES[0].image
  });
  
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [generatedBatchId, setGeneratedBatchId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [totalKg, setTotalKg] = useState(() => {
    const saved = localStorage.getItem(`freshtrack_kg_${user.username}`);
    return saved ? parseInt(saved) : 0;
  });

  const [generatedTxHash, setGeneratedTxHash] = useState(null);

  useEffect(() => {
    animate('.glass-panel', {
      scale: [0.95, 1],
      opacity: [0, 1],
      duration: 800,
      delay: stagger(150),
      easing: 'easeOutElastic(1, .8)'
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    
    try {
      const result = await registerBatchOnChain(
        formData.productType,
        formData.quantity,
        formData.expiresIn,
        "", // origin
        user.name,
        formData.imageUrl
      );
      
      if (result?.batchId) {
        setGeneratedBatchId(result.batchId);
        setGeneratedTxHash(result.txHash);
        
        // Update total kilos for achievements
        const addedKg = parseInt(formData.quantity) || 0;
        const newTotal = totalKg + addedKg;
        setTotalKg(newTotal);
        localStorage.setItem(`freshtrack_kg_${user.username}`, newTotal);
      } else {
        alert("Hubo un problema registrando el lote.");
      }
    } catch (error) {
      console.error("Error completo:", error);
      alert("Error al firmar en Arbitrum: " + (error?.reason || error?.message || JSON.stringify(error)));
    } finally {
      setIsRegistering(false);
    }
  };

  const addNFTToMetaMask = async (milestoneId) => {
    if (!window.ethereum) {
      alert("Por favor instala la extensión de MetaMask primero.");
      return;
    }
    try {
      // Determinar URI del NFT basado en milestoneId
      const uris = {
        1: "https://freshtrack-ecru.vercel.app/metadata/1.json",
        2: "https://freshtrack-ecru.vercel.app/metadata/2.json",
        3: "https://freshtrack-ecru.vercel.app/metadata/3.json"
      };
      
      alert("Acuñando (Minting) NFT en Arbitrum Sepolia... Por favor espera unos segundos.");
      const tokenId = await mintNFTAndGetTokenId(user.address, milestoneId, uris[milestoneId]);
      
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: '0x314AC13cb01eEb55205D967dF540Ba59769D0D52', // FreshTrackNFT
            tokenId: tokenId,
          },
        },
      });
    } catch (error) {
      console.error(error);
      alert("Error exportando a MetaMask: " + error.message);
    }
  };

  const handleSelectTemplate = (t) => {
    setSelectedTemplate(t.id);
    setFormData({
      productType: t.name,
      quantity: '',
      expiresIn: t.defaultExpires,
      imageUrl: t.image
    });
  };

  const handleAddTemplate = (e) => {
    e.preventDefault();
    const newT = {
      id: Date.now(),
      ...newTemplate,
      defaultExpires: Number(newTemplate.defaultExpires) || 14
    };
    const updated = [...templates, newT];
    setTemplates(updated);
    localStorage.setItem('freshtrack_templates', JSON.stringify(updated));
    setNewTemplate({ name: '', image: '', defaultOrigin: '', defaultExpires: '' });
    setIsAddingTemplate(false);
  };

  const handleDeleteTemplate = (id, e) => {
    e.stopPropagation();
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('freshtrack_templates', JSON.stringify(updated));
    if (selectedTemplate === id) setSelectedTemplate(null);
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--text-main)' }}>Panel de Productor</h1>
          <p style={{ color: 'var(--text-muted)' }}>Registra nuevos lotes de productos en la blockchain para trazabilidad inmutable.</p>
        </div>
      </header>

      {/* WALLET & KMS SECTION */}
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            <Wallet size={20} color="var(--primary-color)"/> Tu Wallet Web3
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Billetera asignada automáticamente (KMS):</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', fontFamily: 'monospace', color: '#a855f7', marginBottom: '1rem' }}>
            {user.address || '0x...'} 
            <Copy size={14} style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(user.address)} />
          </div>
          <button 
            onClick={() => setShowPrivateKey(!showPrivateKey)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <Key size={14} /> Exportar a MetaMask
          </button>
          
          {showPrivateKey && (
            <div style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ color: 'var(--danger-color)', fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>⚠️ NUNCA COMPARTAS TU CLAVE PRIVADA:</p>
              <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                {user.privateKey}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', margin: 0 }}>
              <Award size={20} color="#f59e0b"/> Tus Logros (NFTs)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>Total: {totalKg} kg</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div style={{ textAlign: 'center', minWidth: '90px', opacity: totalKg > 0 ? 1 : 0.3 }}>
              <img src="/badges/pionero.jpg" alt="Pionero" style={{ width: '60px', height: '60px', borderRadius: '50%', border: totalKg > 0 ? '2px solid var(--primary-color)' : '2px solid #555', objectFit: 'cover', filter: totalKg > 0 ? 'none' : 'grayscale(100%)' }} />
              <p style={{ fontSize: '0.7rem', margin: '0.5rem 0', color: totalKg > 0 ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: 'bold' }}>Pionero<br/>(1er Envío)</p>
              {totalKg > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center', marginTop: '0.3rem' }}>
                  <button onClick={() => addNFTToMetaMask(1)} style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem', background: '#f6851b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>🦊 MetaMask</button>
                  <a href={`https://sepolia.arbiscan.io/token/0x314AC13cb01eEb55205D967dF540Ba59769D0D52?a=${user.address}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', fontSize: '0.6rem', padding: '0.2rem 0.4rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}>🔍 Verificar</a>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center', minWidth: '90px', opacity: totalKg >= 500 ? 1 : 0.3 }}>
              <img src="/badges/bronce.jpg" alt="Bronce" style={{ width: '60px', height: '60px', borderRadius: '50%', border: totalKg >= 500 ? '2px solid #cd7f32' : '2px solid #555', objectFit: 'cover', filter: totalKg >= 500 ? 'none' : 'grayscale(100%)' }} />
              <p style={{ fontSize: '0.7rem', margin: '0.5rem 0', color: totalKg >= 500 ? '#cd7f32' : 'var(--text-muted)', fontWeight: 'bold' }}>Bronce<br/>(500kg)</p>
              {totalKg >= 500 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center', marginTop: '0.3rem' }}>
                  <button onClick={() => addNFTToMetaMask(2)} style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem', background: '#f6851b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>🦊 MetaMask</button>
                  <a href={`https://sepolia.arbiscan.io/token/0x314AC13cb01eEb55205D967dF540Ba59769D0D52?a=${user.address}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', fontSize: '0.6rem', padding: '0.2rem 0.4rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}>🔍 Verificar</a>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center', minWidth: '90px', opacity: totalKg >= 5000 ? 1 : 0.3 }}>
              <img src="/badges/maestro.jpg" alt="Maestro" style={{ width: '60px', height: '60px', borderRadius: '50%', border: totalKg >= 5000 ? '2px solid #e2e8f0' : '2px solid #555', objectFit: 'cover', filter: totalKg >= 5000 ? 'none' : 'grayscale(100%)' }} />
              <p style={{ fontSize: '0.7rem', margin: '0.5rem 0', color: totalKg >= 5000 ? '#e2e8f0' : 'var(--text-muted)', fontWeight: 'bold' }}>Maestro<br/>(5 Ton)</p>
              {totalKg >= 5000 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center', marginTop: '0.3rem' }}>
                  <button onClick={() => addNFTToMetaMask(3)} style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem', background: '#f6851b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>🦊 MetaMask</button>
                  <a href={`https://sepolia.arbiscan.io/token/0x314AC13cb01eEb55205D967dF540Ba59769D0D52?a=${user.address}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', fontSize: '0.6rem', padding: '0.2rem 0.4rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}>🔍 Verificar</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>1. Selecciona o Crea un Producto</h2>
          <button onClick={() => setIsAddingTemplate(!isAddingTemplate)} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Nuevo Producto
          </button>
        </div>

        {isAddingTemplate && (
          <form onSubmit={handleAddTemplate} style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'end', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nombre</label>
              <input type="text" className="form-input" required value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Imagen URL</label>
              <input type="url" className="form-input" required value={newTemplate.image} onChange={e => setNewTemplate({...newTemplate, image: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Días Vida</label>
              <input type="number" className="form-input" required value={newTemplate.defaultExpires} onChange={e => setNewTemplate({...newTemplate, defaultExpires: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <button type="submit" className="btn-primary">Guardar</button>
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
              <img src={t.image || 'https://images.unsplash.com/photo-1596199050105-6d5d956d90d4?auto=format&fit=crop&w=300&q=80'} alt={t.name} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '0.8rem', position: 'relative' }}>
                <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>{t.name}</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.defaultExpires} días de vida</p>
                {t.id > 10 && (
                  <button onClick={(e) => handleDeleteTemplate(t.id, e)} style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1rem', padding: 0 }} title="Eliminar plantilla">✖</button>
                )}
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
              <label>Vida útil estimada (Días desde hoy)</label>
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
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Strings guardados on-chain en Arbitrum Sepolia. Imprime el QR y pégalo en el empaque.
              </p>
              
              {generatedTxHash && (
                <a
                  href={`https://sepolia.arbiscan.io/tx/${generatedTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--primary-color)', fontSize: '0.8rem', display: 'block', marginBottom: '1.5rem', textDecoration: 'underline' }}
                >
                  Ver Tx en Arbiscan ↗
                </a>
              )}

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
