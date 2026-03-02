"use client";

import { useEffect, useState } from "react";
import { executorClient } from "@/lib/chain";
import { executorAbi, executorAddress } from "@/lib/contracts";

export default function ExecutorStatus() {
  const [lastVault, setLastVault] = useState<string>("—");
  const [timestamp, setTimestamp] = useState<number>(0);

  useEffect(() => {
    async function load() {
      const vault = await executorClient.readContract({
        address: executorAddress,
        abi: executorAbi,
        functionName: "lastVault", // ✅ matches contract
      });

      const time = await executorClient.readContract({
        address: executorAddress,
        abi: executorAbi,
        functionName: "lastTimestamp", // ✅ matches contract
      });

      setLastVault(String(vault));
      setTimestamp(Number(time));
    }

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card-bg p-6 rounded-2xl shadow-md border border-blue-300
                hover:shadow-lg hover:scale-105 hover:border-blue-400 hover:bg-blue-950
                transition-all duration-300">
      <h2 className="text-lg font-semibold mb-4">Cross-Chain Executor</h2>
      <p>Last Vault: {lastVault}</p>
      <p>
        Last Execution:{" "}
        {timestamp > 0
          ? new Date(timestamp * 1000).toLocaleString()
          : "None"}
      </p>
    </div>
  );
}