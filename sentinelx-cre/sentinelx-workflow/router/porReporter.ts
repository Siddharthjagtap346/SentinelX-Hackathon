//router/porReporter.ts

import { prepareReportRequest } from "@chainlink/cre-sdk";
import { AbiCoder } from "ethers";


export async function reportPoR(
  runtime: any,
  reserves: bigint,
  supply: bigint,
  riskScore: number
) {
  const selectorA = BigInt(runtime.config.chainA.selector);
  const authority = runtime.config.chainA.authority;

  // 1️⃣ Encode payload exactly as Solidity expects:
  // abi.encode(uint256 reserves, uint256 supply, uint256 riskScore)
  const payload = AbiCoder.defaultAbiCoder().encode(
  ["uint256", "uint256", "uint256"],
  [reserves, supply, BigInt(riskScore)]
);

  // 2️⃣ Prepare CRE report
  const reportRequest = prepareReportRequest(`0x${payload.slice(2)}`);

  // 3️⃣ Deliver to ReserveAuthority contract on Chain A
  const report = await runtime
    .report(reportRequest, {
      chainSelector: selectorA,
      to: authority,
    })
    .result();

  return report;
}