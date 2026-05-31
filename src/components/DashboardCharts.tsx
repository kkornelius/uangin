import { useMemo } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { formatRupiah, getMonthYear, formatMonthLabel } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const PIE_COLORS = [
  "hsl(262, 83%, 58%)",
  "hsl(152, 72%, 40%)",
  "hsl(46, 97%, 65%)",
  "hsl(0, 84%, 60%)",
  "hsl(185, 62%, 55%)",
  "hsl(330, 80%, 60%)",
];

interface Props {
  monthFilter: string;
}

export default function DashboardCharts({ monthFilter }: Props) {
  const { transactions } = useTransactions();

  const filteredTx = useMemo(() => {
    if (monthFilter === "none") return [] as typeof transactions;
    if (monthFilter === "all") return transactions;
    return transactions.filter((t) => getMonthYear(t.date) === monthFilter);
  }, [transactions, monthFilter]);

  const barData = useMemo(() => {
    if (monthFilter === "none") return [];
    if (monthFilter === "all") {
      const map: Record<string, { income: number; expense: number }> = {};
      transactions.forEach((t) => {
        const key = getMonthYear(t.date);
        if (!map[key]) map[key] = { income: 0, expense: 0 };
        map[key][t.type] += t.amount;
      });
      return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([k, v]) => ({ name: formatMonthLabel(k), income: v.income, expense: v.expense }));
    }

    // Specific month -> single entry
    const income = filteredTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filteredTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return [{ name: formatMonthLabel(monthFilter), income, expense }];
  }, [transactions, filteredTx, monthFilter]);

  const pieData = useMemo(() => {
    if (monthFilter === "none") return [];
    const map: Record<string, number> = {};
    filteredTx.filter((t) => t.type === "expense").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTx, monthFilter]);

  if (transactions.length === 0) {
    return (
      <div className="rounded-md bg-card border-2 border-border shadow-brutal p-8 text-center text-muted-foreground font-semibold">
        Belum ada transaksi. Tambahkan transaksi pertamamu!
      </div>
    );
  }

  // When no month selected, show reset/placeholder graphs
  if (monthFilter === "none") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-md bg-card border-2 border-border shadow-brutal p-5 animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">Pemasukan vs Pengeluaran</h3>
          <div className="h-[260px] flex items-center justify-center text-muted-foreground">Pilih bulan untuk menampilkan grafik.</div>
        </div>
        <div className="rounded-md bg-card border-2 border-border shadow-brutal p-5 animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">Pengeluaran per Kategori</h3>
          <div className="h-[260px] flex items-center justify-center text-muted-foreground">Pilih bulan untuk menampilkan grafik.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-md bg-card border-2 border-border shadow-brutal p-5 animate-fade-in">
        <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">Pemasukan vs Pengeluaran</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatRupiah(v)} />
            <Bar dataKey="income" name="Pemasukan" fill="hsl(152, 72%, 40%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="expense" name="Pengeluaran" fill="hsl(0, 84%, 60%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-md bg-card border-2 border-border shadow-brutal p-5 animate-fade-in">
        <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">Pengeluaran per Kategori</h3>
        {pieData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 font-semibold">Belum ada pengeluaran</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                strokeWidth={2}
                stroke="hsl(0, 0%, 5%)"
                label={({ percent }) => `${Math.round(percent * 100)}%`}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
