-- Create tables for the marketing campaign tracking application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  po_number TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'planned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  service_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Invoices table
CREATE TABLE IF NOT EXISTS customer_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Invoices table
CREATE TABLE IF NOT EXISTS vendor_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow full access to authenticated users" ON campaigns
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow full access to authenticated users" ON customers
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow full access to authenticated users" ON vendors
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow full access to authenticated users" ON customer_invoices
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow full access to authenticated users" ON vendor_invoices
  FOR ALL TO authenticated USING (true);

-- Create functions for calculating profitability

-- Function to calculate total revenue for a campaign
CREATE OR REPLACE FUNCTION get_campaign_revenue(campaign_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_revenue DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_revenue
  FROM customer_invoices
  WHERE customer_invoices.campaign_id = campaign_id;

  RETURN total_revenue;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total expenses for a campaign
CREATE OR REPLACE FUNCTION get_campaign_expenses(campaign_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_expenses DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_expenses
  FROM vendor_invoices
  WHERE vendor_invoices.campaign_id = campaign_id;

  RETURN total_expenses;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate profit for a campaign
CREATE OR REPLACE FUNCTION get_campaign_profit(campaign_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  revenue DECIMAL;
  expenses DECIMAL;
BEGIN
  revenue := get_campaign_revenue(campaign_id);
  expenses := get_campaign_expenses(campaign_id);

  RETURN revenue - expenses;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate profit margin for a campaign
CREATE OR REPLACE FUNCTION get_campaign_profit_margin(campaign_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  revenue DECIMAL;
  profit DECIMAL;
BEGIN
  revenue := get_campaign_revenue(campaign_id);
  profit := get_campaign_profit(campaign_id);

  IF revenue = 0 THEN
    RETURN 0;
  ELSE
    RETURN (profit / revenue) * 100;
  END IF;
END;
$$ LANGUAGE plpgsql;
