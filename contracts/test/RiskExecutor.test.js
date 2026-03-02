const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RiskExecutor (Multi-Vault Hardened)", function () {

  async function deployFixture() {
    const [owner, engine, attacker] = await ethers.getSigners();

    const Executor = await ethers.getContractFactory("RiskExecutor");
    const executor = await Executor.deploy();
    await executor.waitForDeployment();

    return { executor, owner, engine, attacker };
  }

  it("Owner can approve vault", async function () {
    const { executor, owner } = await deployFixture();

    const vault = "0x0000000000000000000000000000000000001234";

    await executor.addVault(vault);

    expect(await executor.approvedVaults(vault)).to.equal(true);
  });

  it("Cannot execute on unapproved vault", async function () {
    const { executor, engine } = await deployFixture();

    await executor.setRiskEngine(engine.address);

    const vault = "0x0000000000000000000000000000000000001234";

    await expect(
  executor.connect(engine).executePartial(vault, 1)
).to.be.revertedWithCustomError(executor, "VaultNotApproved");
  });

  it("Engine can execute after vault approved", async function () {
    const { executor, engine } = await deployFixture();

    await executor.setRiskEngine(engine.address);

    const vault = "0x0000000000000000000000000000000000001234";

    await executor.addVault(vault);

    await executor.connect(engine).executePartial(vault, 1);

    expect(await executor.lastVault()).to.equal(vault);
  });
it("Prevents replay with same nonce", async function () {
  const { executor, engine } = await deployFixture();

  await executor.setRiskEngine(engine.address);

  const vault = "0x0000000000000000000000000000000000001234";
  await executor.addVault(vault);

  await executor.connect(engine).executePartial(vault, 1);

  await expect(
    executor.connect(engine).executePartial(vault, 1)
  ).to.be.revertedWithCustomError(executor, "InvalidNonce");
});
});