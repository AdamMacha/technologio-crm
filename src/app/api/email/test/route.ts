import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail, isResendConfigured, getSenderEmail } from "@/lib/email/invoice-email";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    configured: isResendConfigured(),
    senderEmail: getSenderEmail(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Zadejte platnou e-mailovou adresu" },
        { status: 400 }
      );
    }

    const result = await sendTestEmail(email.trim());

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Odeslání testovacího e-mailu selhalo" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Testovací e-mail byl úspěšně odeslán na ${email}`,
      id: result.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chyba při odesílání testovacího e-mailu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
