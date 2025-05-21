import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// This is a browser-safe way to create the Supabase client
// It ensures the client is only created once and is properly initialized
// with the environment variables available in the browser

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  // If we already have an instance, return it (singleton pattern)
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Get the environment variables from the window object if we're in the browser
  // or from process.env if we're in Node.js (during build)
  const supabaseUrl =
    typeof window !== 'undefined'
      ? window.ENV_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      : process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  const supabaseAnonKey =
    typeof window !== 'undefined'
      ? window.ENV_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // If we don't have the required credentials, return a mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Using mock client.');

    // Return a mock client that won't make actual API calls
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            order: () => Promise.resolve({ data: [], error: null }),
            is: () => Promise.resolve({ data: [], error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    } as any;
  }

  // Create a new Supabase client with the credentials
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

// For backward compatibility, export a supabase instance
export const supabase = getSupabaseClient();

// Helper functions for database operations

// Campaigns
export async function getCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }

  return data || [];
}

export async function getCampaignById(id: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      customer_invoices(*),
      vendor_invoices(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching campaign with id ${id}:`, error);
    return null;
  }

  return data;
}

export async function getCampaignProfitability(campaignId: string) {
  // Get customer invoices (revenue)
  const { data: customerInvoices, error: customerError } = await supabase
    .from('customer_invoices')
    .select('amount')
    .eq('campaign_id', campaignId);

  if (customerError) {
    console.error('Error fetching customer invoices:', customerError);
    return { total_revenue: 0, total_expenses: 0, profit: 0, profit_margin: 0 };
  }

  // Get vendor invoices (expenses)
  const { data: vendorInvoices, error: vendorError } = await supabase
    .from('vendor_invoices')
    .select('amount')
    .eq('campaign_id', campaignId);

  if (vendorError) {
    console.error('Error fetching vendor invoices:', vendorError);
    return { total_revenue: 0, total_expenses: 0, profit: 0, profit_margin: 0 };
  }

  // Calculate totals
  const totalRevenue = customerInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalExpenses = vendorInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? parseFloat(((profit / totalRevenue) * 100).toFixed(1)) : 0;

  return {
    total_revenue: totalRevenue,
    total_expenses: totalExpenses,
    profit,
    profit_margin: profitMargin
  };
}

// Customers
export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data || [];
}

// Vendors
export async function getVendors() {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }

  return data || [];
}

// Invoices
export async function getCustomerInvoices() {
  const { data, error } = await supabase
    .from('customer_invoices')
    .select(`
      *,
      campaigns (name),
      customers (name)
    `)
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Error fetching customer invoices:', error);
    return [];
  }

  return data.map(invoice => ({
    ...invoice,
    customer_name: invoice.customers?.name,
    campaign_name: invoice.campaigns?.name
  })) || [];
}

export async function getVendorInvoices() {
  const { data, error } = await supabase
    .from('vendor_invoices')
    .select(`
      *,
      campaigns (name),
      vendors (name, service_type)
    `)
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Error fetching vendor invoices:', error);
    return [];
  }

  return data.map(invoice => ({
    ...invoice,
    vendor_name: invoice.vendors?.name,
    service_type: invoice.vendors?.service_type,
    campaign_name: invoice.campaigns?.name
  })) || [];
}

export async function getUnassignedVendorInvoices() {
  const { data, error } = await supabase
    .from('vendor_invoices')
    .select(`
      *,
      vendors (name, service_type)
    `)
    .is('campaign_id', null)
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Error fetching unassigned vendor invoices:', error);
    return [];
  }

  return data.map(invoice => ({
    ...invoice,
    vendor_name: invoice.vendors?.name,
    service_type: invoice.vendors?.service_type
  })) || [];
}

// Get all invoices related to a specific campaign
export async function getCampaignInvoices(campaignId: string) {
  try {
    // Get customer invoices for this campaign
    const { data: customerInvoices, error: customerError } = await supabase
      .from('customer_invoices')
      .select(`
        *,
        customers (name, company)
      `)
      .eq('campaign_id', campaignId)
      .order('issue_date', { ascending: false });

    if (customerError) {
      console.error('Error fetching campaign customer invoices:', customerError);
      return { customerInvoices: [], vendorInvoices: [] };
    }

    // Get vendor invoices for this campaign
    const { data: vendorInvoices, error: vendorError } = await supabase
      .from('vendor_invoices')
      .select(`
        *,
        vendors (name, service_type)
      `)
      .eq('campaign_id', campaignId)
      .order('issue_date', { ascending: false });

    if (vendorError) {
      console.error('Error fetching campaign vendor invoices:', vendorError);
      return {
        customerInvoices: customerInvoices.map(invoice => ({
          ...invoice,
          customer_name: invoice.customers?.name,
          company: invoice.customers?.company
        })) || [],
        vendorInvoices: []
      };
    }

    return {
      customerInvoices: customerInvoices.map(invoice => ({
        ...invoice,
        customer_name: invoice.customers?.name,
        company: invoice.customers?.company
      })) || [],
      vendorInvoices: vendorInvoices.map(invoice => ({
        ...invoice,
        vendor_name: invoice.vendors?.name,
        service_type: invoice.vendors?.service_type
      })) || []
    };
  } catch (error) {
    console.error('Error in getCampaignInvoices:', error);
    return { customerInvoices: [], vendorInvoices: [] };
  }
}

export async function assignVendorInvoiceToCampaign(invoiceId: string, campaignId: string) {
  const { error } = await supabase
    .from('vendor_invoices')
    .update({ campaign_id: campaignId })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error assigning vendor invoice to campaign:', error);
    return false;
  }

  return true;
}

// Create a new campaign
export async function createCampaign(campaignData: {
  name: string;
  description: string;
  po_number: string;
  start_date: string;
  end_date?: string | null;
  budget: number;
  status: 'active' | 'completed' | 'planned';
}) {
  try {
    // Check Supabase connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('campaigns')
      .select('count(*)')
      .limit(1);

    if (connectionError) {
      console.error('Supabase connection test failed:', connectionError);
      return null;
    }

    console.log('Supabase connection test successful:', connectionTest);

    // Format the data properly
    const formattedData = {
      name: campaignData.name,
      description: campaignData.description,
      po_number: campaignData.po_number,
      start_date: campaignData.start_date,
      end_date: campaignData.end_date || null,
      budget: campaignData.budget,
      status: campaignData.status
      // Let Supabase handle timestamps with default values
    };

    console.log('Creating campaign with data:', formattedData);

    // First, check if the campaigns table exists and is accessible
    const { error: tableCheckError } = await supabase
      .from('campaigns')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      console.error('Error accessing campaigns table:', tableCheckError);
      return null;
    }

    // Try using a direct fetch approach as a fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or key is missing');
      return null;
    }

    try {
      // First try the Supabase client approach
      const { data, error } = await supabase
        .from('campaigns')
        .insert([formattedData])
        .select();

      if (error) {
        console.error('Error with Supabase client:', error);
        throw error; // This will trigger the fetch fallback
      }

      console.log('Campaign created successfully with Supabase client:', data);
      return data?.[0] || null;
    } catch (clientError) {
      console.error('Falling back to fetch API due to error:', clientError);

      // Fallback to direct fetch API
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/campaigns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(formattedData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch API error:', response.status, errorText);
          return null;
        }

        const data = await response.json();
        console.log('Campaign created successfully with fetch API:', data);
        return data[0] || null;
      } catch (fetchError) {
        console.error('Fetch API exception:', fetchError);
        return null;
      }
    }
  } catch (e) {
    console.error('Exception in createCampaign:', e);
    return null;
  }
}

// Create a new customer
export async function createCustomer(customerData: {
  name: string;
  email: string;
  phone: string;
  company: string;
}) {
  try {
    // Format the data properly
    const formattedData = {
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      company: customerData.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating customer with data:', formattedData);

    // Try using the Supabase client
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([formattedData])
        .select();

      if (error) {
        console.error('Error with Supabase client:', error);
        throw error;
      }

      console.log('Customer created successfully with Supabase client:', data);
      return data?.[0] || null;
    } catch (clientError) {
      console.error('Falling back to fetch API due to error:', clientError);

      // Fallback to direct fetch API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or key is missing');
        return null;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch API error:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('Customer created successfully with fetch API:', data);
      return data[0] || null;
    }
  } catch (e) {
    console.error('Exception in createCustomer:', e);
    return null;
  }
}

// Create a new vendor
export async function createVendor(vendorData: {
  name: string;
  email: string;
  phone: string;
  service_type: string;
}) {
  try {
    // Format the data properly
    const formattedData = {
      name: vendorData.name,
      email: vendorData.email,
      phone: vendorData.phone,
      service_type: vendorData.service_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating vendor with data:', formattedData);

    // Try using the Supabase client
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([formattedData])
        .select();

      if (error) {
        console.error('Error with Supabase client:', error);
        throw error;
      }

      console.log('Vendor created successfully with Supabase client:', data);
      return data?.[0] || null;
    } catch (clientError) {
      console.error('Falling back to fetch API due to error:', clientError);

      // Fallback to direct fetch API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or key is missing');
        return null;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch API error:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('Vendor created successfully with fetch API:', data);
      return data[0] || null;
    }
  } catch (e) {
    console.error('Exception in createVendor:', e);
    return null;
  }
}

// Create a new customer invoice
export async function createCustomerInvoice(invoiceData: {
  campaign_id: string;
  customer_id: string;
  invoice_number: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issue_date: string;
  due_date: string;
  paid_date?: string | null;
}) {
  try {
    // Format the data properly
    const formattedData = {
      campaign_id: invoiceData.campaign_id,
      customer_id: invoiceData.customer_id,
      invoice_number: invoiceData.invoice_number,
      amount: invoiceData.amount,
      status: invoiceData.status,
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date,
      paid_date: invoiceData.paid_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating customer invoice with data:', formattedData);

    // Try using the Supabase client
    try {
      const { data, error } = await supabase
        .from('customer_invoices')
        .insert([formattedData])
        .select();

      if (error) {
        console.error('Error with Supabase client:', error);
        throw error;
      }

      console.log('Customer invoice created successfully with Supabase client:', data);
      return data?.[0] || null;
    } catch (clientError) {
      console.error('Falling back to fetch API due to error:', clientError);

      // Fallback to direct fetch API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or key is missing');
        return null;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/customer_invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch API error:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('Customer invoice created successfully with fetch API:', data);
      return data[0] || null;
    }
  } catch (e) {
    console.error('Exception in createCustomerInvoice:', e);
    return null;
  }
}

// Create a new vendor invoice
export async function createVendorInvoice(invoiceData: {
  campaign_id?: string | null;
  vendor_id: string;
  invoice_number: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issue_date: string;
  due_date: string;
  paid_date?: string | null;
}) {
  try {
    // Format the data properly
    const formattedData = {
      campaign_id: invoiceData.campaign_id || null,
      vendor_id: invoiceData.vendor_id,
      invoice_number: invoiceData.invoice_number,
      amount: invoiceData.amount,
      status: invoiceData.status,
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date,
      paid_date: invoiceData.paid_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating vendor invoice with data:', formattedData);

    // Try using the Supabase client
    try {
      const { data, error } = await supabase
        .from('vendor_invoices')
        .insert([formattedData])
        .select();

      if (error) {
        console.error('Error with Supabase client:', error);
        throw error;
      }

      console.log('Vendor invoice created successfully with Supabase client:', data);
      return data?.[0] || null;
    } catch (clientError) {
      console.error('Falling back to fetch API due to error:', clientError);

      // Fallback to direct fetch API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or key is missing');
        return null;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/vendor_invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch API error:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('Vendor invoice created successfully with fetch API:', data);
      return data[0] || null;
    }
  } catch (e) {
    console.error('Exception in createVendorInvoice:', e);
    return null;
  }
}

// Update customer invoice status
export async function updateCustomerInvoiceStatus(invoiceId: string, status: 'paid' | 'pending' | 'overdue', paidDate?: string) {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // If status is paid and no paid date is provided, set it to today
    if (status === 'paid') {
      updateData.paid_date = paidDate || new Date().toISOString().split('T')[0];
    }

    console.log(`Updating customer invoice ${invoiceId} status to ${status}`);

    // Try using the Supabase client
    try {
      const { data, error } = await supabase
        .from('customer_invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select();

      if (error) {
        console.error('Error with Supabase client:', error);
        throw error;
      }

      console.log('Customer invoice updated successfully with Supabase client:', data);
      return data?.[0] || null;
    } catch (clientError) {
      console.error('Falling back to fetch API due to error:', clientError);

      // Fallback to direct fetch API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or key is missing');
        return null;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/customer_invoices?id=eq.${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch API error:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('Customer invoice updated successfully with fetch API:', data);
      return data[0] || null;
    }
  } catch (e) {
    console.error('Exception in updateCustomerInvoiceStatus:', e);
    return null;
  }
}

// Update vendor invoice status
export async function updateVendorInvoiceStatus(invoiceId: string, status: 'paid' | 'pending' | 'overdue', paidDate?: string) {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // If status is paid and no paid date is provided, set it to today
    if (status === 'paid') {
      updateData.paid_date = paidDate || new Date().toISOString().split('T')[0];
    }

    console.log(`Updating vendor invoice ${invoiceId} status to ${status}`);

    // Try using the Supabase client
    try {
      const { data, error } = await supabase
        .from('vendor_invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select();

      if (error) {
        console.error('Error with Supabase client:', error);
        throw error;
      }

      console.log('Vendor invoice updated successfully with Supabase client:', data);
      return data?.[0] || null;
    } catch (clientError) {
      console.error('Falling back to fetch API due to error:', clientError);

      // Fallback to direct fetch API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or key is missing');
        return null;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/vendor_invoices?id=eq.${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch API error:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('Vendor invoice updated successfully with fetch API:', data);
      return data[0] || null;
    }
  } catch (e) {
    console.error('Exception in updateVendorInvoiceStatus:', e);
    return null;
  }
}