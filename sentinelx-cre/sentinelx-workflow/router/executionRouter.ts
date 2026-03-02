// router/executionRouter.ts
import {
  prepareReportRequest,
} from "@chainlink/cre-sdk";
import { encodeFunctionData } from "viem";
import { logger } from "../utils/logger";
import { getNextNonce } from "../nonce/nonceManager";

/**
 * Executes action on RiskExecutor (Chain B)
 * CRE-native write using report() + prepareReportRequest()
 */

export async function routeExecution(
  runtime: any,
  action: string,
  vaultState: any,
  price: number
) {
  const selectorB = BigInt(runtime.config.chainB.selector);
  const executorAddress = runtime.config.chainB.executor;

  const vault = vaultState.vault;
const nonce = getNextNonce(vaultState.vaultNonce);

// 🧪 VERIFY EXECUTOR NONCE (Chain B)
logger.info(
  "Nonce verification " +
    JSON.stringify({
      vault,
      chainNonce: vaultState.vaultNonce.toString(),
      nextNonceUsed: nonce.toString(),
    })
);

logger.info("Execution started"+
JSON.stringify({
  action,
  vault,
  nonce: nonce.toString(),
  chainSelector: selectorB.toString(),
 })
);

  let data: `0x${string}`;

  try {
    // -------------------------------------------------
    // Encode correct function call
    // -------------------------------------------------

    switch (action) {

  case "RESTRICT":
    data = encodeFunctionData({
      abi: [
        {
          name: "executeRestrict",
          type: "function",
          inputs: [
            { type: "address" },
            { type: "uint256" }, // nonce
            { type: "uint256" }, // health
            { type: "uint256" }, // price
          ],
        },
      ],
      functionName: "executeRestrict",
      args: [
        vault,
        nonce,
        vaultState.health,
        BigInt(Math.floor(price * 1e8)),
      ],
    });
    break;

      case "PARTIAL":
        data = encodeFunctionData({
          abi: [
            {
  name: "executePartial",
  type: "function",
  inputs: [
  { type: "address" },
  { type: "uint256" }, // nonce
  { type: "uint256" }, // reductionAmount
  { type: "uint256" }, // health
  { type: "uint256" }, // price
],
}
          ],
          functionName: "executePartial",
          args: [
  vault,
  nonce,
  vaultState.reductionAmount,   // ← NEW
  vaultState.health,
  BigInt(Math.floor(price * 1e8))
],
        });
        break;

      case "FULL":
        data = encodeFunctionData({
          abi: [
            {
  name: "executeFull",
  type: "function",
  inputs: [
    { type: "address" },
    { type: "uint256" },
    { type: "uint256" },
    { type: "uint256" },
  ],
}
          ],
          functionName: "executeFull",
          args: [
  vault,
  nonce,
  vaultState.health,
  BigInt(Math.floor(price * 1e8))
],
        });
        break;

      case "FREEZE":
        data = encodeFunctionData({
          abi: [
            {
              name: "freezeSystem",
              type: "function",
              inputs: [
  { type: "address" },
  { type: "uint256" },
  { type: "uint256" },
  { type: "uint256" },
],
            },
          ],
          functionName: "freezeSystem",
          args: [
  vault,
  nonce,
  vaultState.health,
  BigInt(Math.floor(price * 1e8))
],
        });
        break;
case "WARNING":
    logger.info("WARNING action — no executor call, just log");
    return;

      default:
        logger.warn("Unknown action received", { action });
        return;
    }

// -------------------------------------------------
// CRE WRITE via Forwarder
// -------------------------------------------------

// 1️⃣ Encode executor call (already done in 'data')

// 2️⃣ Encode forwarder call
// -------------------------------------------------
// CRE WRITE (Direct to Executor)
// -------------------------------------------------

// 1️⃣ Prepare calldata only
const reportRequest = prepareReportRequest(data);

// 2️⃣ Pass chain + target to runtime.report()
const report = await runtime
  .report(reportRequest, {
    chainSelector: selectorB,
    to: executorAddress,
  })
  .result();


logger.info(
  "Report submitted to DON",
  JSON.stringify({
    action,
    vault,
    executor: executorAddress,
  })
);

return report;

  } catch (error: any) {
    logger.error("Execution failed", {
      action,
      vault,
      error: error?.message ?? error,
    });

    throw error;
  }
}