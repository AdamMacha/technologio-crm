"use client";

import { useState, useEffect } from "react";
import { InvoiceWithItems } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input, Label, Textarea } from "@/ui/input";
import {
  Mail,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface SendInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithItems | null;
  onSent?: () => void;
}

export function SendInvoiceModal({
  open,
  onOpenChange,
  invoice,
  onSent,
}: SendInvoiceModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (invoice && open) {
      setRecipientEmail(invoice.client_email || "");
      setSubject(
        `Faktura č. ${invoice.invoice_number} – Technologio (${formatCurrency(
          invoice.total_amount
        )})`
      );
      setCustomMessage("");
    }
  }, [invoice, open]);

  if (!invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientEmail || !recipientEmail.includes("@")) {
      toast.error("Zadejte platnou e-mailovou adresu příjemce");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          subject: subject.trim(),
          customMessage: customMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Odeslání e-mailu selhalo");
      }

      toast.success(data.message || `Faktura byla odeslána na ${recipientEmail}`);
      onSent?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Chyba při odesílání e-mailu";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Odeslat fakturu e-mailem</DialogTitle>
              <DialogDescription>
                Faktura č. {invoice.invoice_number} ({formatCurrency(invoice.total_amount)})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Sender Info Banner */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between">
          <div className="text-slate-500">
            Odesílatel:{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              Technologio Fakturace
            </strong>{" "}
            &lt;faktury@technologio.eu&gt;
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
            Resend
          </span>
        </div>

        {/* Recipient */}
        <div>
          <Label htmlFor="recipientEmail" required>
            E-mail příjemce (klienta)
          </Label>
          <Input
            id="recipientEmail"
            type="email"
            required
            placeholder="fakturace@klient.cz"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Subject */}
        <div>
          <Label htmlFor="subject" required>
            Předmět e-mailu
          </Label>
          <Input
            id="subject"
            required
            placeholder="Předmět e-mailu"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Custom Message */}
        <div>
          <Label htmlFor="customMessage">
            Vlastní zpráva / průvodní text (volitelné)
          </Label>
          <Textarea
            id="customMessage"
            rows={3}
            placeholder="např. Posílám fakturu za dokončený redesign webu..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Attachment Card */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3.5 space-y-2">
          <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 block">
            Co e-mail obsahuje:
          </span>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                Příloha: <strong>Faktura-{invoice.invoice_number}.pdf</strong> (daňový doklad)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                QR Platba přímo v těle e-mailu pro okamžitou úhradu mobilem
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Přehledná tabulka s variabilním symbolem a číslem účtu
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Zrušit
          </Button>
          <Button type="submit" isLoading={isSending}>
            <Send className="w-4 h-4 mr-1.5" />
            Odeslat fakturu e-mailem
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
