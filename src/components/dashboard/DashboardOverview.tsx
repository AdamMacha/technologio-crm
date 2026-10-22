"use client";

import { useState } from "react";
import { DashboardStats, InvoiceWithItems, InvoiceStatus } from "@/types";
import {
  formatCurrency,
  formatDate,
  getCurrentPeriod,
  formatPeriodName,
} from "@/lib/formatters";
import { StatusBadge } from "@/ui/status-badge";
import { Button } from "@/ui/button";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Repeat,
  Plus,
  ArrowRight,
  Sparkles,
  FileText,
  Eye,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";
import { updateInvoiceStatus } from "@/lib/data-store";
import { toast } from "sonner";

interface DashboardOverviewProps {
  stats: DashboardStats;
  recentInvoices: InvoiceWithItems[];
}

export function DashboardOverview({
  stats: initialStats,
  recentInvoices: initialInvoices,
}: DashboardOverviewProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>(initialInvoices);

  const currentPeriod = getCurrentPeriod();
  const currentMonthName = formatPeriodName(currentPeriod);

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    try {
      const updated = await updateInvoiceStatus(id, newStatus);
      if (updated) {
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
        );
        toast.success(`Stav faktury změněn na "${newStatus}"`);

        // Refresh stats dynamically
        const { getDashboardStats } = await import("@/lib/data-store");
        const freshStats = await getDashboardStats();
        setStats(freshStats);
      }
    } catch {
      toast.error("Chyba při změně stavu");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Přehled studia za {currentMonthName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Vítejte zpět, Technologio 👋
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Správa klientů, automatické měsíční paušály a evidence plateb na jednom místě.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/retainers">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/10">
                <Repeat className="w-4 h-4 mr-2" />
                Paušály ({stats.activeRetainersCount})
              </Button>
            </Link>
            <Link href="/invoices/new">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30">
                <Plus className="w-4 h-4 mr-2" />
                Nová faktura
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Celkem vyfakturováno */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Vyfakturováno ({currentMonthName})
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            {formatCurrency(stats.totalBilledThisMonth)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Celkem vystaveno tento měsíc</span>
          </div>
        </div>

        {/* Zaplaceno */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Zaplaceno tento měsíc
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-3 tracking-tight">
            {formatCurrency(stats.paidThisMonth)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Uhrazené platby na bankovní účet</span>
          </div>
        </div>

        {/* Po splatnosti */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:border-rose-200 dark:hover:border-rose-900 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Po splatnosti
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-3 tracking-tight">
            {formatCurrency(stats.overdueAmount)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-500 font-medium">
            <span>{stats.overdueCount} {stats.overdueCount === 1 ? "faktura vyžaduje" : "faktury vyžadují"} urgenci</span>
          </div>
        </div>

        {/* Pravidelný příjem (MRR) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Měsíční paušály (MRR)
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-3 tracking-tight">
            {formatCurrency(stats.mrr)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Z {stats.activeRetainersCount} aktivních paušálů</span>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Poslední vystavené faktury
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klikněte na stav faktury pro okamžité přepnutí (Čeká na platbu / Zaplaceno / Po splatnosti)
            </p>
          </div>

          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Všechny faktury</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-12 p-8">
            <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Zatím nemáte žádné vystavené faktury
            </p>
            <Link href="/invoices/new" className="inline-block mt-3">
              <Button size="sm">Vystavit první fakturu</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Číslo / Klient</th>
                  <th scope="col" className="px-5 py-3.5">Datum vystavení</th>
                  <th scope="col" className="px-5 py-3.5">Splatnost</th>
                  <th scope="col" className="px-5 py-3.5">Částka</th>
                  <th scope="col" className="px-5 py-3.5">Stav (rychlé přepnutí)</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Náhled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {invoices.slice(0, 6).map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          {inv.is_retainer ? (
                            <Repeat className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {inv.invoice_number}
                          </Link>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">
                            {inv.client_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      {formatDate(inv.issue_date)}
                    </td>

                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{formatDate(inv.due_date)}</span>
                        {inv.status === "overdue" && (
                          <span className="text-[10px] font-bold text-rose-500 uppercase">
                            Expirováno
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(inv.total_amount)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={inv.status}
                        interactive={true}
                        onStatusChange={(newStatus) => handleStatusChange(inv.id, newStatus)}
                      />
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Zobrazit</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
