import { Suspense } from "react";
import { getClients, getSettings } from "@/lib/data-store";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export const metadata = {
  title: "Nová faktura – Technologio",
};

export default async function NewInvoicePage() {
  const [clients, settings] = await Promise.all([
    getClients(),
    getSettings(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Načítám formulář faktury...</div>}>
      <InvoiceForm clients={clients} settings={settings} />
    </Suspense>
  );
}
