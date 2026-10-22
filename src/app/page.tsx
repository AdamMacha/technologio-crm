import { getDashboardStats, getInvoices } from "@/lib/data-store";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export const metadata = {
  title: "Přehled (Dashboard) – Technologio",
};

export default async function HomePage() {
  const [stats, invoices] = await Promise.all([
    getDashboardStats(),
    getInvoices(),
  ]);

  return <DashboardOverview stats={stats} recentInvoices={invoices} />;
}
