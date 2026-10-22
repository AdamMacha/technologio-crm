"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "@/types";
import { Button } from "@/ui/button";
import { Input, Label, Textarea } from "@/ui/input";
import {
  Building,
  CreditCard,
  Database,
  Save,
  Check,
  Copy,
  Sliders,
  ExternalLink,
  Sparkles,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { saveSettings, isSupabaseConfigured, seedDemoData, clearAllData } from "@/lib/data-store";
import { toast } from "sonner";

interface SettingsFormProps {
  initialSettings: Settings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const isSupabase = isSupabaseConfigured();

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await saveSettings(settings);
      setSettings(updated);
      toast.success("Nastavení studia Technologio bylo uloženo");
      router.refresh();
    } catch {
      toast.error("Chyba při ukládání nastavení");
    } finally {
      setIsSaving(false);
    }
  };

  const copySqlMigration = () => {
    const sqlPath = "supabase/migrations/20261022000000_init_schema.sql";
    navigator.clipboard.writeText(`-- Najdete v projektu v souboru: ${sqlPath}`);
    setCopiedSql(true);
    toast.success(`Cesta k SQL migraci zkopírována (${sqlPath})`);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Nastavení studia
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fakturační údaje studia Technologio, bankovní spojení a konfigurace Supabase
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supabase Connection Status Card */}
        <div className={`p-6 rounded-2xl border shadow-xs ${
          isSupabase
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
            : "bg-slate-900 text-white border-slate-800"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSupabase
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-indigo-500/20 text-indigo-400"
              }`}>
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {isSupabase ? "Supabase PostgreSQL je aktivní" : "Připojení k Supabase"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isSupabase
                    ? "Všechna data se ukládají přímo do vaší Supabase databáze."
                    : "Aplikace nyní běží v offline / demo režimu (lokální úložiště). Pro propojení se Supabase zadejte klíče do .env.local."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={copySqlMigration}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zkopírováno</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopírovat SQL schéma</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Správa dat v databázi */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-500" />
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                Správa dat databáze
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Vzorová data a reset
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Můžete nahrát vzorové klienty a faktury pro vyzkoušení, nebo celou databázi vymazat pro čistý start.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={async () => {
                  if (confirm("Nahrát do databáze vzorové klienty a faktury?")) {
                    await seedDemoData();
                    toast.success("Vzorová data byla úspěšně nahrána!");
                    window.location.reload();
                  }
                }}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                Nahrát vzorová data
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (confirm("OPRAVDU chcete smazat VŠECHNY faktury i klienty z databáze?\nTuto akci nelze vzít zpět.")) {
                    await clearAllData();
                    toast.success("Všechna data byla vymazána!");
                    window.location.reload();
                  }
                }}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Vymazat všechna data
              </Button>
            </div>
          </div>
        </div>

        {/* Studio Billing Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
              Fakturační údaje dodavatele (Technologio)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="cName" required>Název studia / společnosti</Label>
              <Input
                id="cName"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="ico" required>IČO</Label>
              <Input
                id="ico"
                value={settings.ico}
                onChange={(e) => setSettings({ ...settings, ico: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dic">DIČ</Label>
              <Input
                id="dic"
                value={settings.dic || ""}
                onChange={(e) => setSettings({ ...settings, dic: e.target.value })}
                placeholder="CZ12345678"
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isVat"
                checked={settings.is_vat_payer}
                onChange={(e) => setSettings({ ...settings, is_vat_payer: e.target.checked })}
                className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isVat" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Jsme plátci DPH (21 %)
              </label>
            </div>

            <div>
              <Label htmlFor="street" required>Ulice a číslo</Label>
              <Input
                id="street"
                value={settings.street}
                onChange={(e) => setSettings({ ...settings, street: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city" required>Město</Label>
              <Input
                id="city"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="zip" required>PSČ</Label>
              <Input
                id="zip"
                value={settings.zip}
                onChange={(e) => setSettings({ ...settings, zip: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country" required>Země</Label>
              <Input
                id="country"
                value={settings.country}
                onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Fakturační e-mail</Label>
              <Input
                id="email"
                type="email"
                value={settings.email || ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={settings.phone || ""}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Bank details & Defaults */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
              Bankovní spojení & QR Platba (SPAYD)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="acc" required>Číslo účtu / kód banky</Label>
              <Input
                id="acc"
                value={settings.bank_account}
                onChange={(e) => setSettings({ ...settings, bank_account: e.target.value })}
                placeholder="2101234567/2010"
                required
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={settings.iban || ""}
                onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                placeholder="CZ5820100000002101234567"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="swift">SWIFT / BIC</Label>
              <Input
                id="swift"
                value={settings.swift || ""}
                onChange={(e) => setSettings({ ...settings, swift: e.target.value })}
                placeholder="FIOBCZPPXXX"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="dueDays" required>Výchozí splatnost (dny)</Label>
              <Input
                id="dueDays"
                type="number"
                min={1}
                max={90}
                value={settings.default_due_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_due_days: parseInt(e.target.value, 10) || 14,
                  })
                }
                required
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="note">Výchozí text / poznámka na faktuře</Label>
              <Input
                id="note"
                value={settings.invoice_note || ""}
                onChange={(e) => setSettings({ ...settings, invoice_note: e.target.value })}
                placeholder="Děkujeme za spolupráci..."
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" isLoading={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Uložit nastavení
          </Button>
        </div>
      </form>
    </div>
  );
}
