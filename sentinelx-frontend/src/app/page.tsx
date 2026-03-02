import VaultCard from "@/components/VaultCard";
import PriceMonitor from "@/components/PriceMonitor";
import RiskPanel from "@/components/RiskPanel";
import LiquidationPanel from "@/components/LiquidationPanel";
import LogsPanel from "@/components/LogsPanel";
import ExecutorStatus from "@/components/ExecutorStatus";
import Header from "@/components/Header"; 
export default function Home() {
  return (
     <div className="min-h-screen flex flex-col">
      <Header />
    <div className="min-h-screen p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <VaultCard />
      <PriceMonitor />
      <RiskPanel />
      <LiquidationPanel />
      <ExecutorStatus />

      <LogsPanel />
    </div>
    </div>
  );
}
