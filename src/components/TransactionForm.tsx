import { useState, useEffect } from "react";
import { useTransactions, Transaction, TransactionType } from "@/context/TransactionContext";
import { CATEGORIES_EXPENSE, CATEGORIES_INCOME } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}

export default function TransactionForm({ open, onClose, editTx }: Props) {
  const { addTransaction, updateTransaction } = useTransactions();

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setAmount(String(editTx.amount));
      setCategory(editTx.category);
      setDescription(editTx.description);
      setDate(editTx.date);
    } else {
      setType("expense");
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [editTx, open]);

  const categories = type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description || !date) {
      toast.error("Semua field harus diisi!");
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Nominal harus lebih dari 0!");
      return;
    }

    const data = { type, amount: parsed, category, description, date };
    if (editTx) {
      updateTransaction({ ...data, id: editTx.id });
      toast.success("Transaksi berhasil diperbarui!");
    } else {
      addTransaction(data);
      toast.success("Transaksi berhasil ditambahkan!");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md border-2 border-border shadow-brutal-lg rounded-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-lg">{editTx ? "Edit Transaksi" : "Tambah Transaksi"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              className={`flex-1 border-2 border-border font-bold shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${type === "income" ? "bg-income hover:bg-income/90 text-income-foreground" : ""}`}
              onClick={() => { setType("income"); setCategory(""); }}
            >
              Pemasukan
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              className={`flex-1 border-2 border-border font-bold shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${type === "expense" ? "bg-expense hover:bg-expense/90 text-expense-foreground" : ""}`}
              onClick={() => { setType("expense"); setCategory(""); }}
            >
              Pengeluaran
            </Button>
          </div>

          <div>
            <Label className="font-bold">Nominal (Rp)</Label>
            <Input type="number" placeholder="100000" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" className="border-2 border-border shadow-brutal-sm font-mono" />
          </div>

          <div>
            <Label className="font-bold">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-2 border-border shadow-brutal-sm"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent className="border-2 border-border shadow-brutal">
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-bold">Deskripsi</Label>
            <Input placeholder="Makan siang, gaji bulanan..." value={description} onChange={(e) => setDescription(e.target.value)} className="border-2 border-border shadow-brutal-sm" />
          </div>

          <div>
            <Label className="font-bold">Tanggal</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-2 border-border shadow-brutal-sm" />
          </div>

          <Button type="submit" className="w-full border-2 border-border shadow-brutal font-bold text-base hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all">{editTx ? "Simpan Perubahan" : "Tambah Transaksi"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
