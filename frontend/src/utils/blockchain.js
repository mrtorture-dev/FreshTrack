import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x62fcee2dac606e1b7739d9c864c67472a3a38f27"; // Arbitrum Stylus (Rust) - Deployed 2026-08-08

// ABI del contrato Stylus (Rust/WASM) desplegado en Arbitrum Sepolia
// Funciones adaptadas: strings → hashes uint256 para compatibilidad con WASM
const ABI = [
  "function register_batch(uint256 product_hash, uint256 expiration_date, uint256 weight_grams) external returns (uint256)",
  "function get_batch_count() external view returns (uint256)",
  "function get_expiration(uint256 batch_id) external view returns (uint256)",
  "function get_product_hash(uint256 batch_id) external view returns (uint256)",
  "function get_weight(uint256 batch_id) external view returns (uint256)",
  "function is_registered(uint256 batch_id) external view returns (uint256)"
];

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;

export const getContract = () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};

// Convierte un string a un número uint256 usando keccak256
const stringToHash = (str) => {
  const bytes = ethers.toUtf8Bytes(str);
  const hash = ethers.keccak256(bytes);
  return BigInt(hash);
};

export const registerBatchOnChain = async (productType, quantity, expiresIn, origin, creatorName, imageUrl) => {
  const contract = getContract();

  // Convertir datos al formato del contrato Stylus (uint256)
  const productHash = stringToHash(`${productType}|${origin}|${creatorName}`);
  // expiresIn son días, lo convertimos a timestamp unix futuro
  const expirationDate = BigInt(Math.floor(Date.now() / 1000)) + BigInt(expiresIn * 86400);
  // quantity en gramos (multiplicamos kg por 1000)
  const weightGrams = BigInt(quantity * 1000);

  const tx = await contract.register_batch(productHash, expirationDate, weightGrams);
  const receipt = await tx.wait();

  // Extraer el ID del batch desde los logs de retorno
  if (receipt && receipt.logs && receipt.logs.length > 0) {
    // El ID retornado es el batch_count en el momento del registro
    try {
      const count = await contract.get_batch_count();
      return count.toString();
    } catch (e) {
      return "1";
    }
  }
  return null;
};

export const fetchAllBatches = async () => {
  const contract = getContract();
  const countRaw = await contract.get_batch_count();
  const count = Number(countRaw);

  // Metadatos locales por productHash para reconstruir los datos de UI
  // (los strings se guardan en el frontend, el hash en la blockchain)
  let batches = [];
  for (let i = 1; i <= count; i++) {
    const id = BigInt(i);
    const isReg = await contract.is_registered(id);
    if (Number(isReg) === 0) continue;

    const expirationTimestamp = await contract.get_expiration(id);
    const weightGrams = await contract.get_weight(id);
    const productHash = await contract.get_product_hash(id);

    const now = Math.floor(Date.now() / 1000);
    const expTs = Number(expirationTimestamp);
    const daysLeft = Math.max(0, Math.round((expTs - now) / 86400));

    batches.push({
      id: i,
      productType: `Lote #${i} (Hash: 0x${productHash.toString(16).slice(0, 8)}...)`,
      type: `Lote #${i}`,
      quantity: Math.round(Number(weightGrams) / 1000),
      origin: "Registrado en Stylus",
      status: daysLeft > 7 ? "Registrado" : daysLeft > 0 ? "En Tránsito" : "Entregado",
      expiresRaw: expTs,
      daysLeft,
      txHash: null,
      creatorName: "FreshTrack Stylus",
      imageUrl: ""
    });
  }
  return batches;
};
