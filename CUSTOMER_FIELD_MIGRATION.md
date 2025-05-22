# IMPORTANT: Customer Field Migration Required

This document provides instructions on how to add the customer field to campaigns in the database.

**⚠️ You must apply this migration before the customer field will work properly in the application. ⚠️**

## Error Message

If you see the following error message when creating or updating a campaign:

```
Failed to create campaign: API error: 400 - {"code":"PGRST204","details":null,"hint":null,"message":"Could not find the 'customer_id' column of 'campaigns' in the schema cache"}
```

This means that the database schema needs to be updated to include the customer_id column.

## Migration Details

The migration adds a new column called "customer_id" to the campaigns table. This column is used to store the ID of the customer associated with the campaign.

## Applying the Migration

### Option 1: Using the Supabase Dashboard

1. Go to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the following SQL:

```sql
-- Add customer_id column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Add comment to the column
COMMENT ON COLUMN campaigns.customer_id IS 'The customer associated with this campaign';

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS campaigns_customer_id_idx ON campaigns(customer_id);
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
WHERE table_name = 'campaigns' AND column_name = 'customer_id';
```

This should return a row with the column details if the migration was successful.

## Using the Customer Field

After applying the migration, you can use the customer field in the application:

1. When creating a new campaign, you can select a customer from the dropdown
2. The customer will be displayed in the campaigns list and campaign details page
3. You can filter campaigns by customer

## Troubleshooting

If you encounter any issues with the migration, please check the following:

1. Make sure you have the necessary permissions to alter the campaigns table
2. Check if the column already exists (the migration uses IF NOT EXISTS to prevent errors)
3. If you're using the Supabase CLI, make sure you're connected to the correct project

If you continue to experience issues, please contact the development team for assistance.
