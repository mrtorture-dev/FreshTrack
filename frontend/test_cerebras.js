import 'dotenv/config';

async function run() {
  const promptText = 'Eres un experto en logística de supermercados. Estamos evaluando un inventario en tiempo real. Hoy es 2026-08-12. Aquí están los productos en el blockchain de Arbitrum:\n- Lote: 1, Producto: Manzanas, Productor: Pedro, Faltan: 12 días\nAnaliza si el producto es altamente perecible y la urgencia basada en el tiempo restante.\nPROHIBIDO responder con "Datos insuficientes" o similares. DEBES asumir y dar una recomendación definitiva para cada item.\nResponde ÚNICAMENTE con un JSON válido, sin texto adicional, donde las claves sean los IDs numéricos y los valores sean una frase de acción ultra corta (máximo 3-4 palabras, ej: "Oferta urgente (Perecible)", "Almacén normal", "Donar inmediatamente", "Prioridad alta", "Venta rápida").';
  
  try {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_CEREBRAS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3.1-8b',
        messages: [{ role: 'user', content: promptText }],
        temperature: 0.2
      })
    });
    console.log(await response.text());
  } catch(e) {
    console.error(e);
  }
}
run();
