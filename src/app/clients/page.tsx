import { getClients } from "@/lib/data-store";
import { ClientList } from "@/components/clients/ClientList";

export const metadata = {
  title: "Klienti (CRM) – Technologio",
};

export default async function ClientsPage() {
  const clients = await getClients();

  return <ClientList initialClients={clients} />;
}
