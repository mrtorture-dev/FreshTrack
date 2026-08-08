import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x62fcee2dac606e1b7739d9c864c67472a3a38f27"; // Arbitrum Stylus (Rust) - Deployed 2026-08-08

const ABI = [
  "function registerBatch(string memory _productType, uint256 _quantity, uint256 _expirationDays, string memory _originLocation, string memory _creatorName, string memory _imageUrl) public returns (uint256)",
  "function getBatch(uint256 _id) public view returns (tuple(uint256 id, string productType, uint256 quantity, uint256 harvestDate, uint256 expirationDate, uint8 status, address currentOwner, string originLocation, string creatorName, string imageUrl))",
  "function batchCount() public view returns (uint256)",
  "function updateBatchStatus(uint256 _id, uint8 _newStatus) public",
  "event BatchRegistered(uint256 indexed id, string productType, uint256 expirationDate, string creatorName, string imageUrl)"
];

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;

export const getContract = () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};

export const registerBatchOnChain = async (productType, quantity, expiresIn, origin, creatorName, imageUrl) => {
  const contract = getContract();
  // Call the function
  const tx = await contract.registerBatch(productType, quantity, expiresIn, origin, creatorName, imageUrl);
  const receipt = await tx.wait();
  
  // Find the BatchRegistered event to get the ID
  const event = receipt.logs.find(
    (log) => {
      try {
        const parsedLog = contract.interface.parseLog(log);
        return parsedLog && parsedLog.name === "BatchRegistered";
      } catch (e) {
        return false;
      }
    }
  );
  
  if (event) {
    const parsedLog = contract.interface.parseLog(event);
    return parsedLog.args.id.toString();
  }
  
  return null;
};

export const fetchAllBatches = async () => {
  const contract = getContract();
  const countRaw = await contract.batchCount();
  const count = Number(countRaw);
  
  // Fetch events to get the creation TX Hash for each batch
  const filter = contract.filters.BatchRegistered();
  const events = await contract.queryFilter(filter, 0, 'latest');
  const txHashes = {};
  events.forEach(e => {
    // args.id is the first indexed parameter
    const id = Number(e.args.id);
    txHashes[id] = e.transactionHash;
  });
  
  let batches = [];
  for (let i = 1; i <= count; i++) {
    const batchData = await contract.getBatch(i);
    batches.push({
      id: Number(batchData.id),
      type: batchData.productType,
      quantity: Number(batchData.quantity),
      origin: batchData.originLocation,
      status: ["Registrado", "En Tránsito", "Entregado"][batchData.status],
      // calculate days left: (expiration timestamp - current timestamp) / 86400
      expiresRaw: Number(batchData.expirationDate),
      txHash: txHashes[i] || null,
      creatorName: batchData.creatorName,
      imageUrl: batchData.imageUrl
    });
  }
  return batches;
};
