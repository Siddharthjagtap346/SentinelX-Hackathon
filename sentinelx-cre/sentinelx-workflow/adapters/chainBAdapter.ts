import { ethers } from "ethers";
import { logger } from "../utils/logger";

const executorAbi = [
  "function executeLiquidation(address vault)"
];

export class ChainBAdapter {
  private contract: ethers.Contract;

  constructor(rpc: string, privateKey: string, executorAddress: string) {
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    this.contract = new ethers.Contract(executorAddress, executorAbi, wallet);
  }

  async executeLiquidation(vaultAddress: string) {
    logger.info(`Executing cross-chain liquidation on Chain B for vault: ${vaultAddress}`);
    const tx = await this.contract.executeLiquidation(vaultAddress);
    await tx.wait();
    logger.info("Liquidation executed on Chain B");
  }
}
