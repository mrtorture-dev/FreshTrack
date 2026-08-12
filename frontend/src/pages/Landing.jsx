import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Sprout, ArrowRight } from 'lucide-react';
import { animate, stagger } from 'animejs';

export default function Landing() {
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const sproutRef = useRef(null);

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

    animate(sproutRef.current, {
      scale: [1, 1.15],
      rotate: [-5, 5],
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      duration: 1500
    });
  }, []);

  return (
    <div className="landing-page" style={{ padding: '2rem 0' }}>
      <header ref={headerRef} style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary-color)', borderRadius: '20px', fontWeight: 'bold', marginBottom: '1rem' }}>
          Realidad Nacional 🇵🇪
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1.2', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          La Revolución en la Agroexportación Peruana
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          En el Perú, miles de toneladas de productos agrícolas de alta calidad (como las paltas de Ica o los mangos de Piura) sufren mermas debido a la falta de trazabilidad transparente. <strong>FreshTrack</strong> utiliza Arbitrum Stylus (Rust/WASM) y Cerebras AI para garantizar que cada alimento llegue fresco del campo a la mesa, empoderando al agricultor local y asegurando la confianza del consumidor global.
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

      <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <div ref={sproutRef} style={{ display: 'inline-block' }}>
            <Sprout size={48} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Agricultor Empoderado</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            El pequeño y mediano productor peruano registra sus lotes directamente en la blockchain de Arbitrum mediante transacciones de muy bajo costo (Stylus), eliminando intermediarios abusivos.
          </p>
        </div>
        
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <ShieldCheck size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Transparencia Inmutable</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            La información no puede ser alterada. El mercado internacional exige trazabilidad estricta y certificaciones. FreshTrack digitaliza esta confianza mediante contratos inteligentes en Rust.
          </p>
        </div>

        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <TrendingUp size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Inteligencia Artificial</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Supermercados optimizan su inventario perecible analizando la vida útil restante en tiempo real utilizando la inferencia ultrarrápida de Llama 3.1 en Cerebras AI para evitar desperdicio alimentario.
          </p>
        </div>
      </div>
    </div>
  );
}
