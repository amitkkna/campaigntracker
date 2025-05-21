# Supabase Setup Instructions

This directory contains SQL scripts for setting up and configuring your Supabase database for the marketing campaign tracking application.

## Fixing Row Level Security (RLS) Issues

If you're encountering errors like:
```
Failed to create campaign: API error: 401 - {"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \"campaigns\""}
```

This means that the Row Level Security policies in your Supabase database are preventing data operations. Follow these steps to fix it:

### Step 1: Run the RLS Fix Script

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the contents of `fix-rls-policies.sql` into the editor
6. Run the query

This script will:
- Check the current RLS status of your tables
- Drop any existing policies
- Enable RLS on all tables
- Create new policies that allow both public and authenticated access
- Verify the policies have been created

### Step 2: Restart Your Application

After running the SQL script, restart your Next.js development server:

```bash
npm run dev
```

### Step 3: Test Campaign Creation

Try creating a campaign again. The RLS error should be resolved.

## Understanding Row Level Security

Row Level Security (RLS) is a feature that allows you to control which rows in a table are accessible to different users. In this application:

- We've set up policies that allow full access to both public and authenticated users for development purposes
- In a production environment, you would want more restrictive policies
- The `WITH CHECK (true)` clause allows insert/update operations
- The `USING (true)` clause allows select/delete operations

## Database Schema

The application uses the following tables:

- `campaigns`: Stores marketing campaign information
- `customers`: Stores customer information
- `vendors`: Stores vendor/service provider information
- `customer_invoices`: Stores invoices issued to customers
- `vendor_invoices`: Stores invoices received from vendors

For the complete schema, see `schema.sql` in this directory.
