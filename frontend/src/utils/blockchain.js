import { ethers } from 'ethers';

// ─────────────────────────────────────────────────────────────────────────────
// FreshTrack Trace — ABI del nuevo contrato Stylus (Rust/WASM)
// Contrato con strings on-chain, owner, producer y eventos.
// NOTA: Actualizar CONTRACT_ADDRESS después del despliegue del nuevo contrato.
// ─────────────────────────────────────────────────────────────────────────────

// TODO: Reemplazar con la nueva dirección una vez desplegado el nuevo lib.rs
const CONTRACT_ADDRESS = "0x62fcee2dac606e1b7739d9c864c67472a3a38f27";

// ABI completo del nuevo contrato FreshTrackTrace
const ABI = [
  // Inicialización (solo una vez, fija el owner)
  "function init() external",

  // Registro de lote — strings reales on-chain
  "function register_batch(string product_name, string producer, uint64 expiration_date, uint64 weight_grams) external returns (uint256)",

  // Lectura de lote completo (una sola llamada)
  "function get_batch(uint256 batch_id) external view returns (string, string, uint64, uint64)",

  // Lecturas individuales
  "function get_batch_count() external view returns (uint256)",
  "function get_product_name(uint256 batch_id) external view returns (string)",
  "function get_producer(uint256 batch_id) external view returns (string)",
  "function get_expiration(uint256 batch_id) external view returns (uint64)",
  "function get_weight(uint256 batch_id) external view returns (uint64)",
  "function is_expired(uint256 batch_id) external view returns (bool)",
  "function is_registered(uint256 batch_id) external view returns (bool)",
  "function owner() external view returns (address)",
];

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;

export const getContract = () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};

export const getContractReadOnly = () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
};

/**
 * Inicializa el contrato (solo necesario una vez después del deploy).
 * Llama a init() para fijar al owner. Falla si ya fue inicializado.
 */
export const initContract = async () => {
  const contract = getContract();
  const tx = await contract.init();
  await tx.wait();
  return tx.hash;
};

/**
 * Registra un lote nuevo en la blockchain.
 * @param {string} productName  - Nombre real del producto (ej: "Paltas Hass")
 * @param {string} producerName - Nombre del productor (ej: "Finca El Sol")
 * @param {number} quantity     - Cantidad en KG (se convierte a gramos internamente)
 * @param {number} expiresInDays - Días hasta vencimiento (se convierte a timestamp Unix)
 * @returns {string} batchId asignado
 */
export const registerBatchOnChain = async (productName, producerName, quantity, expiresInDays) => {
  const contract = getContract();

  // Timestamp de expiración = ahora + días en segundos
  const expirationDate = BigInt(Math.floor(Date.now() / 1000)) + BigInt(Number(expiresInDays) * 86400);
  // Convertir kg a gramos
  const weightGrams = BigInt(Math.round(Number(quantity) * 1000));

  const tx = await contract.register_batch(
    productName,
    producerName,
    expirationDate,
    weightGrams
  );
  const receipt = await tx.wait();

  // Leer el nuevo contador para obtener el ID asignado
  const count = await contract.get_batch_count();
  return { batchId: count.toString(), txHash: receipt.hash };
};

/**
 * Obtiene todos los lotes registrados en la blockchain.
 * Usa get_batch() para hacer una sola llamada por lote (más eficiente).
 * @returns {Array} array de objetos batch
 */
export const fetchAllBatches = async () => {
  const contract = getContractReadOnly();
  const countRaw = await contract.get_batch_count();
  const count = Number(countRaw);

  const batches = [];
  for (let i = 1; i <= count; i++) {
    const id = BigInt(i);

    try {
      // get_batch devuelve: (product_name, producer, expiration_date, weight_grams)
      const [productName, producer, expirationDate, weightGrams] = await contract.get_batch(id);

      const now = Math.floor(Date.now() / 1000);
      const expTs = Number(expirationDate);
      const daysLeft = Math.max(0, Math.round((expTs - now) / 86400));

      let status = "Almacenado";
      if (daysLeft <= 0) status = "Caducado";
      else if (daysLeft <= 3) status = "Crítico";
      else if (daysLeft <= 7) status = "En Alerta";

      batches.push({
        id: i,
        productType: productName,
        type: productName,
        producer: producer,
        creatorName: producer,
        quantity: Math.round(Number(weightGrams) / 1000),
        origin: "Arbitrum Stylus (WASM)",
        status,
        expiresRaw: expTs,
        daysLeft,
        txHash: null,
        imageUrl: "",
      });
    } catch (err) {
      // Si el lote no existe o hay error, lo saltamos
      console.warn(`Lote #${i} no disponible:`, err);
    }
  }

  return batches;
};
