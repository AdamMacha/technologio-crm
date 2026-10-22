import { AresResult } from "@/types";

export async function fetchCompanyFromAres(ico: string): Promise<AresResult | null> {
  const cleanIco = ico.trim().replace(/\s+/g, "");
  if (!/^\d{8}$/.test(cleanIco)) {
    throw new Error("IČO musí mít přesně 8 číslic");
  }

  try {
    const response = await fetch(
      `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${cleanIco}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Technologio-Invoice-App",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Subjekt s tímto IČO nebyl v registru ARES nalezen");
      }
      throw new Error(`ARES vrátil chybu ${response.status}`);
    }

    const data = await response.json();
    const sidlo = data.sidlo || {};

    let streetPart = sidlo.nazevUlice || sidlo.nazevCastiObce || sidlo.nazevObce || "";
    let numberPart = "";
    if (sidlo.cisloDomovni && sidlo.cisloOrientacni) {
      numberPart = `${sidlo.cisloDomovni}/${sidlo.cisloOrientacni}`;
    } else if (sidlo.cisloDomovni) {
      numberPart = String(sidlo.cisloDomovni);
    } else if (sidlo.cisloOrientacni) {
      numberPart = String(sidlo.cisloOrientacni);
    }

    const fullStreet = numberPart ? `${streetPart} ${numberPart}`.trim() : streetPart;
    const formattedPsc = sidlo.psc ? String(sidlo.psc).replace(/(\d{3})(\d{2})/, "$1 $2") : "";

    return {
      ico: data.ico,
      obchodniJmeno: data.obchodniJmeno,
      dic: data.dic || (data.ico ? `CZ${data.ico}` : undefined),
      ulice: fullStreet,
      mesto: sidlo.nazevObce || "",
      psc: formattedPsc,
      platceDph: Boolean(data.dic),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Chyba při komunikaci s ARES");
  }
}
