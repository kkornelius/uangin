import { useTransactions } from "@/context/TransactionContext";
import { formatRupiah } from "@/lib/constants";
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  balanceHidden: boolean;
  onToggleHidden: () => void;
}

export default function SummaryCards({ balanceHidden, onToggleHidden }: Props) {
  const { transactions } = useTransactions();

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const mask = "••••••••";

  const cards = [
    { label: "Total Saldo", value: balance, icon: Wallet, color: "text-primary", bg: "bg-primary/20" },
    { label: "Pemasukan", value: totalIncome, icon: TrendingUp, color: "text-income", bg: "bg-income-light" },
    { label: "Pengeluaran", value: totalExpense, icon: TrendingDown, color: "text-expense", bg: "bg-expense-light" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">Ringkasan</h2>
        <Button variant="outline" size="icon" className="h-8 w-8 border-2 border-border shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all" onClick={onToggleHidden} title={balanceHidden ? "Tampilkan saldo" : "Sembunyikan saldo"}>
          {balanceHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-md bg-card p-5 border-2 border-border shadow-brutal animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-md border-2 border-border ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{c.label}</span>
            </div>
            <p className={`text-2xl font-bold font-mono ${c.color}`}>
              {balanceHidden ? mask : formatRupiah(c.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
