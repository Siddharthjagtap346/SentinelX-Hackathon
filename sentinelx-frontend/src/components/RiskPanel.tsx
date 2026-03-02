"use client";

import { useEffect, useState } from "react";
import { vaultClient } from "@/lib/chain";
import { vaultAbi, vaultAddress } from "@/lib/contracts";

export default function RiskPanel() {
  const [tier, setTier] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);

  useEffect(() => {
    async function load() {
      const tierResult = await vaultClient.readContract({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "riskTier",
      });
      const tierNumber = Number(tierResult);
      setTier(tierNumber);

      const thresholds = [120, 150, 180]; // LOW, MEDIUM, HIGH
      setThreshold(thresholds[tierNumber]);
    }
    load();
  }, []);

  return (
    <div className="bg-card-bg p-6 rounded-2xl shadow-md border border-blue-300
                hover:shadow-lg hover:scale-105 hover:border-blue-400 hover:bg-blue-950
                transition-all duration-300">
      <h2 className="text-lg font-semibold mb-4">Risk Policy Engine</h2>
      <p>Current Tier: {tier}</p>
      <p>Liquidation Threshold: {threshold}%</p>
    </div>
  );
}