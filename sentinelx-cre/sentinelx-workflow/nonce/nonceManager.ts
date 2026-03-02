export function getNextNonce(current: bigint): bigint {
  return current + 1n;
}