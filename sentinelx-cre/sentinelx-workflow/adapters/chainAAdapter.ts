import { ethers } from "ethers";
import { logger } from "../utils/logger";

const vaultAbi = [
  "function collateral() view returns (uint256)",
  "function debt() view returns (uint256)",
  "function riskTier() view returns (uint8)",
  "function isLocked() view returns (bool)",
  "function getHealthRatio(uint256 price) view returns (uint256)",
  "function lockVault(uint256 price)"
];

export class ChainAAdapter {
  private contract: ethers.Contract;

  constructor(rpc: string, privateKey: string, vaultAddress: string) {
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    this.contract = new ethers.Contract(vaultAddress, vaultAbi, wallet);
  }

  async getVaultState(price: number) {
    logger.info(`Fetching vault state for price: ${price} on Chain A`);

    const [collateral, debt, tier, locked] = await Promise.all([
      this.contract.collateral(),
      this.contract.debt(),
      this.contract.riskTier(),
      this.contract.isLocked()
    ]);

    const health = await this.contract.getHealthRatio(price);

    return {
      collateral: Number(collateral),
      debt: Number(debt),
      riskTier: Number(tier),
      isLocked: Boolean(locked),
      health: Number(health)
    };
  }

  async lockVault(price: number) {
    logger.info(`Locking vault on Chain A with price: ${price}`);
    const tx = await this.contract.lockVault(price);
    await tx.wait();
    logger.info("Vault locked on Chain A");
  }
}
