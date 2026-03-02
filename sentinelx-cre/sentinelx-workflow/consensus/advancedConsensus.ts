// consensus/advancedConsensus.ts
import { RiskConfig } from "../config/riskConfig";

export function advancedConsensus(realPrice: number, controlledPrice: number) {
  if (!Number.isFinite(realPrice) || realPrice <= 0) {
    return {
      valid: false,
      reason: "Invalid real price",
      deviation: 100,
    };
  }

  const deviation =
    Math.abs(realPrice - controlledPrice) / realPrice * 100;

  if (deviation > RiskConfig.deviationTolerancePercent) {
    return {
      valid: false,
      reason: "Deviation exceeded tolerance",
      deviation,
    };
  }

  const agreedPrice = (realPrice + controlledPrice) / 2;

  return {
    valid: true,
    agreedPrice,
    deviation,
  };
}