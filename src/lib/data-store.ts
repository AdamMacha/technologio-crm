import { Client, Invoice, InvoiceItem, InvoiceWithItems, Settings, DashboardStats, InvoiceStatus } from "@/types";
import { createClient as getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toISODateString, getCurrentPeriod } from "@/lib/formatters";

// Výchozí nastavení studia Technologio
export const defaultSettings: Settings = {
  id: "technologio-settings-default",
  company_name: "Technologio s.r.o.",
  ico: "19842103",
  dic: "CZ19842103",
  is_vat_payer: false,
  street: "Křižíkova 148/34",
  city: "Praha 8 - Karlín",
  zip: "186 00",
  country: "Česká republika",
  email: "info@technologio.cz",
  phone: "+420 732 987 654",
  website: "https://technologio.cz",
  bank_account: "2401998877/2010",
  iban: "CZ4820100000002401998877",
  swift: "FIOBCZPPXXX",
  default_due_days: 14,
  invoice_note: "Nejsme plátci DPH. Fakturováno v souladu se smlouvou o dílo. Děkujeme za projevenou důvěru!",
  updated_at: new Date().toISOString(),
};

// Výchozí klienti pro okamžité vyzkoušení
export const initialClients: Client[] = [
  {
    id: "client-1",
    name: "Vinařství Na Kopci s.r.o.",
    ico: "28471923",
    dic: "CZ28471923",
    is_vat_payer: true,
    street: "Vinařská 124",
    city: "Mikulov",
    zip: "692 01",
    country: "Česká republika",
    email: "jan@vinarstvinakopci.cz",
    phone: "+420 608 112 233",
    note: "Dlouhodobý klient, web a e-shop na Next.js.",
    has_retainer: true,
    retainer_amount: 12500,
    retainer_description: "Měsíční správa e-shopu, optimalizace a bezpečnost",
    retainer_billing_day: 1,
    retainer_last_generated_period: "2026-10",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "client-2",
    name: "FitLife Studio s.r.o.",
    ico: "07391284",
    dic: "CZ07391284",
    is_vat_payer: false,
    street: "Nádražní 58",
    city: "Brno",
    zip: "602 00",
    country: "Česká republika",
    email: "provoz@fitlifestudio.cz",
    phone: "+420 775 443 322",
    note: "Rezervační systém pro fitness lekce.",
    has_retainer: true,
    retainer_amount: 8000,
    retainer_description: "Hosting, maintenance webu a technická podpora",
    retainer_billing_day: 5,
    retainer_last_generated_period: "2026-10",
    created_at: "2026-02-15T11:00:00Z",
  },
  {
    id: "client-3",
    name: "Architekti Horák & Partneři",
    ico: "14829301",
    dic: undefined,
    is_vat_payer: false,
    street: "Dlouhá 22",
    city: "Praha 1",
    zip: "110 00",
    country: "Česká republika",
    email: "horak@horak-architekti.cz",
    phone: "+420 724 990 881",
    note: "Portfolio web a 3D vizualizace.",
    has_retainer: true,
    retainer_amount: 15000,
    retainer_description: "Pravidelný grafický a webový servis, nové reference",
    retainer_billing_day: 15,
    retainer_last_generated_period: "2026-09",
    created_at: "2026-03-01T09:00:00Z",
  },
  {
    id: "client-4",
    name: "GreenLogistics CZ a.s.",
    ico: "29103847",
    dic: "CZ29103847",
    is_vat_payer: true,
    street: "Průmyslová zóna 400",
    city: "Pardubice",
    zip: "530 02",
    country: "Česká republika",
    email: "it@greenlogistics.cz",
    phone: "+420 466 123 789",
    note: "Zakázkový vývoj interní klientské zóny.",
    has_retainer: false,
    retainer_amount: 0,
    retainer_description: "",
    retainer_billing_day: 1,
    created_at: "2026-04-12T14:20:00Z",
  },
  {
    id: "client-5",
    name: "Kavárna Druhý Domov",
    ico: "09283711",
    dic: undefined,
    is_vat_payer: false,
    street: "Smetanova 7",
    city: "Olomouc",
    zip: "779 00",
    country: "Česká republika",
    email: "info@druhydomov.cz",
    phone: "+420 739 881 223",
    note: "Prezentační web a online objednávkový systém.",
    has_retainer: true,
    retainer_amount: 4500,
    retainer_description: "Správa domény, hostingu a sezónní změny menu",
    retainer_billing_day: 20,
    retainer_last_generated_period: "2026-10",
    created_at: "2026-05-18T16:00:00Z",
  },
];

// Výchozí faktury
export const initialInvoices: InvoiceWithItems[] = [
  {
    id: "inv-20260001",
    client_id: "client-1",
    invoice_number: "20260001",
    variable_symbol: "20260001",
    issue_date: "2026-10-01",
    due_date: "2026-10-15",
    taxable_date: "2026-10-01",
    status: "paid",
    payment_method: "bank_transfer",
    supplier_name: defaultSettings.company_name,
    supplier_ico: defaultSettings.ico,
    supplier_dic: defaultSettings.dic,
    supplier_address: `${defaultSettings.street}, ${defaultSettings.zip} ${defaultSettings.city}`,
    supplier_bank_account: defaultSettings.bank_account,
    supplier_iban: defaultSettings.iban,
    supplier_swift: defaultSettings.swift,
    client_name: "Vinařství Na Kopci s.r.o.",
    client_ico: "28471923",
    client_dic: "CZ28471923",
    client_address: "Vinařská 124, 692 01 Mikulov",
    client_email: "jan@vinarstvinakopci.cz",
    subtotal: 12500,
    tax_amount: 0,
    total_amount: 12500,
    currency: "CZK",
    is_retainer: true,
    retainer_period: "2026-10",
    notes: "Pravidelný měsíční paušál za říjen 2026.",
    paid_at: "2026-10-08T14:32:00Z",
    created_at: "2026-10-01T08:00:00Z",
    items: [
      {
        id: "item-1-1",
        description: "Měsíční správa e-shopu, optimalizace a bezpečnost (10/2026)",
        quantity: 1,
        unit: "měsíc",
        unit_price: 12500,
        vat_rate: 0,
        total_price: 12500,
      },
    ],
  },
  {
    id: "inv-20260002",
    client_id: "client-4",
    invoice_number: "20260002",
    variable_symbol: "20260002",
    issue_date: "2026-10-12",
    due_date: "2026-10-26",
    taxable_date: "2026-10-12",
    status: "pending",
    payment_method: "bank_transfer",
    supplier_name: defaultSettings.company_name,
    supplier_ico: defaultSettings.ico,
    supplier_dic: defaultSettings.dic,
    supplier_address: `${defaultSettings.street}, ${defaultSettings.zip} ${defaultSettings.city}`,
    supplier_bank_account: defaultSettings.bank_account,
    supplier_iban: defaultSettings.iban,
    supplier_swift: defaultSettings.swift,
    client_name: "GreenLogistics CZ a.s.",
    client_ico: "29103847",
    client_dic: "CZ29103847",
    client_address: "Průmyslová zóna 400, 530 02 Pardubice",
    client_email: "it@greenlogistics.cz",
    subtotal: 48000,
    tax_amount: 0,
    total_amount: 48000,
    currency: "CZK",
    is_retainer: false,
    retainer_period: null,
    notes: "Redesign webové prezentace a kalkulačky přepravy dle akceptačního protokolu ze dne 10.10.2026.",
    paid_at: null,
    created_at: "2026-10-12T09:30:00Z",
    items: [
      {
        id: "item-2-1",
        description: "UI/UX design nových stránek vč. mobilní responzivity",
        quantity: 20,
        unit: "hod",
        unit_price: 1200,
        vat_rate: 0,
        total_price: 24000,
      },
      {
        id: "item-2-2",
        description: "Frontend implementace v Next.js a napojení kalkulátoru přepravy",
        quantity: 20,
        unit: "hod",
        unit_price: 1200,
        vat_rate: 0,
        total_price: 24000,
      },
    ],
  },
  {
    id: "inv-20260003",
    client_id: "client-2",
    invoice_number: "20260003",
    variable_symbol: "20260003",
    issue_date: "2026-10-05",
    due_date: "2026-10-19",
    taxable_date: "2026-10-05",
    status: "paid",
    payment_method: "bank_transfer",
    supplier_name: defaultSettings.company_name,
    supplier_ico: defaultSettings.ico,
    supplier_dic: defaultSettings.dic,
    supplier_address: `${defaultSettings.street}, ${defaultSettings.zip} ${defaultSettings.city}`,
    supplier_bank_account: defaultSettings.bank_account,
    supplier_iban: defaultSettings.iban,
    supplier_swift: defaultSettings.swift,
    client_name: "FitLife Studio s.r.o.",
    client_ico: "07391284",
    client_dic: "CZ07391284",
    client_address: "Nádražní 58, 602 00 Brno",
    client_email: "provoz@fitlifestudio.cz",
    subtotal: 8000,
    tax_amount: 0,
    total_amount: 8000,
    currency: "CZK",
    is_retainer: true,
    retainer_period: "2026-10",
    notes: "Pravidelný paušál za správu a hosting.",
    paid_at: "2026-10-14T11:20:00Z",
    created_at: "2026-10-05T08:00:00Z",
    items: [
      {
        id: "item-3-1",
        description: "Hosting, maintenance webu a technická podpora (10/2026)",
        quantity: 1,
        unit: "měsíc",
        unit_price: 8000,
        vat_rate: 0,
        total_price: 8000,
      },
    ],
  },
  {
    id: "inv-20260004",
    client_id: "client-3",
    invoice_number: "20260004",
    variable_symbol: "20260004",
    issue_date: "2026-09-15",
    due_date: "2026-09-29",
    taxable_date: "2026-09-15",
    status: "overdue",
    payment_method: "bank_transfer",
    supplier_name: defaultSettings.company_name,
    supplier_ico: defaultSettings.ico,
    supplier_dic: defaultSettings.dic,
    supplier_address: `${defaultSettings.street}, ${defaultSettings.zip} ${defaultSettings.city}`,
    supplier_bank_account: defaultSettings.bank_account,
    supplier_iban: defaultSettings.iban,
    supplier_swift: defaultSettings.swift,
    client_name: "Architekti Horák & Partneři",
    client_ico: "14829301",
    client_address: "Dlouhá 22, 110 00 Praha 1",
    client_email: "horak@horak-architekti.cz",
    subtotal: 15000,
    tax_amount: 0,
    total_amount: 15000,
    currency: "CZK",
    is_retainer: true,
    retainer_period: "2026-09",
    notes: "Faktura za září 2026.",
    paid_at: null,
    created_at: "2026-09-15T08:00:00Z",
    items: [
      {
        id: "item-4-1",
        description: "Pravidelný grafický a webový servis, nové reference (09/2026)",
        quantity: 1,
        unit: "měsíc",
        unit_price: 15000,
        vat_rate: 0,
        total_price: 15000,
      },
    ],
  },
];

// Helper pro ukládání a načítání z LocalStorage
const STORAGE_KEYS = {
  CLIENTS: "technologio_clients_v1",
  INVOICES: "technologio_invoices_v1",
  SETTINGS: "technologio_settings_v1",
};

function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error writing to localStorage", err);
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
  );
}

// ==========================================
// CLIENTS API
// ==========================================
export async function getClients(): Promise<Client[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn("Supabase clients query failed, falling back to local store", e);
    }
  }

  // Fallback to local storage
  const stored = getLocalData<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
  return stored;
}

export async function getClient(id: string): Promise<Client | null> {
  const clients = await getClients();
  return clients.find((c) => c.id === id) || null;
}

export async function saveClient(client: Partial<Client>): Promise<Client> {
  const clients = await getClients();
  let updated: Client;

  if (client.id) {
    // Update
    updated = {
      ...clients.find((c) => c.id === client.id)!,
      ...client,
      updated_at: new Date().toISOString(),
    } as Client;
    const newList = clients.map((c) => (c.id === client.id ? updated : c));
    setLocalData(STORAGE_KEYS.CLIENTS, newList);
  } else {
    // Create
    updated = {
      id: `client-${Date.now()}`,
      name: client.name || "Nový klient",
      ico: client.ico || null,
      dic: client.dic || null,
      is_vat_payer: client.is_vat_payer || false,
      street: client.street || null,
      city: client.city || null,
      zip: client.zip || null,
      country: client.country || "Česká republika",
      email: client.email || "",
      phone: client.phone || null,
      note: client.note || null,
      has_retainer: client.has_retainer || false,
      retainer_amount: Number(client.retainer_amount) || 0,
      retainer_description: client.retainer_description || "Měsíční paušál a podpora",
      retainer_billing_day: Number(client.retainer_billing_day) || 1,
      retainer_last_generated_period: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocalData(STORAGE_KEYS.CLIENTS, [updated, ...clients]);
  }

  // Also try Supabase if configured
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      await supabase.from("clients").upsert(updated);
    } catch (e) {
      console.warn("Supabase upsert client failed", e);
    }
  }

  return updated;
}

export async function deleteClient(id: string): Promise<boolean> {
  const clients = await getClients();
  const newList = clients.filter((c) => c.id !== id);
  setLocalData(STORAGE_KEYS.CLIENTS, newList);

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      await supabase.from("clients").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete client failed", e);
    }
  }
  return true;
}

// ==========================================
// INVOICES API
// ==========================================
export async function getInvoices(): Promise<InvoiceWithItems[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .order("invoice_number", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((inv) => ({
          ...inv,
          items: inv.invoice_items || [],
        }));
      }
    } catch (e) {
      console.warn("Supabase invoices query failed, using local store", e);
    }
  }

  return getLocalData<InvoiceWithItems[]>(STORAGE_KEYS.INVOICES, initialInvoices);
}

export async function getInvoice(id: string): Promise<InvoiceWithItems | null> {
  const invoices = await getInvoices();
  return invoices.find((inv) => inv.id === id || inv.invoice_number === id) || null;
}

export async function getNextInvoiceNumber(year: number = new Date().getFullYear()): Promise<string> {
  const invoices = await getInvoices();
  const prefix = String(year);
  let maxSeq = 0;

  for (const inv of invoices) {
    if (inv.invoice_number && inv.invoice_number.startsWith(prefix) && inv.invoice_number.length === 8) {
      const seq = parseInt(inv.invoice_number.slice(4), 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

export async function saveInvoice(
  invoiceData: Partial<Invoice>,
  items: InvoiceItem[]
): Promise<InvoiceWithItems> {
  const invoices = await getInvoices();
  const settings = await getSettings();

  const subtotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const tax_amount = items.reduce((sum, item) => {
    const rate = Number(item.vat_rate) || 0;
    return sum + (Number(item.total_price) || 0) * (rate / 100);
  }, 0);
  const total_amount = subtotal + tax_amount;

  let invoiceNumber = invoiceData.invoice_number;
  if (!invoiceNumber) {
    invoiceNumber = await getNextInvoiceNumber();
  }

  const id = invoiceData.id || `inv-${invoiceNumber}`;

  const savedInvoice: InvoiceWithItems = {
    id,
    client_id: invoiceData.client_id || null,
    invoice_number: invoiceNumber,
    variable_symbol: invoiceData.variable_symbol || invoiceNumber,
    issue_date: invoiceData.issue_date || toISODateString(),
    due_date: invoiceData.due_date || toISODateString(new Date(Date.now() + 14 * 86400000)),
    taxable_date: invoiceData.taxable_date || invoiceData.issue_date || toISODateString(),
    status: invoiceData.status || "pending",
    payment_method: invoiceData.payment_method || "bank_transfer",
    
    supplier_name: invoiceData.supplier_name || settings.company_name,
    supplier_ico: invoiceData.supplier_ico || settings.ico,
    supplier_dic: invoiceData.supplier_dic || settings.dic || null,
    supplier_address: invoiceData.supplier_address || `${settings.street}, ${settings.zip} ${settings.city}`,
    supplier_bank_account: invoiceData.supplier_bank_account || settings.bank_account,
    supplier_iban: invoiceData.supplier_iban || settings.iban || null,
    supplier_swift: invoiceData.supplier_swift || settings.swift || null,
    
    client_name: invoiceData.client_name || "Odběratel",
    client_ico: invoiceData.client_ico || null,
    client_dic: invoiceData.client_dic || null,
    client_address: invoiceData.client_address || "",
    client_email: invoiceData.client_email || null,
    
    subtotal,
    tax_amount,
    total_amount,
    currency: invoiceData.currency || "CZK",
    
    is_retainer: Boolean(invoiceData.is_retainer),
    retainer_period: invoiceData.retainer_period || null,
    notes: invoiceData.notes || null,
    paid_at: invoiceData.status === "paid" ? (invoiceData.paid_at || new Date().toISOString()) : null,
    
    created_at: invoiceData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: items.map((it, idx) => ({
      ...it,
      id: it.id || `item-${Date.now()}-${idx}`,
      invoice_id: id,
    })),
  };

  const existingIdx = invoices.findIndex((i) => i.id === id);
  let updatedList: InvoiceWithItems[];
  if (existingIdx >= 0) {
    updatedList = [...invoices];
    updatedList[existingIdx] = savedInvoice;
  } else {
    updatedList = [savedInvoice, ...invoices];
  }

  setLocalData(STORAGE_KEYS.INVOICES, updatedList);

  // Supabase sync
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { items: invoiceItems, ...invoiceRecord } = savedInvoice;
      await supabase.from("invoices").upsert(invoiceRecord);
      if (invoiceItems && invoiceItems.length > 0) {
        await supabase.from("invoice_items").delete().eq("invoice_id", id);
        await supabase.from("invoice_items").insert(
          invoiceItems.map((item, order) => ({
            ...item,
            order_index: order,
          }))
        );
      }
    } catch (e) {
      console.warn("Supabase save invoice failed", e);
    }
  }

  return savedInvoice;
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<InvoiceWithItems | null> {
  const invoices = await getInvoices();
  const invoice = invoices.find((inv) => inv.id === id);
  if (!invoice) return null;

  invoice.status = status;
  invoice.paid_at = status === "paid" ? new Date().toISOString() : null;
  invoice.updated_at = new Date().toISOString();

  setLocalData(STORAGE_KEYS.INVOICES, invoices);

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      await supabase
        .from("invoices")
        .update({
          status,
          paid_at: invoice.paid_at,
          updated_at: invoice.updated_at,
        })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase update status failed", e);
    }
  }

  return invoice;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const invoices = await getInvoices();
  const filtered = invoices.filter((i) => i.id !== id);
  setLocalData(STORAGE_KEYS.INVOICES, filtered);

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      await supabase.from("invoices").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete invoice failed", e);
    }
  }
  return true;
}

// ==========================================
// RETAINERS AUTOMATION
// ==========================================
export async function generateRetainersForPeriod(
  period: string = getCurrentPeriod(),
  onlyForDay?: number
): Promise<{ count: number; total: number; generatedInvoices: InvoiceWithItems[] }> {
  const clients = await getClients();
  const settings = await getSettings();
  const invoices = await getInvoices();

  const generatedInvoices: InvoiceWithItems[] = [];
  const updatedClients: Client[] = [...clients];

  for (let i = 0; i < updatedClients.length; i++) {
    const client = updatedClients[i];
    
    // Only active retainers
    if (!client.has_retainer || !client.retainer_amount || client.retainer_amount <= 0) {
      continue;
    }

    // Filter by day if specified (e.g. today's day of month in cron)
    if (onlyForDay !== undefined && client.retainer_billing_day !== onlyForDay) {
      continue;
    }

    // Check if invoice for this period already exists for this client
    const alreadyGenerated = invoices.some(
      (inv) => inv.client_id === client.id && inv.retainer_period === period
    );

    if (alreadyGenerated || client.retainer_last_generated_period === period) {
      continue;
    }

    // Generate invoice
    const invNumber = await getNextInvoiceNumber();
    const issueDate = toISODateString();
    const dueDate = toISODateString(new Date(Date.now() + (settings.default_due_days || 14) * 86400000));
    
    const [year, month] = period.split("-");
    const itemDescription = `${client.retainer_description || "Měsíční paušál a servis"} (${month}/${year})`;

    const invoiceItem: InvoiceItem = {
      description: itemDescription,
      quantity: 1,
      unit: "měsíc",
      unit_price: client.retainer_amount,
      vat_rate: settings.is_vat_payer ? 21 : 0,
      total_price: client.retainer_amount,
    };

    const newInvoice = await saveInvoice(
      {
        client_id: client.id,
        invoice_number: invNumber,
        variable_symbol: invNumber,
        issue_date: issueDate,
        due_date: dueDate,
        taxable_date: issueDate,
        status: "pending",
        payment_method: "bank_transfer",
        is_retainer: true,
        retainer_period: period,
        notes: `Pravidelná měsíční fakturace na základě smlouvy o dílo / servisní smlouvy za období ${month}/${year}.`,
        client_name: client.name,
        client_ico: client.ico,
        client_dic: client.dic,
        client_address: `${client.street || ""}, ${client.zip || ""} ${client.city || ""}`.trim(),
        client_email: client.email,
      },
      [invoiceItem]
    );

    generatedInvoices.push(newInvoice);

    // Update client's last generated period
    client.retainer_last_generated_period = period;
    client.updated_at = new Date().toISOString();
  }

  setLocalData(STORAGE_KEYS.CLIENTS, updatedClients);

  const total = generatedInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  return {
    count: generatedInvoices.length,
    total,
    generatedInvoices,
  };
}

// ==========================================
// SETTINGS API
// ==========================================
export async function getSettings(): Promise<Settings> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("settings").select("*").single();
      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase settings query failed, using local store", e);
    }
  }

  return getLocalData<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings);
}

export async function saveSettings(settings: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const updated: Settings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  setLocalData(STORAGE_KEYS.SETTINGS, updated);

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      await supabase.from("settings").upsert(updated);
    } catch (e) {
      console.warn("Supabase save settings failed", e);
    }
  }

  return updated;
}

// ==========================================
// DASHBOARD STATS
// ==========================================
export async function getDashboardStats(): Promise<DashboardStats> {
  const invoices = await getInvoices();
  const clients = await getClients();
  const currentPeriod = getCurrentPeriod();
  const todayStr = toISODateString();

  let totalBilledThisMonth = 0;
  let paidThisMonth = 0;
  let overdueAmount = 0;
  let overdueCount = 0;

  for (const inv of invoices) {
    const isThisMonth = inv.issue_date && inv.issue_date.startsWith(currentPeriod);
    
    // Celkem vyfakturováno tento měsíc
    if (isThisMonth && inv.status !== "cancelled") {
      totalBilledThisMonth += Number(inv.total_amount) || 0;
    }

    // Zaplaceno tento měsíc
    if (inv.status === "paid") {
      const paidDate = inv.paid_at ? inv.paid_at.slice(0, 7) : inv.issue_date.slice(0, 7);
      if (paidDate === currentPeriod) {
        paidThisMonth += Number(inv.total_amount) || 0;
      }
    }

    // Po splatnosti (status overdue nebo due_date < dnes a status pending)
    const isOverdue = inv.status === "overdue" || (inv.status === "pending" && inv.due_date < todayStr);
    if (isOverdue) {
      overdueAmount += Number(inv.total_amount) || 0;
      overdueCount++;
    }
  }

  // MRR (Monthly Recurring Revenue) ze všech aktivních paušálů
  const activeRetainers = clients.filter((c) => c.has_retainer && (c.retainer_amount || 0) > 0);
  const mrr = activeRetainers.reduce((sum, c) => sum + (Number(c.retainer_amount) || 0), 0);

  return {
    totalBilledThisMonth,
    paidThisMonth,
    overdueAmount,
    overdueCount,
    mrr,
    activeRetainersCount: activeRetainers.length,
    totalInvoicesCount: invoices.length,
  };
}
