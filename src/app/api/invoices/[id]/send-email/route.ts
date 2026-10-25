import { NextRequest, NextResponse } from "next/server";
import { getInvoice } from "@/lib/data-store";
import { sendInvoiceEmail } from "@/lib/email/invoice-email";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getInvoice(id);

    if (!invoice) {
      return NextResponse.json(
        { error: `Faktura s ID ${id} nebyla nalezena` },
        { status: 404 }
      );
    }

    let body: {
      recipientEmail?: string;
      subject?: string;
      customMessage?: string;
    } = {};

    try {
      body = await request.json();
    } catch {
      // Empty body is allowed, will use default client email and subject
    }

    const result = await sendInvoiceEmail({
      invoice,
      recipientEmail: body.recipientEmail,
      subject: body.subject,
      customMessage: body.customMessage,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Odeslání e-mailu se nezdařilo" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Faktura č. ${invoice.invoice_number} byla úspěšně odeslána na ${result.recipient}`,
      emailId: result.id,
      recipient: result.recipient,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chyba při odesílání e-mailu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
