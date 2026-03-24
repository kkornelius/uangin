import { useState } from "react";
import { TransactionProvider } from "@/context/TransactionContext";
import SummaryCards from "@/components/SummaryCards";
import DashboardCharts from "@/components/DashboardCharts";
import TransactionList from "@/components/TransactionList";
import { Wallet, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";

const Index = () => {
  const [dark, toggleDark] = useDarkMode();
  const [balanceHidden, setBalanceHidden] = useState(false);

  return (
    <TransactionProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b-3 border-border bg-card sticky top-0 z-10 shadow-brutal-sm">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary border-2 border-border shadow-brutal-sm">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Uangin</h1>
            </div>
            <Button variant="outline" size="icon" onClick={toggleDark} title="Mode gelap/terang" className="border-2 border-border shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="container py-6 space-y-6">
          <TransactionList />
          <SummaryCards balanceHidden={balanceHidden} onToggleHidden={() => setBalanceHidden((h) => !h)} />
          <DashboardCharts />
        </main>
      </div>
    </TransactionProvider>
  );
};

export default Index;
