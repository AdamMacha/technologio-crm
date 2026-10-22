import { NextRequest, NextResponse } from "next/server";
import { fetchCompanyFromAres } from "@/lib/ares";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ico = searchParams.get("ico");

  if (!ico) {
    return NextResponse.json({ error: "Chybí parametr IČO" }, { status: 400 });
  }

  try {
    const data = await fetchCompanyFromAres(ico);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chyba při komunikaci s ARES";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
