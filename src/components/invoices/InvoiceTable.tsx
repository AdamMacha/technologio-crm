"use client";

import { useState, useEffect } from "react";
import { InvoiceWithItems, InvoiceStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/ui/status-badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Trash2,
  Repeat,
  Download,
  Calendar,
  AlertTriangle,
  Mail,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { updateInvoiceStatus, deleteInvoice } from "@/lib/data-store";
import { SendInvoiceModal } from "./SendInvoiceModal";

interface InvoiceTableProps {
  initialInvoices: InvoiceWithItems[];
}

export function InvoiceTable({ initialInvoices }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [emailInvoice, setEmailInvoice] = useState<InvoiceWithItems | null>(null);

  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    try {
      const updated = await updateInvoiceStatus(id, newStatus);
      if (updated) {
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
        );
        toast.success(`Stav faktury změněn na "${newStatus}"`);
      }
    } catch {
      toast.error("Chyba při změně stavu faktury");
    }
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (confirm(`Opravdu chcete smazat fakturu č. ${invoiceNumber}?`)) {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      toast.success(`Faktura ${invoiceNumber} byla smazána`);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(search.toLowerCase()) ||
      String(inv.total_amount).includes(search);

    if (!matchesSearch) return false;
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fakturace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Přehled vystavených faktur, rychlá změna úhrad a export do PDF
          </p>
        </div>

        <Link href="/invoices/new">
          <Button className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Nová faktura
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Hledat podle čísla, klienta nebo částky..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-800/50 border-0"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
          {[
            { id: "all", label: "Všechny" },
            { id: "pending", label: "Čeká na platbu" },
            { id: "paid", label: "Zaplaceno" },
            { id: "overdue", label: "Po splatnosti" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 p-8">
            <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Žádné faktury nenalezeny
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Vyzkoušejte změnit filtr nebo vystavte novou fakturu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Číslo / Klient</th>
                  <th scope="col" className="px-5 py-3.5">Vystaveno</th>
                  <th scope="col" className="px-5 py-3.5">Splatnost</th>
                  <th scope="col" className="px-5 py-3.5">Částka</th>
                  <th scope="col" className="px-5 py-3.5">Stav úhrady</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Invoice Number & Client */}
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

                    {/* Issue Date */}
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      {formatDate(inv.issue_date)}
                    </td>

                    {/* Due Date */}
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{formatDate(inv.due_date)}</span>
                        {inv.status === "overdue" && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(inv.total_amount)}
                    </td>

                    {/* Status Badge with Quick Dropdown */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={inv.status}
                        interactive={true}
                        onStatusChange={(newStatus) => handleStatusChange(inv.id, newStatus)}
                      />
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEmailInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Odeslat e-mailem klientovi"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          download={`Faktura-${inv.invoice_number}.pdf`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Stáhnout PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/invoices/${inv.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Upravit fakturu"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Detail faktury"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(inv.id, inv.invoice_number)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Smazat fakturu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SendInvoiceModal
        open={Boolean(emailInvoice)}
        onOpenChange={(open) => {
          if (!open) setEmailInvoice(null);
        }}
        invoice={emailInvoice}
      />
    </div>
  );
}
