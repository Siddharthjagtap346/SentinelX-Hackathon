import type { Runtime } from "@chainlink/cre-sdk";
import { fetchRealPrice } from "./triggers/priceSourceReal";
import { fetchControlledPrice } from "./triggers/priceSourceControlled";
import { advancedConsensus } from "./consensus/advancedConsensus";
import { evaluateRiskPolicy } from "./policies/riskPolicyEngine";
import { computeSystemicRisk } from "./intelligence/systemicRiskEngine";
import { computeVolatility } from "./intelligence/volatilityAnalyzer";
import { getVaultState } from "./adapters/chainClients";
import { getStableSupply } from "./adapters/chainClients";
import { reportPoR } from "./router/porReporter";
import { getReserveHealth } from "./triggers/reserveSource";
import { routeExecution } from "./router/executionRouter";
import { EscalationOrder } from "./config/escalationConfig";

export async function runWorkflow(runtime: Runtime<any>) {
  runtime.log("----- SentinelX CRE Workflow Starting -----");

  // 1️⃣ Price Fetch
  const [realPrice, controlledPrice] = await Promise.all([
    fetchRealPrice(runtime),
    fetchControlledPrice(runtime),
  ]);

  const consensus = advancedConsensus(realPrice, controlledPrice);

  if (!consensus.valid) {
  runtime.log(`Consensus rejected. Deviation: ${consensus.deviation}%`);
  runtime.log("⚠️ TEST MODE: Forcing execution despite invalid consensus");
}

  const price = consensus.valid
  ? consensus.agreedPrice!
  : realPrice;  // fallback for test mode
  runtime.log(`Consensus agreed price: ${price}`);

  // 2️⃣ Reserve Check
  // 2️⃣ Reserve Check
const reserveHealth = await getReserveHealth(runtime);

let reserveAction: "NONE" | "RESTRICT" | "FREEZE" | "EMERGENCY" = "NONE";

if (reserveHealth < 90) reserveAction = "EMERGENCY";
else if (reserveHealth < 95) reserveAction = "FREEZE";
else if (reserveHealth < 100) reserveAction = "RESTRICT";

runtime.log(`Reserve health: ${reserveHealth}% | Action=${reserveAction}`);
let freezeTriggered = false;

if (reserveAction === "EMERGENCY") {
  runtime.log("🚨 EMERGENCY reserve breach. Freezing all vaults.");
  freezeTriggered = true;
} else if (reserveAction === "FREEZE") {
  runtime.log("⚠ Reserve critical. Freezing system.");
  freezeTriggered = true;
}
  // 3️⃣ Fetch Vault States
  const vaultStates = [];

  for (const vault of runtime.config.chainA.vaults) {
    const state = await getVaultState(
      runtime,
      runtime.config.chainA.selector,
      vault,
      price
    );

    const readableHealth = Number(state.health) / 1e8;

runtime.log(
  `[Vault ${vault}] Health=${readableHealth.toFixed(2)}% (raw=${Number(state.health)}) | Escalation=${EscalationOrder[state.lastEscalation]} | Nonce=${state.vaultNonce}`
);

    vaultStates.push({
      vault,
      ...state,
      reductionAmount: undefined as bigint | undefined,
    });
  }

  // 4️⃣ Systemic Risk
  const healthValues = vaultStates.map(v => Number(v.health));
 const volatility = computeVolatility(healthValues);

const systemic = computeSystemicRisk(
  vaultStates,
  volatility.stdDev,
  reserveHealth
);

runtime.log(
  `Systemic Risk Score=${systemic.score.toFixed(2)} | Freeze=${systemic.systemicFreeze}`
);

// 🧠 System Health Index (0–100 scale)
const systemHealthIndex = ((1 - systemic.score) * 100).toFixed(1);
runtime.log("=================================================");
runtime.log(`System Health Index = ${systemHealthIndex}/100`);
runtime.log("=================================================");
let systemLevel = "STABLE";
if (systemic.score > 0.7) systemLevel = "CRITICAL";
else if (systemic.score > 0.5) systemLevel = "ELEVATED";

runtime.log(
  `System Health Index=${systemHealthIndex}/100 | Risk Level=${systemLevel}`
);
// =====================================================
// 🏦 PoR REPORTING TO RESERVE AUTHORITY (Chain A)
// =====================================================

runtime.log("Preparing PoR report for ReserveAuthority...");

// 1️⃣ Fetch stable supply from Chain A
const supply = await getStableSupply(
  runtime,
  runtime.config.chainA.selector,
  runtime.config.chainA.stable
);

// 2️⃣ Convert reserve health % to reserve amount scale
// If reserveHealth = 100%, assume fully backed (1:1)
// We scale to 1e18 format for contract ratio logic
const reserves = BigInt(
  Math.floor(reserveHealth * 1e16) // % to 1e18
);

// 3️⃣ Send report to SentinelXReserveAuthority
const riskScorePercent = Math.floor(systemic.score * 100);

await reportPoR(
  runtime,
  reserves,
  supply,
  riskScorePercent
);

runtime.log(
  `PoR Report Sent → Reserves=${reserves.toString()} | Supply=${supply.toString()} | RiskScore=${riskScorePercent}%`
);


  // 🔥 FREEZE EXECUTION
  freezeTriggered = freezeTriggered || systemic.systemicFreeze;

if (freezeTriggered) {
  runtime.log("🔥 FREEZE condition met. Executing freeze on all vaults.");
  runtime.log("🔒 GLOBAL GUARDIAN PAUSED");

  for (const v of vaultStates) {
    await routeExecution(runtime, "FREEZE", v, price);
  }

  // Stop workflow after freeze
  return;
}

  // 5️⃣ Volatility
  

  runtime.log(
    `Volatility stdDev=${volatility.stdDev.toFixed(2)} | High=${volatility.isHighVolatility}`
  );

  // =====================================================
// 🎬 SCENE 4 — STAGED MARKET CRASH (Optimized)
// =====================================================
/*
if (!freezeTriggered) {
  runtime.log("----- SCENE 4: Controlled Market Crash Simulation -----");

  // 🔹 Read vault state ONCE
  const baseVault = vaultStates[0];
let lastEscalation = baseVault.lastEscalation;
  const crashPhases = [1200, 950, 750];


for (const phasePrice of crashPhases) {
  runtime.log(`\n📉 Crash Phase Price: ${phasePrice}`);

  // Convert everything to bigint for calculations
  const phasePriceBN = BigInt(Math.floor(phasePrice * 1e8));
  const currentPriceBN = BigInt(Math.floor(price * 1e8));

  const priceRatio = (phasePriceBN * 1_00000000n) / currentPriceBN; // optional scale factor
  const simulatedHealth = (BigInt(baseVault.health) * priceRatio) / 1_00000000n;

  const readableHealth = Number(simulatedHealth) / 1e8;
  runtime.log(`[Vault ${baseVault.vault}] Phase Health=${readableHealth.toFixed(2)}% | LastEscalation=${EscalationOrder[lastEscalation]}`);

  const policyResult = evaluateRiskPolicy(
    Number(simulatedHealth), // still pass number to risk policy
    lastEscalation,
    baseVault.debt
  );

  if ("nextEscalation" in policyResult && typeof policyResult.nextEscalation === "number") {
    lastEscalation = policyResult.nextEscalation;
    baseVault.lastEscalation = lastEscalation; // update vault locally
  }

  if (policyResult.action !== "NONE") {
    if (policyResult.action === "PARTIAL") {
      // Compute reductionAmount safely with bigint
      const reductionAmount = BigInt(baseVault.health) - simulatedHealth;
      baseVault.reductionAmount = reductionAmount < 0n ? 0n : reductionAmount;
    }
    runtime.log(`🚨 EscalationTriggered → ${policyResult.action}`);
    await routeExecution(runtime, policyResult.action, baseVault, phasePrice);
  } else {
    runtime.log("No escalation needed.");
  }
}
}*/
  runtime.log("----- SentinelX CRE Workflow Completed -----");
}