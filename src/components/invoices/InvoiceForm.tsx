"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Client, Invoice, InvoiceItem, Settings } from "@/types";
import { formatCurrency, toISODateString } from "@/lib/formatters";
import { Button } from "@/ui/button";
import { Input, Label, Textarea } from "@/ui/input";
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Building,
  User,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { saveInvoice, getNextInvoiceNumber, getClients } from "@/lib/data-store";
import { ClientModal } from "@/components/clients/ClientModal";

interface InvoiceFormProps {
  clients: Client[];
  settings: Settings;
  preselectedClientId?: string;
}

export function InvoiceForm({
  clients,
  settings,
  preselectedClientId,
}: InvoiceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = preselectedClientId || searchParams.get("clientId") || "";

  const [clientList, setClientList] = useState<Client[]>(clients);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [variableSymbol, setVariableSymbol] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>(toISODateString());
  const [dueDate, setDueDate] = useState<string>("");
  const [taxableDate, setTaxableDate] = useState<string>(toISODateString());
  const [notes, setNotes] = useState<string>(settings.invoice_note || "");

  // Načíst klienty na klientovi pro zajištění nejnovějších dat
  useEffect(() => {
    getClients().then((res) => {
      if (res && res.length > 0) {
        setClientList(res);
      }
    });
  }, []);

  // Synchronizovat pokud se změní clients prop
  useEffect(() => {
    if (clients && clients.length > 0) {
      setClientList(clients);
    }
  }, [clients]);

  // Client snapshot
  const [clientName, setClientName] = useState("");
  const [clientIco, setClientIco] = useState("");
  const [clientDic, setClientDic] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "Vývoj webové aplikace a frontendové úpravy",
      quantity: 1,
      unit: "ks",
      unit_price: 15000,
      vat_rate: settings.is_vat_payer ? 21 : 0,
      total_price: 15000,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  // Initialize invoice number and due date
  useEffect(() => {
    async function init() {
      const nextNum = await getNextInvoiceNumber();
      setInvoiceNumber(nextNum);
      setVariableSymbol(nextNum);

      const due = new Date();
      due.setDate(due.getDate() + (settings.default_due_days || 14));
      setDueDate(toISODateString(due));
    }
    init();
  }, [settings.default_due_days]);

  // Handle client selection
  useEffect(() => {
    if (selectedClientId) {
      const client = clientList.find((c) => c.id === selectedClientId);
      if (client) {
        setClientName(client.name);
        setClientIco(client.ico || "");
        setClientDic(client.dic || "");
        setClientAddress(
          [client.street, client.zip, client.city].filter(Boolean).join(", ")
        );
        setClientEmail(client.email || "");

        // If client has retainer, we can prefill retainer description and amount
        if (client.has_retainer && client.retainer_amount > 0) {
          setItems([
            {
              description: client.retainer_description || "Měsíční paušál a servis",
              quantity: 1,
              unit: "měsíc",
              unit_price: client.retainer_amount,
              vat_rate: settings.is_vat_payer ? 21 : 0,
              total_price: client.retainer_amount,
            },
          ]);
        }
      }
    }
  }, [selectedClientId, clientList, settings.is_vat_payer]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const taxAmount = settings.is_vat_payer
    ? items.reduce(
        (sum, item) => sum + (Number(item.total_price) || 0) * ((Number(item.vat_rate) || 0) / 100),
        0
      )
    : 0;
  const totalAmount = subtotal + taxAmount;

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "unit_price") {
      const qty = field === "quantity" ? parseFloat(value) || 0 : item.quantity;
      const price = field === "unit_price" ? parseFloat(value) || 0 : item.unit_price;
      item.total_price = qty * price;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unit: "hod",
        unit_price: 1200,
        vat_rate: settings.is_vat_payer ? 21 : 0,
        total_price: 1200,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("Faktura musí mít alespoň jednu položku");
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) {
      toast.error("Vyberte prosím klienta nebo zadejte odběratele");
      return;
    }
    if (items.some((it) => !it.description.trim())) {
      toast.error("Všechny položky faktury musí mít vyplněný popis");
      return;
    }

    setIsSaving(true);
    try {
      const invoiceData: Partial<Invoice> = {
        client_id: selectedClientId || null,
        invoice_number: invoiceNumber,
        variable_symbol: variableSymbol || invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        taxable_date: taxableDate,
        status: "pending",
        payment_method: "bank_transfer",
        supplier_name: settings.company_name,
        supplier_ico: settings.ico,
        supplier_dic: settings.dic,
        supplier_address: `${settings.street}, ${settings.zip} ${settings.city}`,
        supplier_bank_account: settings.bank_account,
        supplier_iban: settings.iban,
        supplier_swift: settings.swift,
        client_name: clientName,
        client_ico: clientIco,
        client_dic: clientDic,
        client_address: clientAddress,
        client_email: clientEmail,
        notes,
      };

      const saved = await saveInvoice(invoiceData, items);
      toast.success(`Faktura ${saved.invoice_number} byla úspěšně vystavena!`);
      router.push(`/invoices/${saved.id}`);
      router.refresh();
    } catch (err) {
      toast.error("Chyba při vystavování faktury");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vystavit novou fakturu
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Číslo faktury: {invoiceNumber || "..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <Button type="button" variant="outline">
              Zrušit
            </Button>
          </Link>
          <Button type="submit" isLoading={isSaving}>
            <FileText className="w-4 h-4 mr-1.5" />
            Vystavit a uložit fakturu
          </Button>
        </div>
      </div>

      {/* Grid: Dodavatel & Odběratel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dodavatel (Technologio) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                Dodavatel (Vaše studio)
              </span>
            </div>
            <Link
              href="/settings"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Upravit v Nastavení
            </Link>
          </div>

          <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {settings.company_name}
            </p>
            <p>IČO: {settings.ico} {settings.dic && `• DIČ: ${settings.dic}`}</p>
            <p>{settings.street}, {settings.zip} {settings.city}</p>
            <p>Bankovní účet: <strong className="text-slate-900 dark:text-white">{settings.bank_account}</strong></p>
            {settings.iban && <p>IBAN: {settings.iban}</p>}
          </div>
        </div>

        {/* Odběratel (Klient) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                Odběratel (Klient)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsClientModalOpen(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nový klient
            </button>
          </div>

          <div>
            <Label htmlFor="clientSelect" required>
              Vybrat z existujících klientů
            </Label>
            <select
              id="clientSelect"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            >
              <option value="">-- Vyberte klienta ze seznamu --</option>
              {clientList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.ico ? `(IČO: ${c.ico})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="sm:col-span-2">
              <Label htmlFor="cName" required>Název firmy / Jméno</Label>
              <Input
                id="cName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Název firmy odběratele"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="cIco">IČO</Label>
              <Input
                id="cIco"
                value={clientIco}
                onChange={(e) => setClientIco(e.target.value)}
                placeholder="12345678"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cDic">DIČ</Label>
              <Input
                id="cDic"
                value={clientDic}
                onChange={(e) => setClientDic(e.target.value)}
                placeholder="CZ12345678"
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="cAddress">Adresa odběratele</Label>
              <Input
                id="cAddress"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Ulice, PSČ Město"
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="cEmail">E-mail pro zaslání faktury</Label>
              <Input
                id="cEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="faktura@klient.cz"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Platební a datové údaje */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Calendar className="w-4 h-4 text-indigo-500" />
          Fakturační a platební náležitosti
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="invNum" required>Číslo faktury (RRRRXXXX)</Label>
            <Input
              id="invNum"
              value={invoiceNumber}
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
                setVariableSymbol(e.target.value);
              }}
              required
              className="mt-1 font-mono font-medium"
            />
          </div>

          <div>
            <Label htmlFor="vs" required>Variabilní symbol</Label>
            <Input
              id="vs"
              value={variableSymbol}
              onChange={(e) => setVariableSymbol(e.target.value)}
              required
              className="mt-1 font-mono font-medium"
            />
          </div>

          <div>
            <Label htmlFor="issueD" required>Datum vystavení</Label>
            <Input
              id="issueD"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="dueD" required>Datum splatnosti</Label>
            <Input
              id="dueD"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="mt-1 font-semibold text-indigo-600 dark:text-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Položky faktury */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            Položky faktury
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addItem}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Přidat položku
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 sm:gap-3 items-center bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="col-span-12 sm:col-span-5">
                <Label className="sm:hidden mb-1">Popis položky</Label>
                <Input
                  placeholder="Popis služby nebo dodávky..."
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                <Label className="sm:hidden mb-1">Počet</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="any"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-4 sm:col-span-1">
                <Label className="sm:hidden mb-1">Jedn.</Label>
                <Input
                  value={item.unit}
                  onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                  placeholder="hod"
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                <Label className="sm:hidden mb-1">Cena/jedn. (Kč)</Label>
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(idx, "unit_price", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-10 sm:col-span-1 text-right font-semibold text-sm text-slate-900 dark:text-white">
                {formatCurrency(item.total_price)}
              </div>

              <div className="col-span-2 sm:col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Smazat položku"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col items-end gap-1 text-sm">
          <div className="flex justify-between w-64 text-slate-500 dark:text-slate-400">
            <span>Mezisoučet:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {settings.is_vat_payer && (
            <div className="flex justify-between w-64 text-slate-500 dark:text-slate-400">
              <span>DPH:</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between w-64 pt-2 border-t border-slate-200 dark:border-slate-800 text-base font-bold text-slate-900 dark:text-white">
            <span>Celkem k úhradě:</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-lg">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Poznámka na faktuře */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <Label htmlFor="notes">Poznámka / doplňující text na faktuře</Label>
        <Textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Doplňující platební pokyny, reference smlouvy o dílo..."
          className="mt-1"
        />
      </div>

      {/* Bottom submit button */}
      <div className="flex justify-end gap-3">
        <Link href="/invoices">
          <Button type="button" variant="outline">
            Zrušit
          </Button>
        </Link>
        <Button type="submit" size="lg" isLoading={isSaving}>
          <FileText className="w-5 h-5 mr-2" />
          Vystavit fakturu {invoiceNumber}
        </Button>
      </div>

      <ClientModal
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
        onSaved={(newClient) => {
          setClientList((prev) => {
            const exists = prev.some((c) => c.id === newClient.id);
            return exists ? prev.map((c) => (c.id === newClient.id ? newClient : c)) : [newClient, ...prev];
          });
          setSelectedClientId(newClient.id);
        }}
      />
    </form>
  );
}
