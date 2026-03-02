//config/escalationConfig.ts
export const EscalationOrder = [
  "NONE",
  "WARNING",
  "RESTRICT",
  "PARTIAL",
  "FULL",
] as const;

export type EscalationLevel = typeof EscalationOrder[number];