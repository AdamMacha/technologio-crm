import { NextRequest, NextResponse } from "next/server";
import { generateRetainersForPeriod } from "@/lib/data-store";
import { getCurrentPeriod } from "@/lib/formatters";
import { sendInvoiceEmail, isResendConfigured } from "@/lib/email/invoice-email";

export const dynamic = "force-dynamic";

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
  const sendEmail = searchParams.get("sendEmail") !== "false";

  try {
    const result = await generateRetainersForPeriod(period, dayOfMonth);

    const emailResults: Array<{
      invoiceNumber: string;
      client: string;
      email: string;
      success: boolean;
      error?: string;
    }> = [];

    let emailsSent = 0;

    if (sendEmail && isResendConfigured() && result.generatedInvoices.length > 0) {
      for (const inv of result.generatedInvoices) {
        if (inv.client_email && inv.client_email.includes("@")) {
          const emailRes = await sendInvoiceEmail({
            invoice: inv,
            recipientEmail: inv.client_email,
          });

          emailResults.push({
            invoiceNumber: inv.invoice_number,
            client: inv.client_name,
            email: inv.client_email,
            success: emailRes.success,
            error: emailRes.error,
          });

          if (emailRes.success) {
            emailsSent++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      period,
      dayOfMonth,
      generatedCount: result.count,
      totalAmount: result.total,
      emailsSent,
      emailResults,
      resendConfigured: isResendConfigured(),
      invoices: result.generatedInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        client: inv.client_name,
        amount: inv.total_amount,
        email: inv.client_email,
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
