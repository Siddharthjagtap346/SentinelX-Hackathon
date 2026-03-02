const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RiskVault (Hardened Escalation)", function () {

  async function deployFixture() {
    const [owner, engine, attacker] = await ethers.getSigners();

    const Guardian = await ethers.getContractFactory("GlobalGuardian");
    const guardian = await Guardian.deploy();
    await guardian.waitForDeployment();

    const Vault = await ethers.getContractFactory("RiskVault");
    const vault = await Vault.deploy(10, 10000, 1);
    await vault.waitForDeployment();

    await vault.setRiskEngine(engine.address);
    await vault.setGuardian(await guardian.getAddress());

    return { vault, owner, engine, attacker, guardian };
  }

  it("Calculates health correctly", async function () {
    const { vault } = await deployFixture();

    const health = await vault.getHealthRatio(2000);
    expect(health).to.equal(200);
  });

  it("Engine can trigger warning", async function () {
    const { vault, engine } = await deployFixture();

    await vault.connect(engine).triggerWarning(50, 1000);

    expect(await vault.lastEscalation()).to.equal(1);
  });

  it("Non-engine cannot trigger warning", async function () {
    const { vault, attacker } = await deployFixture();

    await expect(
      vault.connect(attacker).triggerWarning(50, 1000)
    ).to.be.revertedWithCustomError(vault, "NotAuthorized");
  });

  it("Allows partial liquidation through correct escalation flow", async function () {
  const { vault, engine } = await deployFixture();

  // Step 1: WARNING
  await vault.connect(engine).triggerWarning(50, 1000);

  // Step 2: RESTRICT
  await vault.connect(engine).enableRestrictedMode(50, 1000);

  // Step 3: PARTIAL
  await vault.connect(engine).partialLiquidation(1000, 50, 1000);

  expect(await vault.debt()).to.equal(9000);
  expect(await vault.lastEscalation()).to.equal(3); // PARTIAL
});

  it("Blocks when guardian paused", async function () {
    const { vault, guardian, engine } = await deployFixture();

    await guardian.pause();

    await expect(
      vault.connect(engine).triggerWarning(50, 1000)
    ).to.be.revertedWithCustomError(vault, "SystemPaused");
  });

});