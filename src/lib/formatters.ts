import { InvoiceStatus } from "@/types";

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 Kč";
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyWithDecimals(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0,00 Kč";
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "–";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "–";
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function toISODateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentPeriod(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatPeriodName(period: string | null | undefined): string {
  if (!period) return "–";
  const [year, month] = period.split("-");
  const months = [
    "leden", "únor", "březen", "duben", "květen", "červen",
    "červenec", "srpen", "září", "říjen", "listopad", "prosinec"
  ];
  const mIndex = parseInt(month, 10) - 1;
  if (mIndex >= 0 && mIndex < 12) {
    return `${months[mIndex]} ${year}`;
  }
  return period;
}

export function getStatusDetails(status: InvoiceStatus) {
  switch (status) {
    case "paid":
      return {
        label: "Zaplaceno",
        bgColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        badgeColor: "bg-emerald-500",
      };
    case "overdue":
      return {
        label: "Po splatnosti",
        bgColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        badgeColor: "bg-rose-500",
      };
    case "cancelled":
      return {
        label: "Stornováno",
        bgColor: "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400 border-zinc-500/30",
        badgeColor: "bg-zinc-500",
      };
    case "pending":
    default:
      return {
        label: "Čeká na platbu",
        bgColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        badgeColor: "bg-amber-500",
      };
  }
}
