export const analyzeInventoryWithAI = async (batches) => {
  if (!batches || batches.length === 0) return {};

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ batches })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error en API interna (Status ${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error consultando la IA:", error);
    return {};
  }
};
