import { getInvoices } from "@/lib/data-store";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";

export const metadata = {
  title: "Faktury – Technologio",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return <InvoiceTable initialInvoices={invoices} />;
}
