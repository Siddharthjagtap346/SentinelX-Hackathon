"use client";

import { useState } from "react";

export default function LogsPanel() {
  const [logs] = useState<string[]>([
    "System initialized",
    "Awaiting price consensus...",
  ]);

  return (
    <div className="bg-card-bg p-6 rounded-2xl shadow-md border border-blue-300
                hover:shadow-lg hover:scale-105 hover:border-blue-400 hover:bg-blue-950
                transition-all duration-300">
      <h2 className="text-lg font-semibold mb-4">
        Engine Logs
      </h2>

      {logs.map((log, i) => (
        <p key={i} className="text-sm text-gray-400">
          {log}
        </p>
      ))}
    </div>
  );
}
