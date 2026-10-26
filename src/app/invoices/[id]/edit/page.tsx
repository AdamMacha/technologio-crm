import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getInvoice, getClients, getSettings } from "@/lib/data-store";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) return { title: "Faktura nenalezena – Technologio" };

  return {
    title: `Upravit fakturu ${invoice.invoice_number} – Technologio`,
  };
}

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, clients, settings] = await Promise.all([
    getInvoice(id),
    getClients(),
    getSettings(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Načítám formulář faktury...
        </div>
      }
    >
      <InvoiceForm
        clients={clients}
        settings={settings}
        initialInvoice={invoice}
      />
    </Suspense>
  );
}
