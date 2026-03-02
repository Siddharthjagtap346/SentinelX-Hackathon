const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying GlobalGuardian with account:", deployer.address);

  const GlobalGuardian = await hre.ethers.getContractFactory("GlobalGuardian");
  const guardian = await GlobalGuardian.deploy();
  await guardian.waitForDeployment();

  const address = await guardian.getAddress();
  console.log("GlobalGuardian deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});