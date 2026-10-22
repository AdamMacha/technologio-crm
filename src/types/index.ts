export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Client {
  id: string;
  name: string;
  ico?: string | null;
  dic?: string | null;
  is_vat_payer: boolean;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  country: string;
  email: string;
  phone?: string | null;
  note?: string | null;
  
  // Retainer configuration
  has_retainer: boolean;
  retainer_amount: number;
  retainer_description: string;
  retainer_billing_day: number;
  retainer_last_generated_period?: string | null;
  
  created_at?: string;
  updated_at?: string;
}

export interface Settings {
  id: string;
  company_name: string;
  ico: string;
  dic?: string | null;
  is_vat_payer: boolean;
  street: string;
  city: string;
  zip: string;
  country: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  bank_account: string;
  iban?: string | null;
  swift?: string | null;
  default_due_days: number;
  invoice_note?: string | null;
  updated_at?: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  total_price: number;
  order_index?: number;
  created_at?: string;
}

export interface Invoice {
  id: string;
  client_id?: string | null;
  invoice_number: string;
  variable_symbol: string;
  issue_date: string;
  due_date: string;
  taxable_date: string;
  status: InvoiceStatus;
  payment_method: string;
  
  supplier_name: string;
  supplier_ico: string;
  supplier_dic?: string | null;
  supplier_address: string;
  supplier_bank_account: string;
  supplier_iban?: string | null;
  supplier_swift?: string | null;
  
  client_name: string;
  client_ico?: string | null;
  client_dic?: string | null;
  client_address: string;
  client_email?: string | null;
  
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  
  is_retainer: boolean;
  retainer_period?: string | null;
  notes?: string | null;
  paid_at?: string | null;
  
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
  client?: Client;
}

export interface DashboardStats {
  totalBilledThisMonth: number;
  paidThisMonth: number;
  overdueAmount: number;
  overdueCount: number;
  mrr: number; // Monthly Recurring Revenue from retainers
  activeRetainersCount: number;
  totalInvoicesCount: number;
}

export interface AresResult {
  ico: string;
  obchodniJmeno: string;
  dic?: string;
  ulice?: string;
  cisloDomovni?: string;
  cisloOrientacni?: string;
  mesto?: string;
  psc?: string;
  platceDph?: boolean;
}
