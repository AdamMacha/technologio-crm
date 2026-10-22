import { getInvoice } from "@/lib/data-store";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  return <InvoiceDocument initialInvoice={invoice} />;
}
