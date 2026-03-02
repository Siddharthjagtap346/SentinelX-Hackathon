"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#111827] border-b border-blue-600 shadow-[0_4px_20px_rgba(59,130,246,0.4)] p-6 flex flex-col md:flex-row items-center justify-between animate-fadeIn">
      
      <div className="w-full md:w-auto bg-[#1e293b] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          
          {/* Inline SVG Logo */}
          <div className="bg-[#0f172a] p-3 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse-glow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.8"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-[#e0e7ff] drop-shadow-[0_0_10px_#3b82f6]">
            SentinelX Dashboard
          </h1>
        </div>

        {/* Live Info */}
        <div className="flex items-center gap-6">
          <p className="text-[#60a5fa] font-mono">{time}</p>
          <p className="bg-[#0f172a] text-[#3b82f6] px-3 py-1 rounded-lg shadow-inner animate-bounce-slow">
            Live Monitoring
          </p>
        </div>
        
      </div>
    </header>
  );
}