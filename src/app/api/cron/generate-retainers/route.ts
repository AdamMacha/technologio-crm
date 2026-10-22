import { NextRequest, NextResponse } from "next/server";
import { generateRetainersForPeriod } from "@/lib/data-store";
import { getCurrentPeriod } from "@/lib/formatters";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const authHeader = request.headers.get("authorization");

  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    const isAuthorized =
      secret === expectedSecret ||
      authHeader === `Bearer ${expectedSecret}`;
    if (!isAuthorized) {
      return NextResponse.json({ error: "Neautorizovaný přístup" }, { status: 401 });
    }
  }

  const today = new Date();
  const dayOfMonth = searchParams.has("day")
    ? parseInt(searchParams.get("day")!, 10)
    : today.getDate();

  const period = searchParams.get("period") || getCurrentPeriod(today);

  try {
    const result = await generateRetainersForPeriod(period, dayOfMonth);

    return NextResponse.json({
      success: true,
      period,
      dayOfMonth,
      generatedCount: result.count,
      totalAmount: result.total,
      invoices: result.generatedInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        client: inv.client_name,
        amount: inv.total_amount,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chyba při generování paušálů";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
