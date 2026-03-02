//policies/riskPolicyEngine.ts
export function evaluateRiskPolicy(
  health: number,
  lastEscalation: number,
  debt: bigint
) {
  if (health > 180) return { action: "NONE" };

  if (health <= 180 && lastEscalation === 0)
    return { action: "WARNING" };

  if (health <= 170 && lastEscalation === 1)
    return { action: "RESTRICT" };

  if (health <= 160 && lastEscalation === 2) {
    const reductionAmount = debt / 10n; // 10%
    return {
      action: "PARTIAL",
      reductionAmount
    };
  }

  if (health <= 150 && lastEscalation === 3)
    return { action: "FULL" };

  return { action: "NONE" };
}


/* use this version if you want to return nextEscalation for logging purposes and to test the Scene 4 staged crash without waiting for real-time health changes

export function evaluateRiskPolicy(
  health: number,
  lastEscalation: number,
  debt: bigint
) {
  const SCALE = 1e8;

  if (health <= 180 * SCALE && lastEscalation === 0) {
    return { action: "WARNING", nextEscalation: 1 };
  }

  if (health <= 170 * SCALE && lastEscalation === 1) {
    return { action: "RESTRICT", nextEscalation: 2 };
  }

  if (health <= 160 * SCALE && lastEscalation === 2) {
    return {
      action: "PARTIAL",
      reductionAmount: debt / 10n,
      nextEscalation: 3
    };
  }

  if (health <= 150 * SCALE && lastEscalation === 3) {
    return { action: "FULL", nextEscalation: 4 };
  }

  return { action: "NONE" };
}*/