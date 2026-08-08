import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x62fcee2dac606e1b7739d9c864c67472a3a38f27"; // Arbitrum Stylus (Rust) - Deployed 2026-08-08

// ABI del contrato Stylus (Rust/WASM) desplegado en Arbitrum Sepolia
// Funciones adaptadas: strings → hashes uint256 para compatibilidad con WASM
const ABI = [
  "function registerBatch(uint256 productHash, uint256 expirationDate, uint256 weightGrams) external returns (uint256)",
  "function getBatchCount() external view returns (uint256)",
  "function getExpiration(uint256 batchId) external view returns (uint256)",
  "function getProductHash(uint256 batchId) external view returns (uint256)",
  "function getWeight(uint256 batchId) external view returns (uint256)",
  "function isRegistered(uint256 batchId) external view returns (uint256)"
];

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;

export const getContract = () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};

// Convierte un string de hasta 31 caracteres a uint256 (rellenando con ceros) de forma reversible
const stringToBytes32Int = (str) => {
  // Limitar a 31 caracteres para asegurar que no se pase de 32 bytes
  const slicedStr = str.slice(0, 31);
  const bytes = ethers.toUtf8Bytes(slicedStr);
  const paddedBytes = ethers.zeroPadValue(bytes, 32);
  return BigInt(paddedBytes);
};

// Convierte un entero uint256 de vuelta a un string UTF-8
const bytes32IntToString = (valueBigInt) => {
  try {
    let hex = valueBigInt.toString(16);
    // Rellenar hasta 64 caracteres hex (32 bytes)
    hex = "0x" + hex.padStart(64, '0');
    const bytes = ethers.getBytes(hex);
    // Decodificar y quitar bytes nulos
    return ethers.toUtf8String(bytes).replace(/\0/g, '');
  } catch (e) {
    return "Lote Desconocido";
  }
};

export const registerBatchOnChain = async (productType, quantity, expiresIn, origin, creatorName, imageUrl) => {
  const contract = getContract();

  // Guardamos directamente el productType como entero reversible (hasta 31 letras)
  const productHash = stringToBytes32Int(productType);
  // expiresIn son días, lo convertimos a timestamp unix futuro
  const expirationDate = BigInt(Math.floor(Date.now() / 1000)) + BigInt(expiresIn * 86400);
  // quantity en gramos (multiplicamos kg por 1000)
  const weightGrams = BigInt(quantity * 1000);

  const tx = await contract.registerBatch(productHash, expirationDate, weightGrams);
  await tx.wait();

  // El contrato Stylus no emite eventos, leemos el contador directamente
  const count = await contract.getBatchCount();
  return count.toString();
};

export const fetchAllBatches = async () => {
  const contract = getContract();
  const countRaw = await contract.getBatchCount();
  const count = Number(countRaw);

  let batches = [];
  for (let i = 1; i <= count; i++) {
    const id = BigInt(i);
    const isReg = await contract.isRegistered(id);
    if (Number(isReg) === 0) continue;

    const expirationTimestamp = await contract.getExpiration(id);
    const weightGrams = await contract.getWeight(id);
    const productHash = await contract.getProductHash(id);

    const now = Math.floor(Date.now() / 1000);
    const expTs = Number(expirationTimestamp);
    const daysLeft = Math.max(0, Math.round((expTs - now) / 86400));
    
    // Decodificamos el nombre original del producto guardado en la blockchain
    const originalProductName = bytes32IntToString(productHash);

    batches.push({
      id: i,
      productType: originalProductName,
      type: originalProductName,
      quantity: Math.round(Number(weightGrams) / 1000),
      origin: "Arbitrum Stylus (WASM)",
      status: daysLeft > 7 ? "Registrado" : daysLeft > 0 ? "En Tránsito" : "Entregado",
      expiresRaw: expTs,
      daysLeft,
      txHash: null,
      creatorName: "Productor FreshTrack",
      imageUrl: ""
    });
  }
  return batches;
};

