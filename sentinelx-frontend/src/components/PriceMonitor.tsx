"use client";

import { useEffect, useState } from "react";

export default function PriceMonitor() {
  const [real, setReal] = useState<number>(0);
  const [controlled, setControlled] = useState<number>(0);

  async function fetchPrices() {
  try {
    const realRes = 200; // await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");

    if (!realRes) throw new Error("Real price fetch failed");
    const realPrice = realRes;

    const controlledRes = await fetch("http://localhost:3001/price");

    if (!controlledRes.ok) throw new Error("Backend failed");

    const controlledData = await controlledRes.json();

    setReal(realPrice);
    setControlled(Number(controlledData.price));
  } catch (err) {
    console.error("Price fetch error:", err);
  }
}


  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 4000);
    return () => clearInterval(interval);
  }, []);

  const deviation =
    real > 0 ? (Math.abs(real - controlled) / real) * 100 : 0;

  return (
    <div className="bg-card-bg p-6 rounded-2xl shadow-md border border-blue-300
                hover:shadow-lg hover:scale-105 hover:border-blue-400 hover:bg-blue-950
                transition-all duration-300">
      <h2 className="text-lg font-semibold mb-4">
        Price Monitor
      </h2>

      <p>Real: ${real}</p>
      <p>Controlled: ${controlled}</p>
      <p className="text-red-400">
        Deviation: {deviation.toFixed(2)}%
      </p>
    </div>
  );
}
