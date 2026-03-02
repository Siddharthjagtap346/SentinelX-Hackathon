// src/lib/chain.ts
import { createPublicClient, http, defineChain } from "viem";

// ----------------------------
// Chain A - RiskVault / GlobalGuardian
// ----------------------------
export const chainA = defineChain({
  id: 17371, // Tenderly chainA
  name: "ChainA-Testnet",
  network: "chainA",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://virtual.rpc.tenderly.co/Iamsid/project/private/chainA-testnet/13a320b5-3bac-4e86-b95d-854accf54c3c"] } },
});

export const vaultClient = createPublicClient({
  chain: chainA,
  transport: http(chainA.rpcUrls.default.http[0]),
});

// ----------------------------
// Chain B - RiskExecutor
// ----------------------------
export const chainB = defineChain({
  id: 17372, // Tenderly chainB
  name: "ChainB-Testnet",
  network: "chainB",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://virtual.rpc.tenderly.co/Iamsid/project/private/chainB-testnet/341f6445-73b5-4aa1-9d42-984516a26237"] } },
});

export const executorClient = createPublicClient({
  chain: chainB,
  transport: http(chainB.rpcUrls.default.http[0]),
});