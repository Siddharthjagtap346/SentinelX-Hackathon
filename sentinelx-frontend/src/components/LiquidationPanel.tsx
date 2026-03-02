"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { vaultAddress, executorAddress, vaultAbi, executorAbi } from "@/lib/contracts";
import { vaultClient, executorClient } from "@/lib/chain";

export default function LiquidationPanel() {
  const [healthRatio, setHealthRatio] = useState("0");
  const [collateral, setCollateral] = useState("0");
  const [debt, setDebt] = useState("0");
  const [lastVault, setLastVault] = useState("—");
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [restricted, setRestricted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // ----------------------------
      // Chain A: Vault
      // ----------------------------
      const summary = await vaultClient.readContract({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "getVaultSummary",
      });

      const [col, dbt, health, escalation, isLocked, isRestricted] = summary as [
        bigint, bigint, bigint, number, boolean, boolean
      ];

      setCollateral(formatEther(col));
      setDebt(formatEther(dbt));
      setHealthRatio(health.toString());
      setLocked(isLocked);
      setRestricted(isRestricted);

      // ----------------------------
      // Chain B: Executor
      // ----------------------------
      const lastV = await executorClient.readContract({
        address: executorAddress,
        abi: executorAbi,
        functionName: "lastVault",
      });

      const lastTs = await executorClient.readContract({
        address: executorAddress,
        abi: executorAbi,
        functionName: "lastTimestamp",
      });

      setLastVault(lastV as string);
      setLastTimestamp(Number(lastTs as bigint));
    } catch (err) {
      console.error("Liquidation panel error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = Number(healthRatio) > 100;

  return (
    <div className="bg-card-bg p-6 rounded-2xl shadow-md border border-blue-300
                hover:shadow-lg hover:scale-105 hover:border-blue-400 hover:bg-blue-950
                transition-all duration-300">
      <h2 className="text-lg font-semibold">CRE Automated Enforcement</h2>
      {loading ? (
        <p className="text-gray-400">Loading vault data...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500">Collateral</p>
              <p className="text-white font-medium">{collateral} ETH</p>
            </div>
            <div>
              <p className="text-zinc-500">Debt</p>
              <p className="text-white font-medium">{debt} ETH</p>
            </div>
            <div>
              <p className="text-zinc-500">Health Ratio</p>
              <p className={`font-medium ${isHealthy ? "text-green-400" : "text-red-400"}`}>
                {healthRatio}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Vault Status</p>
              <p className={locked ? "text-red-400 font-medium" : "text-green-400 font-medium"}>
                {locked ? "LOCKED" : restricted ? "RESTRICTED" : "ACTIVE"}
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 text-sm">
            <p className="text-zinc-500">Last Executor Vault</p>
            <p className="text-white break-all">{lastVault}</p>

            <p className="text-zinc-500 mt-2">Last Execution Timestamp</p>
            <p className="text-white">
              {lastTimestamp === 0 ? "No actions yet" : new Date(lastTimestamp * 1000).toLocaleString()}
            </p>
          </div>

          <p className="text-xs text-zinc-500 mt-2">
            Vault actions (Partial / Full / Freeze) are executed automatically by CRE RiskExecutor.
          </p>
        </>
      )}
    </div>
  );
}