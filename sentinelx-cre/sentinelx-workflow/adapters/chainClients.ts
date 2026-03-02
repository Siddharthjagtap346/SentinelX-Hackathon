//adapters/chainClients.ts
import {
  bytesToHex,
  cre,
  encodeCallMsg,
  LAST_FINALIZED_BLOCK_NUMBER,
  type Runtime,
} from "@chainlink/cre-sdk";

import {
  encodeFunctionData,
  decodeFunctionResult,
  zeroAddress,
  type Address,
} from "viem";

/**
 * Fetches per-vault health, last escalation (Chain A),
 * and executor-enforced nonce (Chain B)
 */
export async function getVaultState(
  runtime: Runtime<any>,
  selector: number, // Chain A selector
  vault: string,
  price: number
) {
  // 🔹 Chain A client (Vault chain)
  const evmVault = new cre.capabilities.EVMClient(BigInt(selector));

  // 🔹 Chain B client (Executor chain)
  const evmExecutor = new cre.capabilities.EVMClient(
    BigInt(runtime.config.chainB.selector)
  );

  /*
   ==========================================
   1️⃣ HEALTH RATIO (Chain A - Vault)
   ==========================================
  */
  const healthCall = encodeFunctionData({
    abi: [
      {
        name: "getHealthRatio",
        type: "function",
        stateMutability: "view",
        inputs: [{ type: "uint256" }],
        outputs: [{ type: "uint256" }],
      },
    ],
    functionName: "getHealthRatio",
    args: [BigInt(Math.floor(price * 1e8))],
  });

  /*
   ==========================================
   2️⃣ LAST ESCALATION (Chain A - Vault)
   ==========================================
  */
  const escalationCall = encodeFunctionData({
    abi: [
      {
        name: "lastEscalation",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint8" }],
      },
    ],
    functionName: "lastEscalation",
  });
  
const debtCall = encodeFunctionData({
  abi: [
    {
      name: "debt",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint256" }],
    },
  ],
  functionName: "debt",
});
  /*
   ==========================================
   3️⃣ EXECUTOR NONCE (Chain B - RiskExecutor)
   vaultNonce(address vault)
   ==========================================
  */
  const nonceCall = encodeFunctionData({
    abi: [
      {
        name: "vaultNonce",
        type: "function",
        stateMutability: "view",
        inputs: [{ type: "address" }],
        outputs: [{ type: "uint256" }],
      },
    ],
    functionName: "vaultNonce",
    args: [vault as Address],
  });

  /*
   ==========================================
   PARALLEL CALLS
   ==========================================
  */
  const [debtResp, healthResp, escalationResp, nonceResp] = await Promise.all([
  // 1️⃣ debt (Chain A)
  evmVault.callContract(runtime, {
    call: encodeCallMsg({
      from: zeroAddress,
      to: vault as Address,
      data: debtCall,
    }),
    blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
  }).result(),

  // 2️⃣ health (Chain A)
  evmVault.callContract(runtime, {
    call: encodeCallMsg({
      from: zeroAddress,
      to: vault as Address,
      data: healthCall,
    }),
    blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
  }).result(),

  // 3️⃣ escalation (Chain A)
  evmVault.callContract(runtime, {
    call: encodeCallMsg({
      from: zeroAddress,
      to: vault as Address,
      data: escalationCall,
    }),
    blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
  }).result(),

  // 4️⃣ nonce (Chain B)
  evmExecutor.callContract(runtime, {
    call: encodeCallMsg({
      from: zeroAddress,
      to: runtime.config.chainB.executor as Address,
      data: nonceCall,
    }),
    blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
  }).result(),
]);

  /*
   ==========================================
   DECODE RESULTS
   ==========================================
  */

  const health = decodeFunctionResult({
    abi: [
      {
        name: "getHealthRatio",
        type: "function",
        inputs: [{ type: "uint256" }],
        outputs: [{ type: "uint256" }],
      },
    ],
    functionName: "getHealthRatio",
    data: bytesToHex(healthResp.data),
  }) as bigint;

  const lastEscalationRaw = decodeFunctionResult({
  abi: [
    {
      name: "lastEscalation",
      type: "function",
      inputs: [],
      outputs: [{ type: "uint8" }],
    },
  ],
  functionName: "lastEscalation",
  data: bytesToHex(escalationResp.data),
}) as bigint;

const lastEscalation = Number(lastEscalationRaw);

  // 🔥 Correct executor nonce decode
  const vaultNonce = decodeFunctionResult({
    abi: [
      {
        name: "vaultNonce",
        type: "function",
        inputs: [{ type: "address" }],
        outputs: [{ type: "uint256" }],
      },
    ],
    functionName: "vaultNonce",
    data: bytesToHex(nonceResp.data),
  }) as bigint;
const debt = decodeFunctionResult({
  abi: [
    {
      name: "debt",
      type: "function",
      inputs: [],
      outputs: [{ type: "uint256" }],
    },
  ],
  functionName: "debt",
  data: bytesToHex(debtResp.data),
}) as bigint;

  return {
    health,
    lastEscalation,
    vaultNonce,
    debt,
  };
}

export async function getStableSupply(
  runtime: Runtime<any>,
  selector: number,
  stableAddress: string
) {
  const evm = new cre.capabilities.EVMClient(BigInt(selector));

  const supplyCall = encodeFunctionData({
    abi: [
      {
        name: "totalSupply",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256" }],
      },
    ],
    functionName: "totalSupply",
  });

  const response = await evm.callContract(runtime, {
    call: encodeCallMsg({
      from: zeroAddress,
      to: stableAddress as Address,
      data: supplyCall,
    }),
    blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
  }).result();

  const supply = decodeFunctionResult({
    abi: [
      {
        name: "totalSupply",
        type: "function",
        inputs: [],
        outputs: [{ type: "uint256" }],
      },
    ],
    functionName: "totalSupply",
    data: bytesToHex(response.data),
  }) as bigint;

  return supply;
}
