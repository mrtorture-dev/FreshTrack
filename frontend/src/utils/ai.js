export const analyzeInventoryWithAI = async (batches, apiKey) => {
  if (!batches || batches.length === 0) return {};

  const promptText = `
Eres un experto en logística de supermercados. Estamos evaluando un inventario en tiempo real. 
Hoy es ${new Date().toLocaleDateString()}.
Aquí están los productos y sus fechas de vencimiento:
${batches.map(b => `- ID: ${b.id}, Producto: ${b.productType}, Vence: ${new Date(Number(b.expirationDate) * 1000).toLocaleDateString()}`).join('\n')}

Analiza si el producto es altamente perecible y la urgencia basada en el tiempo restante.
Responde ÚNICAMENTE con un JSON válido, sin texto adicional, donde las claves sean los IDs numéricos y los valores sean una frase de acción ultra corta (máximo 3-4 palabras, ej: "Oferta urgente (Perecible)", "Almacén normal", "Donar inmediatamente", "Prioridad alta").
  `;

  try {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3.1-70b",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Respuesta inválida de Cerebras AI");
    }

    let aiContent = data.choices[0].message.content.trim();
    
    // Limpiar si el modelo responde con backticks de markdown
    if (aiContent.startsWith('```json')) aiContent = aiContent.replace('```json', '');
    if (aiContent.startsWith('```')) aiContent = aiContent.replace('```', '');
    if (aiContent.endsWith('```')) aiContent = aiContent.slice(0, -3);

    return JSON.parse(aiContent.trim());
  } catch (error) {
    console.error("Error consultando a Cerebras AI:", error);
    return {};
  }
};
