import { NextRequest, NextResponse } from "next/server";
import { generateRetainersForPeriod } from "@/lib/data-store";
import { getCurrentPeriod } from "@/lib/formatters";
import { sendInvoiceEmail, isResendConfigured } from "@/lib/email/invoice-email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let body: { period?: string; dayOfMonth?: number; sendEmail?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is allowed
    }

    const today = new Date();
    const period = body.period || getCurrentPeriod(today);
    const dayOfMonth = body.dayOfMonth;
    const sendEmail = body.sendEmail !== false; // Default to true

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
    const message =
      error instanceof Error ? error.message : "Chyba při generování paušálů";
    console.error("Retainer generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
