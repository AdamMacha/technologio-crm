"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input, Label } from "@/ui/input";
import { Percent, Tag, Sparkles, Check } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { InvoiceItem } from "@/types";

interface DiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSubtotal: number;
  isVatPayer: boolean;
  onAddDiscount: (item: InvoiceItem) => void;
}

export function DiscountModal({
  open,
  onOpenChange,
  currentSubtotal,
  isVatPayer,
  onAddDiscount,
}: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [percentage, setPercentage] = useState<number>(10);
  const [fixedAmount, setFixedAmount] = useState<number>(1000);
  const [customDescription, setCustomDescription] = useState<string>("");

  // Re-sync default values when modal opens
  useEffect(() => {
    if (open) {
      if (currentSubtotal > 0 && fixedAmount > currentSubtotal) {
        setFixedAmount(Math.min(1000, currentSubtotal));
      }
    }
  }, [open, currentSubtotal, fixedAmount]);

  const calculatedDiscount = Math.round(
    discountType === "percentage"
      ? (currentSubtotal * Math.max(0, percentage)) / 100
      : Math.max(0, fixedAmount)
  );

  const defaultDescription =
    discountType === "percentage"
      ? `Sleva ${percentage} %`
      : `Sleva ${formatCurrency(fixedAmount)}`;

  const finalDescription = customDescription.trim() || defaultDescription;
  const newTotal = Math.max(0, currentSubtotal - calculatedDiscount);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedDiscount <= 0) return;

    const discountItem: InvoiceItem = {
      description: finalDescription,
      quantity: 1,
      unit: discountType === "percentage" ? "%" : "sleva",
      unit_price: -calculatedDiscount,
      vat_rate: isVatPayer ? 21 : 0,
      total_price: -calculatedDiscount,
    };

    onAddDiscount(discountItem);
    onOpenChange(false);
  };

  const percentagePresets = [5, 10, 15, 20, 25, 50];
  const fixedPresets = [500, 1000, 2000, 5000, 10000];
  const descriptionPresets = [
    "Věrnostní sleva",
    "Sleva pro stálého klienta",
    "Akční sleva",
    "Množstevní sleva",
    "Sleva na první projekt",
    "Sleva za včasné sjednání",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Přidat slevu na fakturu
        </DialogTitle>
        <DialogDescription>
          Nastavte procentuální nebo pevnou částku slevy. Sleva se vloží jako odečtová položka faktury.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleApply} className="space-y-5">
        {/* Typ slevy: Přepínač Procentuální vs Pevná částka */}
        <div>
          <Label className="mb-1.5 block">Typ slevy</Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setDiscountType("percentage")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                discountType === "percentage"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              Procentuální (%)
            </button>
            <button
              type="button"
              onClick={() => setDiscountType("fixed")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                discountType === "fixed"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Pevná částka (Kč)
            </button>
          </div>
        </div>

        {/* Vstup hodnoty */}
        {discountType === "percentage" ? (
          <div className="space-y-2">
            <Label htmlFor="discPercent">Výše slevy v procentech (%)</Label>
            <div className="relative">
              <Input
                id="discPercent"
                type="number"
                min="0.5"
                max="100"
                step="any"
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                className="pr-10 text-base font-semibold"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold">%</span>
            </div>
            {/* Rychlé předvolby % */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {percentagePresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPercentage(p)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    percentage === p
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {p} %
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="discFixed">Částka slevy (Kč)</Label>
            <div className="relative">
              <Input
                id="discFixed"
                type="number"
                min="1"
                step="any"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
                className="pr-12 text-base font-semibold"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold">Kč</span>
            </div>
            {/* Rychlé předvolby částky */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {fixedPresets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFixedAmount(amt)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    fixedAmount === amt
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popis slevy */}
        <div className="space-y-2">
          <Label htmlFor="discDesc">Popis položky na faktuře</Label>
          <Input
            id="discDesc"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder={defaultDescription}
          />
          {/* Rychlé návrhy popisků */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {descriptionPresets.map((desc) => (
              <button
                key={desc}
                type="button"
                onClick={() => setCustomDescription(desc)}
                className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
              >
                {desc}
              </button>
            ))}
          </div>
        </div>

        {/* Náhled finančního dopadu */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Základ před slevou:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(currentSubtotal)}
            </span>
          </div>
          <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
            <span>Uplatněná sleva:</span>
            <span>– {formatCurrency(calculatedDiscount)}</span>
          </div>
          <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 flex justify-between text-slate-900 dark:text-white font-bold text-sm">
            <span>Nová částka k úhradě:</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {formatCurrency(newTotal)}
            </span>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Zrušit
          </Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={calculatedDiscount <= 0}
          >
            <Check className="w-4 h-4 mr-1.5" />
            Vložit slevu (– {formatCurrency(calculatedDiscount)})
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
