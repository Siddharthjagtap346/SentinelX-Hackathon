const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying RiskVault with account:", deployer.address);

  const RiskVault = await hre.ethers.getContractFactory("RiskVault");

  // Example initial parameters — adjust as needed
  const initialCollateral = hre.ethers.parseEther("10"); // 10 ETH
  const initialDebt = hre.ethers.parseUnits("10000", 18); // $10,000
  const riskTier = 1; // 0=LOW, 1=MEDIUM, 2=HIGH

  const vault = await RiskVault.deploy(initialCollateral, initialDebt, riskTier);
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log("RiskVault deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});