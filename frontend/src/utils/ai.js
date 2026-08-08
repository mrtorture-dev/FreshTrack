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
      throw new Error(`Error en API interna: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error consultando la IA:", error);
    return {};
  }
};
