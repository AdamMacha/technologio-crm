import { getInvoices } from "@/lib/data-store";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";

export const metadata = {
  title: "Faktury – Technologio",
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return <InvoiceTable initialInvoices={invoices} />;
}
