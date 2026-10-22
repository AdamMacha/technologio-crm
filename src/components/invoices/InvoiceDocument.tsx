"use client";

import { useEffect, useState } from "react";
import { InvoiceWithItems, InvoiceStatus } from "@/types";
import {
  formatCurrency,
  formatDate,
} from "@/lib/formatters";
import { generateQrPaymentDataUrl } from "@/lib/spayd";
import { StatusBadge } from "@/ui/status-badge";
import { Button } from "@/ui/button";
import {
  Printer,
  ArrowLeft,
  QrCode,
  Download,
  Building,
  User,
  CreditCard,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { updateInvoiceStatus } from "@/lib/data-store";
import { toast } from "sonner";

interface InvoiceDocumentProps {
  initialInvoice: InvoiceWithItems;
}

export function InvoiceDocument({ initialInvoice }: InvoiceDocumentProps) {
  const [invoice, setInvoice] = useState<InvoiceWithItems>(initialInvoice);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    async function loadQr() {
      const qr = await generateQrPaymentDataUrl({
        ibanOrAccount: invoice.supplier_iban || invoice.supplier_bank_account,
        amount: invoice.total_amount,
        vs: invoice.variable_symbol,
        message: `Faktura ${invoice.invoice_number}`,
      });
      setQrCodeUrl(qr);
    }
    loadQr();
  }, [invoice]);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    try {
      const updated = await updateInvoiceStatus(invoice.id, newStatus);
      if (updated) {
        setInvoice((prev) => ({ ...prev, status: newStatus }));
        toast.success(`Stav faktury změněn na "${newStatus}"`);
      }
    } catch {
      toast.error("Chyba při změně stavu faktury");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Faktura č. {invoice.invoice_number}
              </h1>
              <StatusBadge
                status={invoice.status}
                interactive={true}
                onStatusChange={handleStatusChange}
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Variabilní symbol: {invoice.variable_symbol}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Vytisknout / Uložit PDF
          </Button>
        </div>
      </div>

      {/* Invoice Document Paper */}
      <div className="invoice-paper bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-lg">
        {/* Header: Studio Logo & Invoice Type */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b-2 border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                T
              </div>
              <span className="font-bold tracking-tight text-slate-900 text-xl">
                Technologio
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Webové studio & Digitální řešení
            </p>
          </div>

          <div className="sm:text-right">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              FAKTURA – DAŇOVÝ DOKLAD
            </h2>
            <div className="mt-1 flex sm:justify-end items-center gap-2 font-mono text-sm">
              <span className="text-slate-500">Číslo dokladu:</span>
              <strong className="text-slate-900 font-bold">{invoice.invoice_number}</strong>
            </div>
            <div className="flex sm:justify-end items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Variabilní symbol:</span>
              <strong className="font-mono text-slate-800">{invoice.variable_symbol}</strong>
            </div>
          </div>
        </div>

        {/* Supplier & Client Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100">
          {/* Dodavatel */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[11px] mb-2">
              <Building className="w-3.5 h-3.5" />
              <span>Dodavatel</span>
            </div>
            <p className="font-bold text-base text-slate-900">{invoice.supplier_name}</p>
            <p>{invoice.supplier_address}</p>
            <div className="pt-1 space-y-0.5">
              <p>IČO: <strong className="text-slate-800">{invoice.supplier_ico}</strong></p>
              {invoice.supplier_dic && (
                <p>DIČ: <strong className="text-slate-800">{invoice.supplier_dic}</strong></p>
              )}
            </div>
          </div>

          {/* Odběratel */}
          <div className="space-y-1.5 text-xs text-slate-600 sm:border-l sm:border-slate-100 sm:pl-8">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[11px] mb-2">
              <User className="w-3.5 h-3.5" />
              <span>Odběratel</span>
            </div>
            <p className="font-bold text-base text-slate-900">{invoice.client_name}</p>
            <p>{invoice.client_address || "Adresa neuvedena"}</p>
            <div className="pt-1 space-y-0.5">
              {invoice.client_ico && (
                <p>IČO: <strong className="text-slate-800">{invoice.client_ico}</strong></p>
              )}
              {invoice.client_dic && (
                <p>DIČ: <strong className="text-slate-800">{invoice.client_dic}</strong></p>
              )}
              {invoice.client_email && (
                <p className="text-slate-500">{invoice.client_email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Details & Dates Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 bg-slate-50/60 -mx-8 sm:-mx-12 px-8 sm:px-12 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Datum vystavení</span>
            <strong className="text-slate-800 font-semibold mt-0.5 block">
              {formatDate(invoice.issue_date)}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Datum splatnosti</span>
            <strong className="text-indigo-600 font-bold mt-0.5 block">
              {formatDate(invoice.due_date)}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">DUZP</span>
            <strong className="text-slate-800 font-semibold mt-0.5 block">
              {formatDate(invoice.taxable_date)}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Způsob úhrady</span>
            <strong className="text-slate-800 font-semibold mt-0.5 block">
              Bankovní převod
            </strong>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="py-4 border-b border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            Číslo účtu: <strong className="text-slate-900 text-sm font-bold font-mono">{invoice.supplier_bank_account}</strong>
          </div>
          {invoice.supplier_iban && (
            <div className="text-slate-500 font-mono">
              IBAN: <strong className="text-slate-800">{invoice.supplier_iban}</strong>
              {invoice.supplier_swift && ` • SWIFT: ${invoice.supplier_swift}`}
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="py-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-400 uppercase font-semibold">
                <th className="pb-3 text-left">Položka / Popis služby</th>
                <th className="pb-3 text-right">Počet</th>
                <th className="pb-3 text-right">Jedn.</th>
                <th className="pb-3 text-right">Cena / jedn.</th>
                <th className="pb-3 text-right">Celkem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 text-slate-900 font-medium pr-4">
                    {item.description}
                  </td>
                  <td className="py-3.5 text-right text-slate-600 whitespace-nowrap">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-right text-slate-500 whitespace-nowrap">
                    {item.unit}
                  </td>
                  <td className="py-3.5 text-right text-slate-600 whitespace-nowrap">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer: QR Code & Totals */}
        <div className="pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
          {/* QR Platba Box */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeUrl}
                alt="QR Platba"
                className="w-28 h-28 rounded-lg bg-white p-1 border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-28 h-28 bg-slate-200 rounded-lg animate-pulse" />
            )}
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1 font-bold text-slate-900">
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>QR Platba</span>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-[180px]">
                Naskenujte v bankovní aplikaci pro okamžité vyplnění platebních údajů.
              </p>
            </div>
          </div>

          {/* Totals */}
          <div className="w-full sm:w-72 space-y-2 text-right">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Mezisoučet:</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>DPH:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(invoice.tax_amount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-3 border-t-2 border-slate-900 text-slate-900">
              <span className="text-sm font-bold uppercase">Celkem k úhradě:</span>
              <span className="text-2xl font-black text-indigo-600">
                {formatCurrency(invoice.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Legal notice */}
        {invoice.notes && (
          <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500 italic">
            Poznámka: {invoice.notes}
          </div>
        )}
      </div>
    </div>
  );
}
