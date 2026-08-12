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
${batches.map(b => `- Lote: ${b.id}, Producto: ${b.productType}, Productor: ${b.creatorName}, Faltan: ${b.daysLeft} días`).join('\n')}

Analiza si el producto es altamente perecible y la urgencia basada en el tiempo restante.
PROHIBIDO responder con "Datos insuficientes" o similares. DEBES asumir y dar una recomendación definitiva para cada item.
Responde ÚNICAMENTE con un JSON válido, sin texto adicional, donde las claves sean los IDs numéricos y los valores sean una frase de acción ultra corta (máximo 3-4 palabras, ej: "Oferta urgente (Perecible)", "Almacén normal", "Donar inmediatamente", "Prioridad alta", "Venta rápida").
  `;

  try {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_CEREBRAS_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3.1-8b",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Respuesta inválida de Cerebras AI");
    }

    let aiContent = data.choices[0].message.content.trim();
    if (aiContent.startsWith('```json')) aiContent = aiContent.replace('```json', '');
    if (aiContent.startsWith('```')) aiContent = aiContent.replace('```', '');
    if (aiContent.endsWith('```')) aiContent = aiContent.slice(0, -3);

    return res.status(200).json(JSON.parse(aiContent.trim()));
  } catch (error) {
    console.error("Error consultando a Cerebras AI:", error);
    return res.status(500).json({ error: 'Failed to process AI request' });
  }
}
