-- Add person column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS person TEXT;

-- Set default value for existing records
UPDATE campaigns SET person = 'Amit' WHERE person IS NULL;

-- Add comment to the column
COMMENT ON COLUMN campaigns.person IS 'The person assigned to this campaign (Amit or Prateek)';
