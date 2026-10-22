"use client";

import { useState, useEffect } from "react";
import { Client } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FilePlus,
  Edit2,
  Trash2,
  Repeat,
} from "lucide-react";
import Link from "next/link";
import { ClientModal } from "./ClientModal";
import { toast } from "sonner";
import { deleteClient } from "@/lib/data-store";

interface ClientListProps {
  initialClients: Client[];
}

export function ClientList({ initialClients }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [filterRetainer, setFilterRetainer] = useState<"all" | "retainer" | "onetime">("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.ico && client.ico.includes(search)) ||
      client.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRetainer === "retainer") return client.has_retainer;
    if (filterRetainer === "onetime") return !client.has_retainer;
    return true;
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Opravdu chcete smazat klienta ${name}?`)) {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Klient byl smazán");
    }
  };

  const handleSaved = (savedClient: Client) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === savedClient.id);
      if (exists) {
        return prev.map((c) => (c.id === savedClient.id ? savedClient : c));
      }
      return [savedClient, ...prev];
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Správa klientů (CRM)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Evidence odběratelů, firemních údajů a konfigurace měsíčních paušálů
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Přidat klienta
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Hledat podle názvu, IČO nebo e-mailu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-800/50 border-0"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setFilterRetainer("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterRetainer === "all"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Všichni ({clients.length})
          </button>
          <button
            onClick={() => setFilterRetainer("retainer")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterRetainer === "retainer"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            S paušálem ({clients.filter((c) => c.has_retainer).length})
          </button>
          <button
            onClick={() => setFilterRetainer("onetime")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterRetainer === "onetime"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Bez paušálu ({clients.filter((c) => !c.has_retainer).length})
          </button>
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Žádní klienti nenalezeni
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Zkuste upravit vyhledávací dotaz nebo přidejte nového klienta.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-200 flex flex-col justify-between p-5 group"
            >
              <div>
                {/* Header: Name and Retainer Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      {client.ico && <span>IČO: {client.ico}</span>}
                      {client.dic && <span>• DIČ: {client.dic}</span>}
                    </div>
                  </div>

                  {client.has_retainer ? (
                    <Badge variant="default" className="shrink-0 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                      <Repeat className="w-3 h-3 mr-1" />
                      {formatCurrency(client.retainer_amount)}/m
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 text-slate-400">
                      Jednorázově
                    </Badge>
                  )}
                </div>

                {/* Contact & Address Details */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>

                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}

                  {(client.street || client.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {[client.street, client.zip, client.city].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  {client.has_retainer && (
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium pt-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Vystavení: {client.retainer_billing_day}. den v měsíci</span>
                    </div>
                  )}
                </div>

                {client.note && (
                  <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{client.note}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/invoices/new?clientId=${client.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  Vystavit fakturu
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Upravit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id, client.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Smazat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ClientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        client={selectedClient}
        onSaved={handleSaved}
      />
    </div>
  );
}
