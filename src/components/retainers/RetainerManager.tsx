"use client";

import { useState } from "react";
import { Client, InvoiceWithItems } from "@/types";
import { formatCurrency, getCurrentPeriod, formatPeriodName } from "@/lib/formatters";
import { Button } from "@/ui/button";
import {
  Repeat,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code2,
  Copy,
  Check,
  TrendingUp,
  FileCheck,
  Trash2,
  Edit2,
  Ban,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  generateRetainersForPeriod,
  deactivateRetainer,
  deleteClient,
} from "@/lib/data-store";
import { ClientModal } from "@/components/clients/ClientModal";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface RetainerManagerProps {
  initialClients: Client[];
  initialInvoices: InvoiceWithItems[];
}

export function RetainerManager({
  initialClients,
  initialInvoices,
}: RetainerManagerProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>(initialInvoices);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCron, setCopiedCron] = useState(false);

  // Modal edit state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentPeriod = getCurrentPeriod();
  const currentMonthName = formatPeriodName(currentPeriod);

  const retainerClients = clients.filter((c) => c.has_retainer);
  const totalMrr = retainerClients.reduce((sum, c) => sum + (c.retainer_amount || 0), 0);
  const avgRetainer = retainerClients.length > 0 ? totalMrr / retainerClients.length : 0;

  // Determine which clients already have invoices generated for this month
  const clientStatusList = retainerClients.map((client) => {
    const existingInvoice = invoices.find(
      (inv) => inv.client_id === client.id && inv.retainer_period === currentPeriod
    );

    const isGenerated = Boolean(
      existingInvoice || client.retainer_last_generated_period === currentPeriod
    );

    return {
      client,
      isGenerated,
      invoice: existingInvoice,
    };
  });

  const generatedCount = clientStatusList.filter((c) => c.isGenerated).length;
  const pendingCount = clientStatusList.length - generatedCount;

  const handleGenerateNow = async () => {
    if (pendingCount === 0) {
      toast.info("Všechny faktury pro aktuální měsíc již byly vygenerovány!");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateRetainersForPeriod(currentPeriod);

      if (result.count > 0) {
        toast.success(
          `Úspěšně vygenerováno ${result.count} faktur za ${formatCurrency(result.total)}!`
        );
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        const { getClients, getInvoices } = await import("@/lib/data-store");
        const [updatedClients, updatedInvoices] = await Promise.all([
          getClients(),
          getInvoices(),
        ]);
        setClients(updatedClients);
        setInvoices(updatedInvoices);
      } else {
        toast.info("Nebyly nalezeny žádné nové faktury k vygenerování.");
      }
    } catch {
      toast.error("Chyba při generování paušálů");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeactivate = async (clientId: string, clientName: string) => {
    if (
      confirm(
        `Opravdu chcete zrušit měsíční paušál pro klienta "${clientName}"?\n(Klient zůstane v CRM, ale paušál bude deaktivován)`
      )
    ) {
      try {
        await deactivateRetainer(clientId);
        setClients((prev) =>
          prev.map((c) =>
            c.id === clientId ? { ...c, has_retainer: false, retainer_amount: 0 } : c
          )
        );
        toast.success(`Měsíční paušál pro "${clientName}" byl zrušen`);
      } catch {
        toast.error("Chyba při rušení paušálu");
      }
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (
      confirm(
        `Opravdu chcete trvale smazat klienta "${clientName}" a jeho paušál?`
      )
    ) {
      try {
        await deleteClient(clientId);
        setClients((prev) => prev.filter((c) => c.id !== clientId));
        toast.success(`Klient "${clientName}" byl smazán`);
      } catch {
        toast.error("Chyba při mazání klienta");
      }
    }
  };

  const handleSavedClient = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  const copyCronCommand = () => {
    const domain = typeof window !== "undefined" ? window.location.origin : "https://vase-domena.cz";
    const command = `curl -X GET "${domain}/api/cron/generate-retainers?secret=technologio-cron-secret"`;
    navigator.clipboard.writeText(command);
    setCopiedCron(true);
    toast.success("Cron curl příkaz zkopírován do schránky!");
    setTimeout(() => setCopiedCron(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Automatizace měsíčních paušálů
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pravidelný měsíční příjem (MRR) a hromadné vystavování paušálních faktur jedním klikem
          </p>
        </div>

        <Button
          onClick={handleGenerateNow}
          disabled={pendingCount === 0 || isGenerating}
          isLoading={isGenerating}
          size="lg"
          className="shrink-0 shadow-lg shadow-indigo-600/25"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Vygenerovat faktury na tento měsíc ({pendingCount})
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Měsíční paušální příjem (MRR)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {formatCurrency(totalMrr)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Z {retainerClients.length} aktivních klientských paušálů
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Stav za {currentMonthName}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {generatedCount} z {retainerClients.length} vystaveno
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {pendingCount === 0 ? "Vše vystaveno na 100 %" : `Zbývá vygenerovat: ${pendingCount}`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Průměrný paušál na klienta
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {formatCurrency(avgRetainer)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Průměrná hodnota smlouvy
          </p>
        </div>
      </div>

      {/* Retainers Clients Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Klienti s aktivním paušálem
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Aktuální období: <strong>{currentMonthName} ({currentPeriod})</strong>
          </span>
        </div>

        {retainerClients.length === 0 ? (
          <div className="text-center py-12 p-8">
            <Repeat className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Žádný klient zatím nemá nastaven paušál
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              V sekci Klienti (CRM) upravte klienta a aktivujte přepínač "Aktivní měsíční paušál", nebo přidejte nového klienta.
            </p>
            <Link href="/clients" className="inline-block mt-4">
              <Button size="sm">Přejít na Klienty</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Klient</th>
                  <th scope="col" className="px-5 py-3.5">Částka paušálu</th>
                  <th scope="col" className="px-5 py-3.5">Den vystavení</th>
                  <th scope="col" className="px-5 py-3.5">Popis na faktuře</th>
                  <th scope="col" className="px-5 py-3.5">Stav za {currentMonthName}</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {clientStatusList.map(({ client, isGenerated, invoice }) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {client.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {client.email}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(client.retainer_amount)}
                      <span className="text-xs text-slate-400 font-normal"> / měsíc</span>
                    </td>

                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Každého {client.retainer_billing_day}. dne</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {client.retainer_description}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {isGenerated ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Vygenerováno
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          Čeká na vygenerování
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {invoice && (
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                            title={`Zobrazit fakturu ${invoice.invoice_number}`}
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Upravit paušál"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeactivate(client.id, client.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                          title="Zrušit měsíční paušál (klient zůstane v CRM)"
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Smazat klienta i paušál"
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

      {/* Automated Cron Information Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">
                Automatický denní CRON endpoint
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pro bezobslužné generování faktur každý den o půlnoci
              </p>
            </div>
          </div>

          <button
            onClick={copyCronCommand}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copiedCron ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zkopírováno</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopírovat CURL</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Endpoint <code>/api/cron/generate-retainers</code> automaticky zkontroluje dnešní den v měsíci a vytvoří faktury těm klientům, kteří mají právě dnes nastavený den vystavení. Pokud už klient za daný měsíc fakturu má, duplikaci bezpečně přeskočí.
        </p>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-xs text-indigo-300 overflow-x-auto">
          GET /api/cron/generate-retainers?secret=technologio-cron-secret
        </div>
      </div>

      {/* Edit modal */}
      <ClientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        client={selectedClient}
        onSaved={handleSavedClient}
      />
    </div>
  );
}
