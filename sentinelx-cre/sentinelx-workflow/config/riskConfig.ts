// config/riskConfig.ts
export const RiskConfig = {
  minHealthRatio: 150n, // Use BigInt for onchain comparisons
  deviationTolerancePercent: 3,
  emergencyPause: false,
  riskTierMultipliers: {
    LOW: 120,
    MEDIUM: 150,
    HIGH: 180
  }
} as const;