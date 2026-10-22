"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Zadejte přístupové heslo");
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setHasError(true);
        toast.error(data.error || "Nesprávné heslo");
        setIsLoading(false);
        return;
      }

      toast.success("Vítejte v systému Technologio!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Chyba při přihlašování");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-1">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white">
                Technologio
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Studio
              </span>
            </div>

            <h1 className="text-lg font-semibold text-slate-200">
              Chráněný interní systém
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Pro přístup k fakturaci, CRM a správě měsíčních paušálů zadejte přístupové heslo studia.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (hasError) setHasError(false);
                  }}
                  placeholder="Zadejte heslo..."
                  autoFocus
                  required
                  className={`w-full pl-10 pr-11 py-3 text-sm bg-slate-950/80 border rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                    hasError
                      ? "border-rose-500/70 focus:ring-rose-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {hasError && (
                <p className="text-xs text-rose-400 mt-1.5 pl-1">
                  Nesprávné přístupové heslo studia
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Vstoupit do aplikace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer badge */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zabezpečené relace (30 dní)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
