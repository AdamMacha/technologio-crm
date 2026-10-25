import React from "react";
import path from "path";
import fs from "fs";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import { InvoiceWithItems } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { generateQrPaymentDataUrl } from "@/lib/spayd";

let fontRegistered = false;

function ensureFonts() {
  if (fontRegistered) return;

  const regularFont = path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf");
  const boldFont = path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf");
  const italicFont = path.join(process.cwd(), "public/fonts/Roboto-Italic.ttf");

  const hasLocal = fs.existsSync(regularFont) && fs.existsSync(boldFont);

  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: hasLocal
          ? regularFont
          : "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
        fontWeight: 400,
      },
      {
        src: hasLocal
          ? boldFont
          : "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
        fontWeight: 700,
      },
      {
        src: fs.existsSync(italicFont)
          ? italicFont
          : "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
        fontWeight: 400,
        fontStyle: "italic",
      },
    ],
  });

  fontRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Roboto",
    fontSize: 9,
    color: "#1e293b", // slate-800
    backgroundColor: "#ffffff",
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e2e8f0", // slate-200
  },
  brandBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#4f46e5", // indigo-600
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a", // slate-900
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 8,
    color: "#64748b", // slate-500
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  docNumberRow: {
    flexDirection: "row",
    marginTop: 4,
    gap: 4,
  },
  docNumberLabel: {
    color: "#64748b",
  },
  docNumberValue: {
    fontWeight: 700,
    color: "#0f172a",
  },
  vsRow: {
    flexDirection: "row",
    marginTop: 2,
    gap: 4,
  },
  // Parties
  partiesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9", // slate-100
  },
  partyCol: {
    width: "48%",
  },
  partyLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#94a3b8", // slate-400
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 3,
  },
  partyText: {
    color: "#475569", // slate-600
    fontSize: 8.5,
    marginBottom: 1.5,
  },
  // Dates Bar
  datesBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc", // slate-50
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  dateCol: {
    width: "24%",
  },
  dateLabel: {
    fontSize: 7.5,
    color: "#64748b",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 9,
    fontWeight: 700,
    color: "#0f172a",
  },
  dueDateValue: {
    fontSize: 9,
    fontWeight: 700,
    color: "#4f46e5", // indigo-600
  },
  // Bank details
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    fontSize: 8.5,
    color: "#475569",
  },
  bankBold: {
    fontWeight: 700,
    color: "#0f172a",
  },
  // Items Table
  table: {
    marginTop: 14,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#cbd5e1", // slate-300
    paddingBottom: 6,
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#64748b",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 6,
    fontSize: 8.5,
  },
  colDesc: {
    width: "50%",
    paddingRight: 8,
  },
  colQty: {
    width: "12%",
    textAlign: "right",
  },
  colUnit: {
    width: "10%",
    textAlign: "right",
  },
  colUnitPrice: {
    width: "14%",
    textAlign: "right",
  },
  colTotal: {
    width: "14%",
    textAlign: "right",
    fontWeight: 700,
    color: "#0f172a",
  },
  // Totals & QR
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: "#e2e8f0",
  },
  qrBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 8,
    width: "50%",
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qrImage: {
    width: 76,
    height: 76,
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  qrInfo: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 2,
  },
  qrText: {
    fontSize: 7.5,
    color: "#64748b",
    lineHeight: 1.3,
  },
  totalsBox: {
    width: "42%",
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 8.5,
    color: "#64748b",
  },
  totalValue: {
    fontWeight: 700,
    color: "#0f172a",
  },
  grandTotalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderTopWidth: 1.5,
    borderTopColor: "#0f172a",
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#0f172a",
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: 700,
    color: "#4f46e5",
  },
  // Notes & Footer
  notesBox: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    fontSize: 8,
    color: "#64748b",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: "center",
    fontSize: 7.5,
    color: "#94a3b8",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
});

interface InvoicePdfProps {
  invoice: InvoiceWithItems;
  qrCodeUrl?: string;
}

export const InvoicePdfDocument: React.FC<InvoicePdfProps> = ({
  invoice,
  qrCodeUrl,
}) => {
  return (
    <Document title={`Faktura_${invoice.invoice_number}`} author="Technologio">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandBox}>
              <Text style={styles.logoBadge}>T</Text>
              <Text style={styles.brandName}>Technologio</Text>
            </View>
            <Text style={styles.brandTagline}>Webové studio & Digitální řešení</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>FAKTURA – DAŇOVÝ DOKLAD</Text>
            <View style={styles.docNumberRow}>
              <Text style={styles.docNumberLabel}>Číslo dokladu:</Text>
              <Text style={styles.docNumberValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.vsRow}>
              <Text style={styles.docNumberLabel}>Variabilní symbol:</Text>
              <Text style={styles.docNumberValue}>{invoice.variable_symbol}</Text>
            </View>
          </View>
        </View>

        {/* Dodavatel & Odběratel */}
        <View style={styles.partiesSection}>
          {/* Dodavatel */}
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>Dodavatel</Text>
            <Text style={styles.partyName}>{invoice.supplier_name}</Text>
            <Text style={styles.partyText}>{invoice.supplier_address}</Text>
            <Text style={styles.partyText}>
              IČO: {invoice.supplier_ico}
              {invoice.supplier_dic ? ` • DIČ: ${invoice.supplier_dic}` : ""}
            </Text>
          </View>

          {/* Odběratel */}
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>Odběratel</Text>
            <Text style={styles.partyName}>{invoice.client_name}</Text>
            <Text style={styles.partyText}>
              {invoice.client_address || "Adresa neuvedena"}
            </Text>
            {(invoice.client_ico || invoice.client_dic) && (
              <Text style={styles.partyText}>
                {invoice.client_ico ? `IČO: ${invoice.client_ico}` : ""}
                {invoice.client_ico && invoice.client_dic ? " • " : ""}
                {invoice.client_dic ? `DIČ: ${invoice.client_dic}` : ""}
              </Text>
            )}
            {invoice.client_email && (
              <Text style={styles.partyText}>{invoice.client_email}</Text>
            )}
          </View>
        </View>

        {/* Termíny */}
        <View style={styles.datesBar}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Datum vystavení</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.issue_date)}</Text>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Datum splatnosti</Text>
            <Text style={styles.dueDateValue}>{formatDate(invoice.due_date)}</Text>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>DUZP</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.taxable_date)}</Text>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Způsob úhrady</Text>
            <Text style={styles.dateValue}>Bankovní převod</Text>
          </View>
        </View>

        {/* Banka */}
        <View style={styles.bankRow}>
          <Text>
            Číslo účtu: <Text style={styles.bankBold}>{invoice.supplier_bank_account}</Text>
          </Text>
          {invoice.supplier_iban && (
            <Text>
              IBAN: <Text style={styles.bankBold}>{invoice.supplier_iban}</Text>
              {invoice.supplier_swift ? ` • SWIFT: ${invoice.supplier_swift}` : ""}
            </Text>
          )}
        </View>

        {/* Položky tabulka */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Položka / Popis služby</Text>
            <Text style={styles.colQty}>Počet</Text>
            <Text style={styles.colUnit}>Jedn.</Text>
            <Text style={styles.colUnitPrice}>Cena / jedn.</Text>
            <Text style={styles.colTotal}>Celkem</Text>
          </View>

          {invoice.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colUnitPrice}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.total_price)}</Text>
            </View>
          ))}
        </View>

        {/* Souhrn + QR */}
        <View style={styles.summarySection}>
          {/* QR Platba */}
          <View style={styles.qrBox}>
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} style={styles.qrImage} />
            ) : (
              <View style={[styles.qrImage, { backgroundColor: "#e2e8f0" }]} />
            )}
            <View style={styles.qrInfo}>
              <Text style={styles.qrTitle}>QR Platba</Text>
              <Text style={styles.qrText}>
                Naskenujte v bankovní aplikaci pro okamžité vyplnění platebních údajů.
              </Text>
            </View>
          </View>

          {/* Celkem */}
          <View style={styles.totalsBox}>
            <View style={styles.totalLine}>
              <Text>Mezisoučet:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            {invoice.tax_amount > 0 && (
              <View style={styles.totalLine}>
                <Text>DPH:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.tax_amount)}</Text>
              </View>
            )}
            <View style={styles.grandTotalLine}>
              <Text style={styles.grandTotalLabel}>Celkem k úhradě:</Text>
              <Text style={styles.grandTotalAmount}>
                {formatCurrency(invoice.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Poznámky */}
        {invoice.notes && (
          <View style={styles.notesBox}>
            <Text>Poznámka: {invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Vystaveno v systému Technologio • technologio.cz • faktury@technologio.eu • Děkujeme za spolupráci!
        </Text>
      </Page>
    </Document>
  );
};

export async function generateInvoicePdfBuffer(
  invoice: InvoiceWithItems
): Promise<Buffer> {
  ensureFonts();

  let qrDataUrl = "";
  try {
    qrDataUrl = await generateQrPaymentDataUrl({
      ibanOrAccount: invoice.supplier_iban || invoice.supplier_bank_account,
      amount: invoice.total_amount,
      vs: invoice.variable_symbol,
      message: `Faktura ${invoice.invoice_number}`,
    });
  } catch (err) {
    console.warn("Failed to generate QR code for PDF:", err);
  }

  const docElement = React.createElement(InvoicePdfDocument, {
    invoice,
    qrCodeUrl: qrDataUrl,
  });

  return await renderToBuffer(docElement as any);
}
