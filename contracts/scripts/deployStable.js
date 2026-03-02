const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying MockStableCoin with account:", deployer.address);

  const Stable = await hre.ethers.getContractFactory("MockStableCoin");
  const stable = await Stable.deploy();
  await stable.waitForDeployment();

  const address = await stable.getAddress();
  console.log("MockStableCoin deployed to:", address);

  // Mint 1M tokens to deployer
  const mintAmount = hre.ethers.parseUnits("1000000", 18);
  const tx = await stable.mint(deployer.address, mintAmount);
  await tx.wait();

  console.log("Minted 1,000,000 sUSD to deployer");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});