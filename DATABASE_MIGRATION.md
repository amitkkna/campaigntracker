# Database Migration Instructions

This document provides instructions on how to apply the database migration to add the "person" column to the campaigns table.

## Migration Details

The migration adds a new column called "person" to the campaigns table. This column is used to store the name of the person assigned to the campaign (either "Amit" or "Prateek").

## Applying the Migration

### Option 1: Using the Supabase Dashboard

1. Go to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the following SQL:

```sql
-- Add person column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS person TEXT;

-- Set default value for existing records
UPDATE campaigns SET person = 'Amit' WHERE person IS NULL;

-- Add comment to the column
COMMENT ON COLUMN campaigns.person IS 'The person assigned to this campaign (Amit or Prateek)';
```

6. Click "Run" to execute the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can apply the migration using the following command:

```bash
supabase db push
```

This will apply all migrations in the `supabase/migrations` directory.

## Verifying the Migration

To verify that the migration was applied successfully, you can run the following SQL query:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'campaigns' AND column_name = 'person';
```

This should return a row with the column details if the migration was successful.

## Troubleshooting

If you encounter any issues with the migration, please check the following:

1. Make sure you have the necessary permissions to alter the campaigns table
2. Check if the column already exists (the migration uses IF NOT EXISTS to prevent errors)
3. If you're using the Supabase CLI, make sure you're connected to the correct project

If you continue to experience issues, please contact the development team for assistance.
