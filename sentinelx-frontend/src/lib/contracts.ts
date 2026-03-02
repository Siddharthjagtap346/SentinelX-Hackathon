import { Address } from "viem";

// 🔵 Deployed addresses
export const vaultAddress: Address = "0x55fb5b13b26A231De9ee15E32E5f421009888d71";
export const executorAddress: Address = "0x25546EE6250A8B74dB6C0BA5739d1EF7eB8e1d9A";
export const guardianAddress: Address = "0x88c5def11a9f5d036320e9240d901dFcf06C2840"; // replace

// --------------------
// RiskVault ABI
// --------------------
export const vaultAbi = [
  { name: "riskTier", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "getHealthRatio", type: "function", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
  { name: "collateral", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "debt", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "isLocked", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "restrictedMode", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "lastEscalation", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "getVaultSummary", type: "function", stateMutability: "view", inputs: [], outputs: [
      { type: "uint256", name: "_collateral" },
      { type: "uint256", name: "_debt" },
      { type: "uint256", name: "_healthLocked" },
      { type: "uint8", name: "_escalation" },
      { type: "bool", name: "_locked" },
      { type: "bool", name: "_restricted" },
    ] 
  },
];

// --------------------
// RiskExecutor ABI
// --------------------
export const executorAbi = [
  { name: "lastVault", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { name: "lastTimestamp", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "executePartial", type: "function", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" }], outputs: [] },
  { name: "executeFull", type: "function", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" }], outputs: [] },
  { name: "freezeSystem", type: "function", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" }], outputs: [] },
];