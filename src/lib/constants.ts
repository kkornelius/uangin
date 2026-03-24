export const CATEGORIES_EXPENSE = ["Makanan", "Transport", "Hiburan", "Tagihan", "Lainnya"] as const;
export const CATEGORIES_INCOME = ["Gaji", "Lainnya"] as const;
export const ALL_CATEGORIES = [...CATEGORIES_EXPENSE, ...CATEGORIES_INCOME] as const;

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export function getMonthYear(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(monthYear: string) {
  const [y, m] = monthYear.split("-");
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `${months[parseInt(m) - 1]} ${y}`;
}
