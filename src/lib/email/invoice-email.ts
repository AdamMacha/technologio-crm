import { Resend } from "resend";
import { InvoiceWithItems } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { generateInvoicePdfBuffer } from "@/lib/pdf/generate-invoice-pdf";
import { generateQrPaymentDataUrl } from "@/lib/spayd";

export const DEFAULT_FROM_EMAIL = "Technologio Fakturace <faktury@technologio.eu>";
export const DEFAULT_REPLY_TO = "faktury@technologio.eu";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "");
}

export function getSenderEmail(): string {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
}

export function buildInvoiceEmailHtml(params: {
  invoice: InvoiceWithItems;
  customMessage?: string;
  qrCodeDataUrl?: string;
}): string {
  const { invoice, customMessage, qrCodeDataUrl } = params;

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faktura č. ${invoice.invoice_number}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 24px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      padding: 32px;
      color: #ffffff;
    }
    .header-logo {
      display: inline-block;
      width: 36px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-weight: 700;
      font-size: 18px;
      margin-bottom: 12px;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #e0e7ff;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 16px;
      line-height: 1.6;
      margin-top: 0;
      margin-bottom: 20px;
      color: #0f172a;
    }
    .custom-message {
      background-color: #f1f5f9;
      border-left: 4px solid #4f46e5;
      padding: 12px 16px;
      margin-bottom: 24px;
      border-radius: 0 8px 8px 0;
      font-size: 14px;
      color: #334155;
      line-height: 1.5;
    }
    .payment-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .payment-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .payment-grid {
      width: 100%;
      border-collapse: collapse;
    }
    .payment-grid td {
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
    }
    .payment-grid td:last-child {
      text-align: right;
      font-weight: 600;
      color: #0f172a;
    }
    .payment-grid tr:last-child td {
      border-bottom: none;
    }
    .amount-highlight {
      font-size: 20px !important;
      color: #4f46e5 !important;
      font-weight: 700 !important;
    }
    .qr-container {
      margin: 24px 0;
      padding: 20px;
      background-color: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 12px;
      text-align: center;
    }
    .qr-container img {
      width: 160px;
      height: 160px;
      border-radius: 8px;
      border: 1px solid #d8b4fe;
      background-color: #ffffff;
      padding: 6px;
      display: inline-block;
    }
    .qr-caption {
      margin-top: 10px;
      font-size: 12px;
      color: #6b21a8;
      font-weight: 500;
    }
    .attachment-notice {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 13px;
      color: #1e40af;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 20px 0;
    }
    .footer {
      padding: 24px 32px;
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">T</div>
      <h1>Technologio</h1>
      <p>Faktura – Daňový doklad č. ${invoice.invoice_number}</p>
    </div>

    <div class="content">
      <p class="greeting">
        Dobrý den,
        <br><br>
        v příloze tohoto e-mailu Vám zasíláme fakturu č. <strong>${invoice.invoice_number}</strong>
        ${invoice.is_retainer ? "za pravidelnou měsíční správu a servis" : "za poskytnuté služby"}
        ve výši <strong>${formatCurrency(invoice.total_amount)}</strong> se splatností do <strong>${formatDate(invoice.due_date)}</strong>.
      </p>

      ${customMessage ? `<div class="custom-message">${customMessage.replace(/\n/g, "<br>")}</div>` : ""}

      <div class="payment-card">
        <div class="payment-title">Platební údaje</div>
        <table class="payment-grid">
          <tr>
            <td style="color: #64748b;">Částka k úhradě:</td>
            <td class="amount-highlight">${formatCurrency(invoice.total_amount)}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Číslo účtu:</td>
            <td>${invoice.supplier_bank_account}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Variabilní symbol:</td>
            <td>${invoice.variable_symbol}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Datum splatnosti:</td>
            <td style="color: #dc2626;">${formatDate(invoice.due_date)}</td>
          </tr>
          ${invoice.supplier_iban ? `
          <tr>
            <td style="color: #64748b;">IBAN:</td>
            <td style="font-family: monospace; font-size: 12px;">${invoice.supplier_iban}</td>
          </tr>` : ""}
        </table>
      </div>

      ${qrCodeDataUrl ? `
      <div class="qr-container">
        <img src="${qrCodeDataUrl}" alt="QR Platba">
        <div class="qr-caption">
          Naskenujte v mobilním bankovnictví pro bleskovou platbu (QR Platba)
        </div>
      </div>` : ""}

      <div class="attachment-notice">
        📎 <strong>Příloha:</strong> Originál faktury v PDF formátu (<strong>Faktura-${invoice.invoice_number}.pdf</strong>) naleznete v příloze tohoto e-mailu.
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 24px;">
        V případě jakýchkoliv dotazů k faktuře nebo provedeným pracím nás neváhejte kontaktovat odpovědí na tento e-mail.
        <br><br>
        S pozdravem,<br>
        <strong>Adam Mácha</strong><br>
        Technologio – Webové studio & Digitální řešení
      </p>
    </div>

    <div class="footer">
      <strong>Technologio</strong> • Webové studio & Digitální řešení<br>
      E-mail: <a href="mailto:faktury@technologio.eu">faktury@technologio.eu</a> • Web: <a href="https://technologio.cz">technologio.cz</a><br>
      IČO: ${invoice.supplier_ico}${invoice.supplier_dic ? ` • DIČ: ${invoice.supplier_dic}` : ""}
    </div>
  </div>
</body>
</html>`;
}

export interface SendInvoiceEmailParams {
  invoice: InvoiceWithItems;
  recipientEmail?: string;
  subject?: string;
  customMessage?: string;
}

export interface SendInvoiceEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  recipient?: string;
}

export async function sendInvoiceEmail({
  invoice,
  recipientEmail,
  subject,
  customMessage,
}: SendInvoiceEmailParams): Promise<SendInvoiceEmailResult> {
  const targetEmail = (recipientEmail || invoice.client_email || "").trim();

  if (!targetEmail) {
    return {
      success: false,
      error: `Faktura ${invoice.invoice_number}: Klient nemá zadán žádný e-mail.`,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return {
      success: false,
      error: "Není nastaven API klíč RESEND_API_KEY v souboru .env.local nebo na Vercelu.",
      recipient: targetEmail,
    };
  }

  try {
    const resend = new Resend(apiKey.trim());

    // 1. Vygenerovat PDF faktury
    const pdfBuffer = await generateInvoicePdfBuffer(invoice);

    // 2. Vygenerovat QR kód pro tělo e-mailu
    let qrDataUrl = "";
    try {
      qrDataUrl = await generateQrPaymentDataUrl({
        ibanOrAccount: invoice.supplier_iban || invoice.supplier_bank_account,
        amount: invoice.total_amount,
        vs: invoice.variable_symbol,
        message: `Faktura ${invoice.invoice_number}`,
      });
    } catch (e) {
      console.warn("Could not generate QR code for email body:", e);
    }

    // 3. Vytvořit HTML
    const emailHtml = buildInvoiceEmailHtml({
      invoice,
      customMessage,
      qrCodeDataUrl: qrDataUrl,
    });

    const emailSubject =
      subject ||
      `Faktura č. ${invoice.invoice_number} – Technologio (${formatCurrency(invoice.total_amount)})`;

    const fromAddress = getSenderEmail();

    // 4. Odeslat přes Resend
    const response = await resend.emails.send({
      from: fromAddress,
      to: [targetEmail],
      replyTo: DEFAULT_REPLY_TO,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: `Faktura-${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (response.error) {
      console.error("Resend API error:", response.error);
      return {
        success: false,
        error: response.error.message || "Chyba při odesílání e-mailu přes Resend",
        recipient: targetEmail,
      };
    }

    return {
      success: true,
      id: response.data?.id,
      recipient: targetEmail,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Neznámá chyba při odesílání e-mailu";
    console.error("sendInvoiceEmail exception:", error);
    return {
      success: false,
      error: message,
      recipient: targetEmail,
    };
  }
}

export async function sendTestEmail(targetEmail: string): Promise<SendInvoiceEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return {
      success: false,
      error: "Není nastaven API klíč RESEND_API_KEY v .env.local ani na Vercelu.",
    };
  }

  try {
    const resend = new Resend(apiKey.trim());
    const response = await resend.emails.send({
      from: getSenderEmail(),
      to: [targetEmail],
      replyTo: DEFAULT_REPLY_TO,
      subject: "Testovací zpráva – Technologio Fakturace",
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-top: 0;">Technologio Fakturace</h2>
          <p>Tento e-mail potvrzuje, že napojení na službu <strong>Resend</strong> z adresy <code>faktury@technologio.eu</code> funguje správně.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b;">Odesláno automaticky z interního systému Technologio CRM.</p>
        </div>
      `,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      id: response.data?.id,
      recipient: targetEmail,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chyba testovacího e-mailu";
    return {
      success: false,
      error: message,
    };
  }
}
