# Campaign Status Normalization

This document provides instructions on how to fix the issue with campaign status values in the database.

## Issue Description

The dashboard was showing 0 active campaigns even when there were active campaigns in the database. This was due to case sensitivity issues with the campaign status values. The application was expecting lowercase status values ('active', 'completed', 'planned'), but some values in the database might have been stored with different casing (e.g., 'Active', 'ACTIVE').

## Solution

We've implemented the following fixes:

1. Updated the application code to handle case-insensitive status comparisons
2. Created a database migration to normalize all status values to lowercase
3. Added a check constraint to ensure only valid status values are stored

## Applying the Database Migration

### Option 1: Using the Supabase Dashboard

1. Go to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the following SQL:

```sql
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
```

6. Click "Run" to execute the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can apply the migration using the following command:

```bash
supabase db push
```

This will apply all migrations in the `supabase/migrations` directory.

## Verifying the Fix

After applying the migration, refresh the dashboard page. The active campaign count should now correctly display the number of active campaigns in your database.

You can also verify the status values in the database by running the following SQL query:

```sql
SELECT id, name, status FROM campaigns;
```

All status values should now be lowercase ('active', 'completed', or 'planned').

## Preventing Future Issues

To prevent similar issues in the future, we've updated the application code to:

1. Normalize status values to lowercase when fetching from the database
2. Use case-insensitive comparisons when checking status values
3. Ensure new campaigns are created with lowercase status values

These changes ensure consistent behavior regardless of how the status values are stored in the database.
