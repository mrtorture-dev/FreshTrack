export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { batches } = req.body;
  if (!batches || batches.length === 0) {
    return res.status(400).json({ error: 'No batches provided' });
  }

  const promptText = `
Eres un experto en logística de supermercados. Estamos evaluando un inventario en tiempo real. 
Hoy es ${new Date().toLocaleDateString()}.
Aquí están los productos en el blockchain de Arbitrum:
${batches.map(b => `- Lote: ${b.id}, Producto: ${b.type}, Productor: ${b.creatorName}, Faltan: ${b.daysLeft} días`).join('\n')}

Analiza si el producto es altamente perecible y la urgencia basada en el tiempo restante.
Detecta anomalías (ej. si un producto perecible como Paltas o Tomates tiene demasiados días restantes, o fechas imposibles).
PROHIBIDO responder con "Datos insuficientes" o similares. DEBES asumir y dar una recomendación.
Responde ÚNICAMENTE con un JSON válido, sin texto adicional. Usa este formato exacto:
{
  "1": { "action": "Venta rápida", "anomaly": false, "reason": "" },
  "2": { "action": "Descartar", "anomaly": true, "reason": "300 días es excesivo para tomates" }
}
\`;

  try {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_CEREBRAS_API_KEY || process.env.CEREBRAS_API_KEY}`
      },
      body: JSON.stringify({
        model: "gemma-4-31b",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.2
      })
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Cerebras Status ${response.status}: ${text}`);
    }

    const data = JSON.parse(text);
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Respuesta inválida de Cerebras AI: " + text);
    }

    let aiContent = data.choices[0].message.content.trim();
    
    // Extraer solo el bloque JSON por si la IA añade texto antes o después
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiContent = jsonMatch[0];
    }

    return res.status(200).json(JSON.parse(aiContent));
  } catch (error) {
    console.error("Error consultando a Cerebras AI:", error);
    return res.status(500).json({ error: 'Failed to process AI request', details: error.message });
  }
}
