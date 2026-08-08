const hre = require("hardhat");

async function main() {
  const Traceability = await hre.ethers.getContractFactory("FreshTrackTrace");
  const traceability = await Traceability.deploy();

  await traceability.waitForDeployment();

  const address = await traceability.getAddress();
  console.log("FreshTrackTrace deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
