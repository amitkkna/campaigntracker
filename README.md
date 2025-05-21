# campaigntracker
# ExpensesTrackerPro - Marketing Campaign Management

A comprehensive application for tracking marketing campaigns, monitoring vendor and customer invoices, and analyzing profitability.

## Features

- **Campaign Management**: Create and manage marketing campaigns with PO tracking
- **Invoice Tracking**: Monitor both customer and vendor invoices
- **Profitability Analysis**: Track revenue, expenses, and profit for each campaign
- **Vendor Invoice Assignment**: Assign vendor invoices to specific campaigns
- **Elegant UI**: Modern, responsive interface with dark/light mode support

## Technology Stack

- **Frontend**: Next.js with TypeScript
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/expensestrackerpro.git
   cd expensestrackerpro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new Supabase project at [https://supabase.com](https://supabase.com)
   - Go to your project settings > API and copy the URL and anon key
   - Update the `.env.local` file with your Supabase credentials
   - Run the SQL schema in `supabase/schema.sql` in the Supabase SQL Editor
   - If you encounter RLS (Row Level Security) errors, run the SQL script in `supabase/fix-rls-policies.sql` (see `supabase/README.md` for details)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following database tables:

- **campaigns**: Stores marketing campaign information
- **customers**: Stores customer information
- **vendors**: Stores vendor/service provider information
- **customer_invoices**: Stores invoices issued to customers
- **vendor_invoices**: Stores invoices received from vendors

## Usage

### Managing Campaigns

1. Navigate to the Campaigns page
2. Click "New Campaign" to create a campaign
3. Fill in the campaign details, including PO number
4. View campaign details by clicking on a campaign name
5. Track profitability metrics on the campaign details page

### Managing Invoices

1. Navigate to the Invoices page
2. Use the tabs to switch between customer and vendor invoices
3. Click "New Invoice" to create an invoice
4. Assign vendor invoices to campaigns using the dropdown menu

### Analyzing Profitability

1. View the Dashboard for an overview of financial performance
2. Check individual campaign details for specific profitability metrics
3. Use the charts to visualize revenue, expenses, and profit

## Troubleshooting

### Row Level Security (RLS) Errors

If you encounter errors like:
```
Failed to create campaign: API error: 401 - {"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \"campaigns\""}
```

This means that the Row Level Security policies in your Supabase database are preventing data operations. To fix this:

1. Go to the Supabase SQL Editor
2. Run the SQL script in `supabase/fix-rls-policies.sql`
3. Restart your application

See `supabase/README.md` for more detailed instructions.

### Database Connection Issues

If you're having trouble connecting to the database:

1. Check that your Supabase URL and anon key are correct in `.env.local`
2. Ensure your Supabase project is active
3. Check the browser console for specific error messages
4. Verify that the tables have been created by running the schema.sql script

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
