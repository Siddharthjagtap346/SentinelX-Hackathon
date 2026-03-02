//intelligence/systemicRiskEngine.ts
export function computeSystemicRisk(
  vaultStates: any[],
  volatilityStdDev: number,
  reserveHealth: number
) {
  if (vaultStates.length === 0) {
    return {
      score: 0,
      systemicFreeze: false,
      systemicRestrict: false,
    };
  }

  // 1️⃣ Weighted unhealthy ratio
  const unhealthy = vaultStates.filter(v => Number(v.health) < 150);

  const weightedDebt = unhealthy.reduce(
    (sum, v) => sum + Number(v.debt),
    0
  );

  const totalDebt = vaultStates.reduce(
    (sum, v) => sum + Number(v.debt),
    0
  );

  const unhealthyRatio = unhealthy.length / vaultStates.length;
  const debtStress = totalDebt > 0 ? weightedDebt / totalDebt : 0;

  // 2️⃣ Volatility factor
  const volatilityFactor = Math.min(volatilityStdDev / 50, 1);

  // 3️⃣ Reserve stress
  const reserveStress =
    reserveHealth < 100 ? (100 - reserveHealth) / 20 : 0;

  // 4️⃣ Final risk score
// Adjusted weights (sum = 1.0)
const weightUnhealthy = 0.4;
const weightVolatility = 0.25;
const weightReserve = 0.15;
const weightDebt = 0.2;

const rawScore =
  unhealthyRatio * weightUnhealthy +
  volatilityFactor * weightVolatility +
  reserveStress * weightReserve +
  debtStress * weightDebt;

// Clamp just in case
const riskScore = Math.min(rawScore, 1);

  return {
    score: riskScore,
    systemicFreeze: riskScore > 0.7,
    systemicRestrict: riskScore > 0.5,
  };
}