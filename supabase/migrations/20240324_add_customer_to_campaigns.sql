-- Add customer_id column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Add comment to the column
COMMENT ON COLUMN campaigns.customer_id IS 'The customer associated with this campaign';

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS campaigns_customer_id_idx ON campaigns(customer_id);
