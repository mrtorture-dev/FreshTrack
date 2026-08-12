import { ethers } from 'ethers';

// Nuevo contrato Stylus del mentor — desplegado 2026-08-12
// Soporta strings on-chain, eventos BatchRegistered, control de acceso owner
const CONTRACT_ADDRESS = "0xada07a7655c48cfd5859d11dfcf97cba794fa0f9";

const ABI = [
  // Inicialización (solo owner, una sola vez)
  "function init() external",
  // Registro de lotes
  "function registerBatch(string productName, string producer, uint64 expirationDate, uint64 weightGrams) external returns (uint256)",
  // Lecturas
  "function getBatchCount() external view returns (uint256)",
  "function isRegistered(uint256 batchId) external view returns (bool)",
  "function getBatch(uint256 batchId) external view returns (string, string, uint64, uint64)",
  "function getProductName(uint256 batchId) external view returns (string)",
  "function getProducer(uint256 batchId) external view returns (string)",
  "function getExpiration(uint256 batchId) external view returns (uint64)",
  "function getWeight(uint256 batchId) external view returns (uint64)",
  "function isExpired(uint256 batchId) external view returns (bool)",
  "function owner() external view returns (address)",
  // Eventos
  "event BatchRegistered(uint256 indexed batch_id, address indexed registrant, string product_name, string producer, uint64 expiration_date, uint64 weight_grams)",
  "event Initialized(address indexed owner)"
];

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
// Billetera KMS asignada por defecto al usuario para la demo
// Forzamos esta llave que es la que se usó para inicializar (owner)
const PRIVATE_KEY = "0x7f1102cc95d7e318dc29a6fa956e258d309440c070036d2300cbd518e154506c";

export const getReadOnlyContract = () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
};

export const getSignerContract = () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};

export const registerBatchOnChain = async (productType, quantity, expiresIn, origin, creatorName, imageUrl) => {
  const contract = getSignerContract();

  // Parseamos los inputs numéricos (vienen como strings del form). Fallback a 1 si son 0 o inválidos
  const expDays = Number(expiresIn) || 14;
  const weightNum = Number(quantity) || 1;

  // expirationDate: agregamos 1 hora extra (3600s) para evitar que el reloj local atrás del bloque dispare InvalidExpiration
  const expirationDate = BigInt(Math.floor(Date.now() / 1000)) + BigInt(expDays * 86400) + BigInt(3600);
  // quantity en gramos (mínimo 1000 para evitar InvalidWeight)
  const weightGrams = BigInt(Math.floor(weightNum * 1000));

  console.log("Enviando TX a Stylus con datos:", { productType, creatorName, expirationDate, weightGrams });
  
  const tx = await contract.registerBatch(
    productType || "Producto Sin Nombre",
    creatorName || "Productor Desconocido",
    expirationDate,
    weightGrams,
    {
      gasLimit: 3000000 // Saltamos la estimación de gas automática para evitar fallos del RPC
    }
  );
  console.log("Tx hash:", tx.hash);
  const receipt = await tx.wait();

  // Extraer batch_id del evento BatchRegistered
  let batchId = null;
  if (receipt && receipt.logs) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === "BatchRegistered") {
          batchId = parsed.args.batch_id.toString();
          break;
        }
      } catch (e) {
        // log no parseable, continuar
      }
    }
  }

  // Fallback: leer el contador si el evento no se parseó
  if (!batchId) {
    const count = await contract.getBatchCount();
    batchId = count.toString();
  }

  return { batchId, txHash: receipt.hash || tx.hash };
};

export const fetchAllBatches = async () => {
  const contract = getReadOnlyContract();
  const countRaw = await contract.getBatchCount();
  const count = Number(countRaw);

  // Obtener eventos BatchRegistered para tener los txHash
  let txHashes = {};
  try {
    const filter = contract.filters.BatchRegistered();
    const events = await contract.queryFilter(filter, 0, 'latest');
    events.forEach(e => {
      const id = Number(e.args.batch_id);
      txHashes[id] = e.transactionHash;
    });
  } catch (e) {
    console.warn("No se pudieron obtener eventos:", e);
  }

  let batches = [];
  for (let i = 1; i <= count; i++) {
    try {
      const id = BigInt(i);
      const registered = await contract.isRegistered(id);
      if (!registered) continue;

      // getBatch devuelve (productName, producer, expirationDate, weightGrams)
      const [productName, producer, expirationTimestamp, weightGrams] = await contract.getBatch(id);

      const now = Math.floor(Date.now() / 1000);
      const expTs = Number(expirationTimestamp);
      const daysLeft = Math.max(0, Math.round((expTs - now) / 86400));

      batches.push({
        id: i,
        productType: productName,
        type: productName,
        quantity: Math.round(Number(weightGrams) / 1000),
        origin: "Arbitrum Stylus (Rust/WASM)",
        status: daysLeft > 7 ? "Registrado" : daysLeft > 0 ? "En Tránsito" : "Entregado",
        expiresRaw: expTs,
        daysLeft,
        txHash: txHashes[i] || null,
        creatorName: producer,
        imageUrl: ""
      });
    } catch (e) {
      console.warn(`Error leyendo lote ${i}:`, e);
    }
  }
  return batches;
};
