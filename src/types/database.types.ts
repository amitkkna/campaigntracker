export type Campaign = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  budget: number;
  status: 'active' | 'completed' | 'planned';
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  created_at: string;
  updated_at: string;
};

export type Vendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  created_at: string;
  updated_at: string;
};

export type CustomerInvoice = {
  id: string;
  campaign_id: string;
  customer_id: string;
  invoice_number: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  created_at: string;
  updated_at: string;
};

export type VendorInvoice = {
  id: string;
  campaign_id: string;
  vendor_id: string;
  invoice_number: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignProfitability = {
  campaign_id: string;
  total_revenue: number;
  total_expenses: number;
  profit: number;
  profit_margin: number;
  last_calculated: string;
};
