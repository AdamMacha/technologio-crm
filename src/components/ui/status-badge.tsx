"use client";

import { useState } from "react";
import { InvoiceStatus } from "@/types";
import { getStatusDetails } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Clock, AlertCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface StatusBadgeProps {
  status: InvoiceStatus;
  invoiceId?: string;
  onStatusChange?: (newStatus: InvoiceStatus) => void;
  interactive?: boolean;
}

export function StatusBadge({
  status,
  onStatusChange,
  interactive = false,
}: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const details = getStatusDetails(status);

  const statuses: { id: InvoiceStatus; label: string; icon: typeof Check }[] = [
    { id: "pending", label: "Čeká na platbu", icon: Clock },
    { id: "paid", label: "Zaplaceno", icon: Check },
    { id: "overdue", label: "Po splatnosti", icon: AlertCircle },
    { id: "cancelled", label: "Stornováno", icon: XCircle },
  ];

  const handleSelect = (newStatus: InvoiceStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (newStatus !== status && onStatusChange) {
      if (newStatus === "paid") {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      }
      onStatusChange(newStatus);
    }
  };

  if (!interactive) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
          details.bgColor
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", details.badgeColor)} />
        {details.label}
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 hover:opacity-90 active:scale-95 cursor-pointer",
          details.bgColor
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", details.badgeColor)} />
        <span>{details.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-40 py-1 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700/60 mb-1">
              Změnit stav faktury
            </div>
            {statuses.map((item) => {
              const Icon = item.icon;
              const isSelected = item.id === status;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleSelect(item.id, e)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between transition-colors",
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-700/60 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
