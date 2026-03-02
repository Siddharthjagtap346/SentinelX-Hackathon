const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying RiskExecutor with account:", deployer.address);

  const RiskExecutor = await hre.ethers.getContractFactory("RiskExecutor");
  const executor = await RiskExecutor.deploy();
  await executor.waitForDeployment();

  const address = await executor.getAddress();
  console.log("RiskExecutor deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});