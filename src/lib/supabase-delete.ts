// Delete functions for campaigns, customers, vendors, and invoices
import { getSupabaseClient } from './supabase';

// Get the Supabase client
const supabase = getSupabaseClient();

// Delete a campaign
export async function deleteCampaign(campaignId: string) {
  try {
    console.log(`Deleting campaign ${campaignId}`);

    // First, update any invoices associated with this campaign to remove the campaign_id
    const { error: customerInvoiceError } = await supabase
      .from('customer_invoices')
      .update({ campaign_id: null })
      .eq('campaign_id', campaignId);

    if (customerInvoiceError) {
      console.error('Error updating customer invoices:', customerInvoiceError);
    }

    const { error: vendorInvoiceError } = await supabase
      .from('vendor_invoices')
      .update({ campaign_id: null })
      .eq('campaign_id', campaignId);

    if (vendorInvoiceError) {
      console.error('Error updating vendor invoices:', vendorInvoiceError);
    }

    // Now delete the campaign
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Exception in deleteCampaign:', e);
    return false;
  }
}

// Update a campaign
export async function updateCampaign(campaignId: string, campaignData: {
  name?: string;
  description?: string;
  po_number?: string;
  start_date?: string;
  end_date?: string | null;
  budget?: number;
  status?: 'active' | 'completed' | 'planned';
  customer_id?: string | null;
}) {
  try {
    console.log(`Updating campaign ${campaignId}`, campaignData);

    // Add updated_at timestamp
    const updateData = {
      ...campaignData,
      updated_at: new Date().toISOString()
    };

    console.log('Final update data being sent to Supabase:', updateData);

    const { data, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select();

    if (error) {
      console.error('Error updating campaign:', error);
      return null;
    }

    console.log('Supabase update response data:', data);
    return data?.[0] || null;
  } catch (e) {
    console.error('Exception in updateCampaign:', e);
    return null;
  }
}

// Delete a customer
export async function deleteCustomer(customerId: string) {
  try {
    console.log(`Deleting customer ${customerId}`);

    // First check if there are any invoices for this customer
    const { data: invoices, error: checkError } = await supabase
      .from('customer_invoices')
      .select('id')
      .eq('customer_id', customerId);

    if (checkError) {
      console.error('Error checking customer invoices:', checkError);
      return { success: false, message: 'Error checking customer invoices' };
    }

    // If there are invoices, don't delete the customer
    if (invoices && invoices.length > 0) {
      return {
        success: false,
        message: `Cannot delete customer with ${invoices.length} invoice(s). Delete the invoices first.`
      };
    }

    // Now delete the customer
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) {
      console.error('Error deleting customer:', error);
      return { success: false, message: 'Error deleting customer' };
    }

    return { success: true, message: 'Customer deleted successfully' };
  } catch (e) {
    console.error('Exception in deleteCustomer:', e);
    return { success: false, message: 'Exception in deleteCustomer' };
  }
}

// Delete a vendor
export async function deleteVendor(vendorId: string) {
  try {
    console.log(`Deleting vendor ${vendorId}`);

    // First check if there are any invoices for this vendor
    const { data: invoices, error: checkError } = await supabase
      .from('vendor_invoices')
      .select('id')
      .eq('vendor_id', vendorId);

    if (checkError) {
      console.error('Error checking vendor invoices:', checkError);
      return { success: false, message: 'Error checking vendor invoices' };
    }

    // If there are invoices, don't delete the vendor
    if (invoices && invoices.length > 0) {
      return {
        success: false,
        message: `Cannot delete vendor with ${invoices.length} invoice(s). Delete the invoices first.`
      };
    }

    // Now delete the vendor
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId);

    if (error) {
      console.error('Error deleting vendor:', error);
      return { success: false, message: 'Error deleting vendor' };
    }

    return { success: true, message: 'Vendor deleted successfully' };
  } catch (e) {
    console.error('Exception in deleteVendor:', e);
    return { success: false, message: 'Exception in deleteVendor' };
  }
}

// Delete a customer invoice
export async function deleteCustomerInvoice(invoiceId: string) {
  try {
    console.log(`Deleting customer invoice ${invoiceId}`);

    const { error } = await supabase
      .from('customer_invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      console.error('Error deleting customer invoice:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Exception in deleteCustomerInvoice:', e);
    return false;
  }
}

// Delete a vendor invoice
export async function deleteVendorInvoice(invoiceId: string) {
  try {
    console.log(`Deleting vendor invoice ${invoiceId}`);

    const { error } = await supabase
      .from('vendor_invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      console.error('Error deleting vendor invoice:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Exception in deleteVendorInvoice:', e);
    return false;
  }
}
