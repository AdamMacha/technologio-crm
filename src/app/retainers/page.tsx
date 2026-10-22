import { getClients, getInvoices } from "@/lib/data-store";
import { RetainerManager } from "@/components/retainers/RetainerManager";

export const metadata = {
  title: "Paušály – Technologio",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RetainersPage() {
  const [clients, invoices] = await Promise.all([
    getClients(),
    getInvoices(),
  ]);

  return <RetainerManager initialClients={clients} initialInvoices={invoices} />;
}
