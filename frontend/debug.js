import 'dotenv/config';

async function run() {
  const promptText = `
Eres un experto en logística de supermercados. Estamos evaluando un inventario en tiempo real. 
Hoy es 2026-08-12.
Aquí están los productos en el blockchain de Arbitrum:
- Lote: 1, Producto: Tomate Cherry Orgánico, Productor: Productor Juan, Faltan: 10 días

Analiza si el producto es altamente perecible y la urgencia basada en el tiempo restante.
Detecta anomalías (ej. si un producto perecible como Paltas o Tomates tiene demasiados días restantes, o fechas imposibles).
PROHIBIDO responder con "Datos insuficientes" o similares. DEBES asumir y dar una recomendación.
Responde ÚNICAMENTE con un JSON válido, sin texto adicional. Usa este formato exacto:
{
  "1": { "action": "Venta rápida", "anomaly": false, "reason": "" },
  "2": { "action": "Descartar", "anomaly": true, "reason": "300 días es excesivo para tomates" }
}
  `;
  
  try {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_CEREBRAS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemma-4-31b',
        messages: [{ role: 'user', content: promptText }],
        temperature: 0.2
      })
    });
    const text = await response.text();
    console.log("RESPONSE:", text);
    
    // Parse test
    const data = JSON.parse(text);
    let aiContent = data.choices[0].message.content.trim();
    console.log("RAW CONTENT:", aiContent);
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log("REGEX MATCHED:", jsonMatch[0]);
      console.log("PARSED OBJECT:", JSON.parse(jsonMatch[0]));
    } else {
      console.log("NO REGEX MATCH");
    }
  } catch(e) {
    console.error(e);
  }
}
run();
