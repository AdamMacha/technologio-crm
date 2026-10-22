-- ============================================================================
-- TECHNOLOGIO INVOICE APP - SUPABASE DATABASE SCHEMA
-- ============================================================================

-- Zapnutí rozšíření pro generování UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. NASTAVENÍ STUDIA (TECHNOLOGIO - DODAVATEL)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Technologio s.r.o.',
    ico VARCHAR(20) NOT NULL DEFAULT '12345678',
    dic VARCHAR(20) DEFAULT 'CZ12345678',
    is_vat_payer BOOLEAN NOT NULL DEFAULT false, -- Plátce DPH (ano/ne)
    street VARCHAR(255) NOT NULL DEFAULT 'Václavské náměstí 1',
    city VARCHAR(100) NOT NULL DEFAULT 'Praha 1',
    zip VARCHAR(20) NOT NULL DEFAULT '110 00',
    country VARCHAR(100) NOT NULL DEFAULT 'Česká republika',
    email VARCHAR(255) DEFAULT 'fakturace@technologio.cz',
    phone VARCHAR(50) DEFAULT '+420 777 123 456',
    website VARCHAR(255) DEFAULT 'https://technologio.cz',
    bank_account VARCHAR(100) NOT NULL DEFAULT '2101234567/2010',
    iban VARCHAR(50) DEFAULT 'CZ5820100000002101234567',
    swift VARCHAR(20) DEFAULT 'FIOBCZPPXXX',
    default_due_days INTEGER NOT NULL DEFAULT 14,
    invoice_note TEXT DEFAULT 'Děkujeme za spolupráci. Fakturované služby odpovídají sjednané smlouvě.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. KLIENTI (CRM + NASTAVENÍ PAUŠÁLU)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    ico VARCHAR(20),
    dic VARCHAR(20),
    is_vat_payer BOOLEAN DEFAULT false,
    street VARCHAR(255),
    city VARCHAR(100),
    zip VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Česká republika',
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    note TEXT,
    
    -- Konfigurace paušálu (Retainer)
    has_retainer BOOLEAN NOT NULL DEFAULT false,
    retainer_amount NUMERIC(12, 2) DEFAULT 0,
    retainer_description VARCHAR(255) DEFAULT 'Měsíční správa webu, hosting a podpora',
    retainer_billing_day INTEGER DEFAULT 1 CHECK (retainer_billing_day BETWEEN 1 AND 31),
    retainer_last_generated_period VARCHAR(7), -- např. '2026-10'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FAKTURY
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    invoice_number VARCHAR(20) NOT NULL UNIQUE, -- Formát RRRRXXXX (např. 20260001)
    variable_symbol VARCHAR(20) NOT NULL,
    
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    taxable_date DATE NOT NULL DEFAULT CURRENT_DATE, -- DUZP
    
    status invoice_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
    
    -- Snapshot dodavatele (v době vystavení)
    supplier_name VARCHAR(255) NOT NULL,
    supplier_ico VARCHAR(20) NOT NULL,
    supplier_dic VARCHAR(20),
    supplier_address TEXT NOT NULL,
    supplier_bank_account VARCHAR(100) NOT NULL,
    supplier_iban VARCHAR(50),
    supplier_swift VARCHAR(20),
    
    -- Snapshot odběratele (v době vystavení)
    client_name VARCHAR(255) NOT NULL,
    client_ico VARCHAR(20),
    client_dic VARCHAR(20),
    client_address TEXT NOT NULL,
    client_email VARCHAR(255),
    
    -- Finanční součty
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'CZK',
    
    -- Retainer metadata
    is_retainer BOOLEAN NOT NULL DEFAULT false,
    retainer_period VARCHAR(7), -- např. '2026-10'
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. POLOŽKY FAKTURY
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit VARCHAR(20) NOT NULL DEFAULT 'ks',
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. POMOCNÁ FUNKCE PRO AUTOMATICKÉ ČÍSLOVÁNÍ FAKTUR (RRRRXXXX)
CREATE OR REPLACE FUNCTION get_next_invoice_number(year_input INT)
RETURNS VARCHAR(20) AS $$
DECLARE
    next_seq INT;
    prefix VARCHAR(4);
BEGIN
    prefix := year_input::TEXT;
    
    SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 5 FOR 4)::INT), 0) + 1
    INTO next_seq
    FROM invoices
    WHERE invoice_number LIKE (prefix || '%') AND LENGTH(invoice_number) = 8;
    
    RETURN prefix || LPAD(next_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 6. INDEXY PRO VYSOKÝ VÝKON
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_retainer ON clients(has_retainer, retainer_billing_day);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- 7. VÝCHOZÍ NASTAVENÍ (POKUD TABULKA ZEJE PRÁZDNOTOU)
INSERT INTO settings (company_name, ico, dic, is_vat_payer, street, city, zip, email, bank_account, iban, swift)
SELECT 'Technologio s.r.o.', '12345678', 'CZ12345678', false, 'Václavské náměstí 1', 'Praha 1', '110 00', 'fakturace@technologio.cz', '2101234567/2010', 'CZ5820100000002101234567', 'FIOBCZPPXXX'
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- 8. POVOLENÍ PŘÍSTUPU PRO INTERNÍ APLIKACI (ROW LEVEL SECURITY)
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;

