"use client";

import { useEffect, useState } from "react";
import { Menu, Moon, Sun, Database } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/data-store";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [supabaseActive, setSupabaseActive] = useState<boolean>(false);

  useEffect(() => {
    // Check initial dark mode
    const isDarkMode =
      localStorage.getItem("technologio_theme") === "dark" ||
      (!localStorage.getItem("technologio_theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }

    setSupabaseActive(isSupabaseConfigured());
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("technologio_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("technologio_theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Otevřít menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
            Fakturační systém
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Supabase status indicator */}
        <div
          title={
            supabaseActive
              ? "Připojeno k Supabase PostgreSQL"
              : "Běží v offline / lokálním režimu"
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            supabaseActive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {supabaseActive ? "Supabase Live" : "Offline / Demo DB"}
          </span>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Přepnout motiv vzhledu"
          title={isDark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
}
