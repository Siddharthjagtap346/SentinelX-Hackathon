"use client";

import { useEffect, useState } from "react";
import { vaultClient } from "@/lib/chain";
import { vaultAbi, vaultAddress } from "@/lib/contracts";

export default function VaultCard() {
  const [health, setHealth] = useState<string>("0");
  const [tier, setTier] = useState<number>(0);
  const [locked, setLocked] = useState<boolean>(false);
  const [restricted, setRestricted] = useState<boolean>(false);

  async function load() {
    try {
      const summary = await vaultClient.readContract({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "getVaultSummary",
      });

      const [col, dbt, healthVal, escalation, isLocked, isRestricted] = summary as [
        bigint, bigint, bigint, number, boolean, boolean
      ];

      setHealth((Number(healthVal) / 100).toFixed(2));
      setLocked(isLocked);
      setRestricted(isRestricted);

      const tierResult = await vaultClient.readContract({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "riskTier",
      });
      setTier(Number(tierResult));
    } catch (err) {
      console.error("Vault load error:", err);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card-bg p-6 rounded-2xl shadow-md border border-blue-300
                hover:shadow-lg hover:scale-105 hover:border-blue-400 hover:bg-blue-950
                transition-all duration-300">
      <h2 className="text-lg font-semibold mb-4">Vault Status</h2>
      <p>Risk Tier: {tier}</p>
      <p>Health Ratio: {health}%</p>
      <p>Status: <span className={locked ? "text-red-400" : restricted ? "text-yellow-400" : "text-green-400"}>
        {locked ? "LOCKED" : restricted ? "RESTRICTED" : "ACTIVE"}
      </span></p>
    </div>
  );
}