import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "technologio_session";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Veřejné cesty (statické soubory, obrázky, ikony, next interní routy, cron, login)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo.") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.startsWith("/api/cron") || // Cron má vlastní zabezpečení přes CRON_SECRET
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout")
  ) {
    return NextResponse.next();
  }

  // 2. Kontrola session tokenu
  const cookie = request.cookies.get(COOKIE_NAME);
  const password = process.env.APP_PASSWORD || "technologio2026";
  const secret = process.env.CRON_SECRET || "technologio-auth-salt";
  const expectedToken = await sha256(`${password}:${secret}`);

  const isAuthenticated = cookie?.value === expectedToken;

  // 3. Pokud je uživatel na /login
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 4. Pokud není přihlášen a jde na chráněnou stránku
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
