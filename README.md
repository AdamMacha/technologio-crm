# Technologio – Interní fakturační & CRM systém

Kompletní interní webová aplikace vytvořená pro webové studio **Technologio**. Slouží pro správu klientů (CRM), evidenci a rychlé změny plateb, vystavování českých faktur s **QR Platbou (SPAYD)** a **automatizaci měsíčních paušálů (MRR)**.

---

## 🚀 Klíčové funkce

### 1. Přehled (Dashboard)
- **Karty se statistikami:**
  - *Celkem vyfakturováno tento měsíc*
  - *Zaplaceno* (uhrazené platby)
  - *Po splatnosti* (s počtem faktur k urgenci)
  - *Pravidelný měsíční příjem z paušálů (MRR)*
- **Rychlé přepínání stavu úhrady přímo v tabulce:**
  - `Čeká na platbu` ➔ `Zaplaceno` (s konfety animací 🎉) ➔ `Po splatnosti` ➔ `Stornováno`.

### 2. Správa klientů (CRM) & ARES integrace
- Kompletní evidence odběratelů: Název firmy / Jméno, IČO, DIČ, Adresa, E-mail, Telefon, Poznámka.
- **Bleskové načítání z českého registru ARES:** Po zadání IČO stačí kliknout na tlačítko **ARES** a systém automaticky doplní přesný název společnosti, sídlo a DIČ z Ministerstva financí ČR.
- **Konfigurace měsíčního paušálu u klienta:**
  - Přepínač *Aktivní měsíční paušál*
  - Měsíční částka v CZK
  - Popis položky na faktuře (např. *Správa e-shopu, hosting a podpora*)
  - Den v měsíci pro vystavení (1–31)

### 3. Fakturace a tiskový PDF export
- **Automatické číslování ve formátu `RRRRXXXX`** (např. `20260001`, `20260002`...).
- **České náležitosti faktury:**
  - Dodavatel (studio Technologio), Odběratel, Datum vystavení, Splatnost (výchozí 14 dní), DUZP.
  - Bankovní účet, IBAN, SWIFT, Variabilní symbol.
  - Dynamické položky (název, počet, jednotka, sazba DPH, jednotková cena a součet).
  - Snapshot historie (změna sídla klienta v budoucnu neovlivní již vystavené staré faktury).
- **Česká QR Platba (standard SPAYD):**
  - Každá faktura dynamicky generuje bankovní QR kód. Klient jej naskenuje mobilem v jakékoliv české bance (ČSOB, Air Bank, KB, Fio, Spořitelna...) a má okamžitě předvyplněný účet, částku i variabilní symbol.
- **Čistý PDF export & Tisk:**
  - Tlačítko pro tisk / uložení do PDF s precizním `@media print` layoutem přesně na formát A4 bez zbytečných ovládacích prvků.

### 4. Automatizace měsíčních paušálů
- Přehledná sekce **Paušály** se zobrazením MRR a stavem vystavení za aktuální měsíc.
- **Ruční spuštění jedním klikem:** Tlačítko *"Vygenerovat faktury na tento měsíc"* vygeneruje faktury pro všechny paušální klienty, kterým v daném měsíci ještě faktura nebyla vystavena (inteligentní ochrana proti duplicitám).
- **Automatický CRON endpoint:**
  - URL: `/api/cron/generate-retainers?secret=technologio-cron-secret`
  - Automaticky zkontroluje dnešní den a vygeneruje faktury klientům, kteří mají právě dnes nastavený den vystavení.

---

## 🛠️ Použitý Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack, TypeScript)
- **Styling:** Tailwind CSS + moderní dark/light design systém
- **Ikony:** Lucide React
- **QR Platba:** `qrcode` s implementací standardu Czech Banking Association SPAYD
- **Databáze & Backend:** Supabase (PostgreSQL) + vestavěné lokální úložiště (funguje ihned i offline)

---

## 📦 Jak aplikaci spustit

```bash
# 1. Spuštění vývojového serveru
npm run dev

# 2. Otevření v prohlížeči
http://localhost:3000
```

---

## 🗄️ Připojení k Supabase

Aplikace funguje **ihned po spuštění** v offline/lokálním režimu s předpřipravenými daty studia a vzorovými klienty.

Pokud chcete ukládat data do svého cloudu **Supabase**:
1. Vytvořte si nový projekt na [supabase.com](https://supabase.com).
2. Otevřete v Supabase **SQL Editor** a spusťte kód ze souboru:
   `supabase/migrations/20261022000000_init_schema.sql`
3. V kořeni projektu vyplňte do souboru `.env.local` vaše klíče (najdete v *Project Settings ➔ API*):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://vase-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=vase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=vase-service-role-key
   ```
4. Restartujte dev server (`npm run dev`). Aplikace se automaticky přepne na **Supabase Live** režim.
