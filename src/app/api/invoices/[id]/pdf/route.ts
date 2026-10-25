import { NextRequest, NextResponse } from "next/server";
import { getInvoice } from "@/lib/data-store";
import { generateInvoicePdfBuffer } from "@/lib/pdf/generate-invoice-pdf";

export const dynamic = "force-dynamic";

export async function GET(
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

    const pdfBuffer = await generateInvoicePdfBuffer(invoice);

    const safeFilename = `Faktura-${invoice.invoice_number}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chyba při generování PDF";
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
