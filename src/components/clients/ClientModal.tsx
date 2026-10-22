"use client";

import { useState, useEffect } from "react";
import { Client } from "@/types";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input, Label, Textarea } from "@/ui/input";
import { Search, Loader2, Sparkles, Repeat } from "lucide-react";
import { toast } from "sonner";

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSaved: (client: Client) => void;
}

export function ClientModal({
  open,
  onOpenChange,
  client,
  onSaved,
}: ClientModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: "",
    ico: "",
    dic: "",
    is_vat_payer: false,
    street: "",
    city: "",
    zip: "",
    country: "Česká republika",
    email: "",
    phone: "",
    note: "",
    has_retainer: false,
    retainer_amount: 10000,
    retainer_description: "Měsíční správa webu, hosting a podpora",
    retainer_billing_day: 1,
  });

  const [isLoadingAres, setIsLoadingAres] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: "",
        ico: "",
        dic: "",
        is_vat_payer: false,
        street: "",
        city: "",
        zip: "",
        country: "Česká republika",
        email: "",
        phone: "",
        note: "",
        has_retainer: false,
        retainer_amount: 10000,
        retainer_description: "Měsíční správa webu, hosting a podpora",
        retainer_billing_day: 1,
      });
    }
  }, [client, open]);

  const handleAresLookup = async () => {
    if (!formData.ico || formData.ico.trim().length !== 8) {
      toast.error("Zadejte platné 8místné IČO");
      return;
    }

    setIsLoadingAres(true);
    try {
      const res = await fetch(`/api/ares?ico=${formData.ico.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Subjekt nebyl v ARES nalezen");
      }

      setFormData((prev) => ({
        ...prev,
        name: data.obchodniJmeno || prev.name,
        dic: data.dic || prev.dic,
        street: data.ulice || prev.street,
        city: data.mesto || prev.city,
        zip: data.psc || prev.zip,
        is_vat_payer: data.platceDph ?? prev.is_vat_payer,
      }));

      toast.success("Údaje z ARES byly úspěšně načteny!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Chyba při dotazu na ARES";
      toast.error(msg);
    } finally {
      setIsLoadingAres(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Vyplňte prosím název firmy / jméno a e-mail");
      return;
    }

    setIsSaving(true);
    try {
      const { saveClient } = await import("@/lib/data-store");
      const saved = await saveClient(formData);
      toast.success(client ? "Klient byl upraven" : "Nový klient byl přidán");
      onSaved(saved);
      onOpenChange(false);
    } catch (error) {
      toast.error("Chyba při ukládání klienta");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>{client ? "Upravit klienta" : "Přidat nového klienta"}</DialogTitle>
          <DialogDescription>
            Zadejte IČO pro bleskové načtení dat z českého registru ARES nebo vyplňte ručně.
          </DialogDescription>
        </DialogHeader>

        {/* IČO + ARES button */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
          <Label htmlFor="ico">IČO firmy (ARES načítání)</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="ico"
              placeholder="např. 28471923"
              value={formData.ico || ""}
              onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
              maxLength={8}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAresLookup}
              isLoading={isLoadingAres}
              className="shrink-0"
            >
              {!isLoadingAres && <Sparkles className="w-3.5 h-3.5 text-indigo-500 mr-1" />}
              ARES
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label htmlFor="name" required>
              Název firmy / Jméno
            </Label>
            <Input
              id="name"
              required
              placeholder="např. Vinařství Na Kopci s.r.o."
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="dic">DIČ</Label>
            <Input
              id="dic"
              placeholder="např. CZ28471923"
              value={formData.dic || ""}
              onChange={(e) => setFormData({ ...formData, dic: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" required>
              Fakturační e-mail
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="fakturace@klient.cz"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              placeholder="+420 777 000 000"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="street">Ulice a číslo</Label>
            <Input
              id="street"
              placeholder="Vinařská 124"
              value={formData.street || ""}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="city">Město</Label>
            <Input
              id="city"
              placeholder="Mikulov"
              value={formData.city || ""}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="zip">PSČ</Label>
            <Input
              id="zip"
              placeholder="692 01"
              value={formData.zip || ""}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Retainer Settings Box */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Pravidelný měsíční paušál
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.has_retainer || false}
                onChange={(e) =>
                  setFormData({ ...formData, has_retainer: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {formData.has_retainer && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 animate-in fade-in">
              <div>
                <Label htmlFor="retainer_amount">Měsíční částka (CZK)</Label>
                <Input
                  id="retainer_amount"
                  type="number"
                  placeholder="10000"
                  value={formData.retainer_amount || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, retainer_amount: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="retainer_billing_day">Den v měsíci pro vystavení</Label>
                <Input
                  id="retainer_billing_day"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="1"
                  value={formData.retainer_billing_day || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retainer_billing_day: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="retainer_description">Popis položky na faktuře</Label>
                <Input
                  id="retainer_description"
                  placeholder="např. Měsíční správa webu, hosting a podpora"
                  value={formData.retainer_description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, retainer_description: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Note */}
        <div>
          <Label htmlFor="note">Interní poznámka</Label>
          <Textarea
            id="note"
            rows={2}
            placeholder="Specifika spolupráce, přístupy, dohodnuté podmínky..."
            value={formData.note || ""}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="mt-1"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Zrušit
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {client ? "Uložit změny" : "Vytvořit klienta"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
