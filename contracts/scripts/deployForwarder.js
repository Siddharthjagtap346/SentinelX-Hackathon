const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Forwarder with:", deployer.address);

  const Forwarder = await ethers.getContractFactory("CREForwarder");
  const forwarder = await Forwarder.deploy(deployer.address);

  await forwarder.waitForDeployment();

  console.log("Forwarder deployed at:", await forwarder.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});