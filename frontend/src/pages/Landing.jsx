import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Users, Truck, ArrowRight } from 'lucide-react';
import { animate, stagger } from 'animejs';

export default function Landing() {
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const icon1Ref = useRef(null);
  const icon2Ref = useRef(null);
  const icon3Ref = useRef(null);
  const truckRef = useRef(null);

  useEffect(() => {
    animate(headerRef.current.children, {
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1200,
      delay: stagger(200),
      easing: 'easeOutExpo'
    });

    animate(cardsRef.current.children, {
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: stagger(150, { start: 600 }),
      easing: 'easeOutQuart'
    });

    animate([icon1Ref.current, icon2Ref.current, icon3Ref.current], {
      scale: [1, 1.15],
      translateY: [-5, 5],
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      duration: 2000,
      delay: stagger(400)
    });

    animate(truckRef.current, {
      translateX: ['-100vw', '100vw'],
      duration: 8000,
      loop: true,
      easing: 'linear'
    });
  }, []);

  return (
    <div className="landing-page" style={{ padding: '2rem 0' }}>
      <div ref={truckRef} style={{ position: 'fixed', top: '15%', left: 0, opacity: 0.15, pointerEvents: 'none', zIndex: 0 }}>
        <Truck size={120} color="var(--primary-color)" />
      </div>

      <header ref={headerRef} style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary-color)', borderRadius: '20px', fontWeight: 'bold', marginBottom: '1rem' }}>
          Realidad Nacional
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1.2', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Revolución SCM para Supermercados
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          En el Perú, los supermercados pierden millones anualmente en mermas de productos perecibles debido a una cadena de suministro (SCM) ineficiente. <strong>FreshTrack</strong> soluciona esto integrando Arbitrum Stylus (Rust/WASM) para trazabilidad inmutable y Cerebras AI para decisiones logísticas ultrarrápidas.
        </p>
        
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/producer" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontSize: '1.1rem' }}>
            Demo: Productor Agrícola <ArrowRight size={18} />
          </Link>
          <Link to="/dashboard" className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontSize: '1.1rem' }}>
            Demo: Supermercado
          </Link>
        </div>
      </header>

      <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem', position: 'relative', zIndex: 1 }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <div ref={icon1Ref} style={{ display: 'inline-block' }}>
            <Users size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Proveedores Conectados</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Los productores locales registran cada lote directamente en la blockchain de Arbitrum mediante transacciones de muy bajo costo, garantizando visibilidad en tiempo real del inventario en tránsito.
          </p>
        </div>
        
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <div ref={icon2Ref} style={{ display: 'inline-block' }}>
            <ShieldCheck size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cero Manipulación</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            La información de fechas de caducidad y pesos no puede ser alterada. FreshTrack digitaliza el control de calidad mediante contratos inteligentes en Rust para asegurar la verdad absoluta.
          </p>
        </div>

        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <div ref={icon3Ref} style={{ display: 'inline-block' }}>
            <TrendingUp size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Reducción de Mermas (IA)</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            El sistema FEFO (First-Expired, First-Out) del supermercado se potencia analizando la vida útil restante con la inferencia ultrarrápida de Gemma 4 31B en Cerebras AI, automatizando alertas de venta rápida.
          </p>
        </div>
      </div>
    </div>
  );
}
