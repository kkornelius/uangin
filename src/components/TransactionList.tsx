import { useState, useMemo } from "react";
import { useTransactions, Transaction } from "@/context/TransactionContext";
import { formatRupiah, getMonthYear, formatMonthLabel } from "@/lib/constants";
import { Pencil, Trash2, ArrowUpDown, Plus, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TransactionForm from "./TransactionForm";
import { toast } from "sonner";

function exportCSV(transactions: Transaction[]) {
  const header = "Tanggal,Tipe,Kategori,Deskripsi,Jumlah\n";
  const rows = transactions.map((t) =>
    `${t.date},${t.type === "income" ? "Pemasukan" : "Pengeluaran"},${t.category},"${t.description}",${t.amount}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transaksi.csv";
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV berhasil diunduh!");
}

export default function TransactionList() {
  const { transactions, deleteTransaction } = useTransactions();
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [monthFilter, setMonthFilter] = useState("none");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");

  const months = useMemo(() => {
    const set = new Set(transactions.map((t) => getMonthYear(t.date)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    if (monthFilter === "none") return [];
    let list = transactions;
    if (monthFilter !== "all") {
      list = list.filter((t) => getMonthYear(t.date) === monthFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return sortAsc ? cmp : -cmp;
    });
  }, [transactions, monthFilter, sortAsc, search]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success("Transaksi dihapus!");
  };

  const showList = monthFilter !== "none";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Daftar Transaksi</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {showList && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-[180px] border-2 border-border shadow-brutal-sm"
              />
            </div>
          )}
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[180px] border-2 border-border shadow-brutal-sm">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent className="border-2 border-border shadow-brutal">
              <SelectItem value="none">Pilih Bulan</SelectItem>
              <SelectItem value="all">Semua Bulan</SelectItem>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{formatMonthLabel(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showList && (
            <>
              <Button variant="outline" size="icon" onClick={() => setSortAsc(!sortAsc)} title="Urutkan" className="border-2 border-border shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => exportCSV(filtered)} title="Export CSV" disabled={filtered.length === 0} className="border-2 border-border shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button onClick={() => { setEditTx(null); setFormOpen(true); }} size="sm" className="border-2 border-border shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold">
            <Plus className="h-4 w-4 mr-1" /> Tambah
          </Button>
        </div>
      </div>

      {/* Prompt to select month */}
      {!showList && (
        <div className="rounded-md bg-card border-2 border-border shadow-brutal p-8 text-center text-muted-foreground font-semibold">
          Pilih bulan di atas untuk menampilkan transaksi.
        </div>
      )}

      {/* Monthly summary when filtered */}
      {showList && monthFilter !== "all" && (
        <div className="flex gap-4 text-sm font-bold font-mono">
          <span className="text-income">Pemasukan: {formatRupiah(totalIncome)}</span>
          <span className="text-expense">Pengeluaran: {formatRupiah(totalExpense)}</span>
        </div>
      )}

      {/* List */}
      {showList && (
        filtered.length === 0 ? (
          <div className="rounded-md bg-card border-2 border-border shadow-brutal p-8 text-center text-muted-foreground font-semibold">
            Tidak ada transaksi.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-md bg-card border-2 border-border shadow-brutal p-4 animate-fade-in hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-3 h-3 rounded-sm border-2 border-border shrink-0 ${tx.type === "income" ? "bg-income" : "bg-expense"}`} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground font-semibold">{tx.category} · {new Date(tx.date).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-sm font-bold font-mono ${tx.type === "income" ? "text-income" : "text-expense"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                  </span>
                  <Button variant="outline" size="icon" className="h-8 w-8 border-2 border-border shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all" onClick={() => { setEditTx(tx); setFormOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 border-2 border-border text-expense hover:text-expense shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all" onClick={() => handleDelete(tx.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} editTx={editTx} />
    </div>
  );
}
