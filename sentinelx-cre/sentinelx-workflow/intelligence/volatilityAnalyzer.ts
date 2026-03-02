//intelligence/volatilityAnalyzer.ts
/**
 * Simple volatility analyzer for SentinelX CRE layer
 * Computes rolling volatility based on price history
 */

export interface VolatilityResult {
  mean: number;
  variance: number;
  stdDev: number;
  isHighVolatility: boolean;
}

/**
 * Computes simple volatility from an array of historical prices
 * @param prices - array of historical prices
 * @param threshold - threshold for high volatility (default 0.05 = 5%)
 */
export function computeVolatility(
  prices: number[],
  threshold = 0.05
): VolatilityResult {
  if (prices.length === 0) {
    return {
      mean: 0,
      variance: 0,
      stdDev: 0,
      isHighVolatility: false,
    };
  }

  const n = prices.length;
  const mean = prices.reduce((a, b) => a + b, 0) / n;

  const variance =
    prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / n;

  const stdDev = Math.sqrt(variance);

  // Simple threshold: if relative stdDev > threshold
  const isHighVolatility = stdDev / mean > threshold;

  return {
    mean,
    variance,
    stdDev,
    isHighVolatility,
  };
}