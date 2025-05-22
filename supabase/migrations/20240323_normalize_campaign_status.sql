-- Normalize campaign status values to lowercase
UPDATE campaigns 
SET status = LOWER(status)
WHERE status IS NOT NULL;

-- Set default status for any NULL values
UPDATE campaigns
SET status = 'planned'
WHERE status IS NULL;

-- Add a check constraint to ensure status is one of the allowed values
ALTER TABLE campaigns
ADD CONSTRAINT campaign_status_check
CHECK (status IN ('active', 'completed', 'planned'));

-- Add a comment explaining the status field
COMMENT ON COLUMN campaigns.status IS 'Campaign status: active, completed, or planned (lowercase only)';
