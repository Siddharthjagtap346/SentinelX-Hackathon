const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying SentinelXReserveAuthority with:", deployer.address);

  // ✅ CHANGE THESE AFTER DEPLOY
  const FORWARDER_ADDRESS = deployer.address; // real CRE forwarder
  const GUARDIAN_ADDRESS = "0x88c5def11a9f5d036320e9240d901dFcf06C2840";   // deployed guardian
  const STABLE_ADDRESS   = "0x75737d6E17bF2D4BB91448FA752333603deeC33F";     // deployed stablecoin

  const ReserveAuthority = await hre.ethers.getContractFactory(
    "SentinelXReserveAuthority"
  );

  const authority = await ReserveAuthority.deploy(
    FORWARDER_ADDRESS,
    GUARDIAN_ADDRESS,
    STABLE_ADDRESS
  );

  await authority.waitForDeployment();

  const address = await authority.getAddress();
  console.log("ReserveAuthority deployed to:", address);

  // Transfer Guardian ownership to authority
  const guardian = await hre.ethers.getContractAt(
    "GlobalGuardian",
    GUARDIAN_ADDRESS
  );

  const tx = await guardian.transferOwnership(address);
  await tx.wait();

  console.log("Guardian ownership transferred to ReserveAuthority");
  const stable = await hre.ethers.getContractAt(
  "MockStableCoin",
  STABLE_ADDRESS
);

await stable.transferOwnership(address);
console.log("Stable ownership transferred to Authority");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});