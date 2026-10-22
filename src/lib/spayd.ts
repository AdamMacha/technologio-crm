import QRCode from "qrcode";

/**
 * Generates an IBAN from a standard Czech account format (e.g., "123456-1234567890/0100" or "2101234567/2010")
 */
export function czechAccountToIban(accountStr: string): string {
  if (!accountStr) return "";
  const clean = accountStr.trim().replace(/\s+/g, "");
  
  // If already an IBAN
  if (clean.toUpperCase().startsWith("CZ")) {
    return clean.toUpperCase();
  }

  const parts = clean.split("/");
  if (parts.length !== 2) return "";

  const bankCode = parts[1].padStart(4, "0");
  const numberParts = parts[0].split("-");
  
  let prefix = "";
  let accountNumber = "";

  if (numberParts.length === 2) {
    prefix = numberParts[0].padStart(6, "0");
    accountNumber = numberParts[1].padStart(10, "0");
  } else {
    prefix = "".padStart(6, "0");
    accountNumber = numberParts[0].padStart(10, "0");
  }

  // Modulo 97 checksum calculation
  // Country code CZ -> C=12, Z=35 -> 123500
  const bban = `${bankCode}${prefix}${accountNumber}`;
  const numericString = `${bban}123500`;

  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i], 10)) % 97;
  }

  const checkDigits = String(98 - remainder).padStart(2, "0");
  return `CZ${checkDigits}${bban}`;
}

/**
 * Builds standard Czech SPAYD (Short Payment Descriptor) string
 */
export function buildSpaydString(params: {
  iban: string;
  amount: number;
  currency?: string;
  vs?: string;
  message?: string;
}): string {
  const { iban, amount, currency = "CZK", vs, message } = params;
  const cleanIban = iban.trim().replace(/\s+/g, "").toUpperCase();

  const parts = [
    "SPD*1.0",
    `ACC:${cleanIban}`,
    `AM:${amount.toFixed(2)}`,
    `CC:${currency.toUpperCase()}`,
  ];

  if (vs) {
    const cleanVs = vs.replace(/\D/g, "").slice(0, 10);
    if (cleanVs) parts.push(`VS:${cleanVs}`);
  }

  if (message) {
    const sanitizedMsg = message
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents for maximal reader compatibility
      .replace(/[*%]/g, "")
      .slice(0, 60);
    parts.push(`MSG:${sanitizedMsg}`);
  }

  return parts.join("*") + "*";
}

/**
 * Generates Base64 Data URL of QR Code for SPAYD payment
 */
export async function generateQrPaymentDataUrl(params: {
  ibanOrAccount: string;
  amount: number;
  currency?: string;
  vs?: string;
  message?: string;
}): Promise<string> {
  try {
    let iban = params.ibanOrAccount.trim();
    if (!iban.toUpperCase().startsWith("CZ")) {
      iban = czechAccountToIban(iban);
    }

    if (!iban) return "";

    const spayd = buildSpaydString({
      iban,
      amount: params.amount,
      currency: params.currency,
      vs: params.vs,
      message: params.message,
    });

    return await QRCode.toDataURL(spayd, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
      color: {
        dark: "#09090b",
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
}
