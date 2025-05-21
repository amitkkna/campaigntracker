-- Fix Row Level Security (RLS) policies for the marketing campaign tracking application

-- First, check if RLS is enabled on the tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('campaigns', 'customers', 'vendors', 'customer_invoices', 'vendor_invoices');

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON campaigns;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON vendors;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON customer_invoices;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON vendor_invoices;

-- Enable Row Level Security on all tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development purposes)
-- In a production environment, you would want more restrictive policies
CREATE POLICY "Allow public access" ON campaigns
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access" ON customers
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access" ON vendors
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access" ON customer_invoices
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access" ON vendor_invoices
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Create policies for authenticated users (more secure approach)
CREATE POLICY "Allow full access to authenticated users" ON campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to authenticated users" ON customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to authenticated users" ON vendors
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to authenticated users" ON customer_invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to authenticated users" ON vendor_invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Verify the policies have been created
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('campaigns', 'customers', 'vendors', 'customer_invoices', 'vendor_invoices');
