'use client';

import { useState, useEffect } from 'react';
import {
  getCustomerInvoices,
  getVendorInvoices,
  createCustomerInvoice,
  createVendorInvoice,
  updateCustomerInvoiceStatus,
  updateVendorInvoiceStatus,
  getCampaigns,
  getCustomers,
  getVendors
} from '@/lib/supabase';
import {
  deleteCustomerInvoice,
  deleteVendorInvoice
} from '@/lib/supabase-delete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  FileText,
  Download,
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';



export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [vendorInvoices, setVendorInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customer');

  // For new invoice forms
  const [isNewCustomerInvoiceOpen, setIsNewCustomerInvoiceOpen] = useState(false);
  const [isNewVendorInvoiceOpen, setIsNewVendorInvoiceOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For edit invoice forms
  const [isEditCustomerInvoiceOpen, setIsEditCustomerInvoiceOpen] = useState(false);
  const [isEditVendorInvoiceOpen, setIsEditVendorInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // For view invoice details
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false);

  // Edit invoice form states
  const [editCustomerInvoice, setEditCustomerInvoice] = useState({
    id: '',
    campaign_id: '',
    customer_id: '',
    invoice_number: '',
    amount: 0,
    status: 'pending' as 'paid' | 'pending' | 'overdue',
    issue_date: '',
    due_date: '',
    paid_date: ''
  });

  const [editVendorInvoice, setEditVendorInvoice] = useState({
    id: '',
    campaign_id: '',
    vendor_id: '',
    invoice_number: '',
    amount: 0,
    status: 'pending' as 'paid' | 'pending' | 'overdue',
    issue_date: '',
    due_date: '',
    paid_date: ''
  });

  // Data for dropdowns
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  // New invoice form states
  const [newCustomerInvoice, setNewCustomerInvoice] = useState({
    campaign_id: '',
    customer_id: '',
    invoice_number: '',
    amount: 0,
    status: 'pending' as 'paid' | 'pending' | 'overdue',
    issue_date: '',
    due_date: '',
    paid_date: ''
  });

  const [newVendorInvoice, setNewVendorInvoice] = useState({
    campaign_id: '',
    vendor_id: '',
    invoice_number: '',
    amount: 0,
    status: 'pending' as 'paid' | 'pending' | 'overdue',
    issue_date: '',
    due_date: '',
    paid_date: ''
  });

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      try {
        const [customerInvoicesData, vendorInvoicesData, campaignsData, customersData, vendorsData] = await Promise.all([
          getCustomerInvoices(),
          getVendorInvoices(),
          getCampaigns(),
          getCustomers(),
          getVendors()
        ]);

        setCustomerInvoices(customerInvoicesData);
        setVendorInvoices(vendorInvoicesData);
        setCampaigns(campaignsData);
        setCustomers(customersData);
        setVendors(vendorsData);
      } catch (error) {
        console.error('Error loading invoices:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, []);

  const filteredCustomerInvoices = customerInvoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVendorInvoices = vendorInvoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          Manage customer and vendor invoices for your marketing campaigns.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {activeTab === 'customer' ? (
          <Button onClick={() => setIsNewCustomerInvoiceOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Customer Invoice
          </Button>
        ) : (
          <Button onClick={() => setIsNewVendorInvoiceOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Vendor Invoice
          </Button>
        )}

        {/* Customer Invoice Dialog */}
        <Dialog open={isNewCustomerInvoiceOpen} onOpenChange={setIsNewCustomerInvoiceOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Customer Invoice</DialogTitle>
              <DialogDescription>
                Add a new invoice for a customer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="customer">Customer</label>
                <select
                  id="customer"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newCustomerInvoice.customer_id}
                  onChange={(e) => setNewCustomerInvoice({...newCustomerInvoice, customer_id: e.target.value})}
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name} ({customer.company})</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="campaign">Campaign</label>
                <select
                  id="campaign"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newCustomerInvoice.campaign_id}
                  onChange={(e) => setNewCustomerInvoice({...newCustomerInvoice, campaign_id: e.target.value})}
                >
                  <option value="">Select a campaign</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="invoice-number">Invoice Number</label>
                <Input
                  id="invoice-number"
                  placeholder="Enter invoice number"
                  value={newCustomerInvoice.invoice_number}
                  onChange={(e) => setNewCustomerInvoice({...newCustomerInvoice, invoice_number: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="amount">Amount (₹)</label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newCustomerInvoice.amount || ''}
                  onChange={(e) => setNewCustomerInvoice({...newCustomerInvoice, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="issue-date">Issue Date</label>
                  <Input
                    id="issue-date"
                    type="date"
                    value={newCustomerInvoice.issue_date}
                    onChange={(e) => setNewCustomerInvoice({...newCustomerInvoice, issue_date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="due-date">Due Date</label>
                  <Input
                    id="due-date"
                    type="date"
                    value={newCustomerInvoice.due_date}
                    onChange={(e) => setNewCustomerInvoice({...newCustomerInvoice, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newCustomerInvoice.status}
                  onChange={(e) => setNewCustomerInvoice({...newCustomerInvoice, status: e.target.value as 'paid' | 'pending' | 'overdue'})}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              {newCustomerInvoice.status === 'paid' && (
                <div className="grid gap-2">
                  <label htmlFor="paid-date">Paid Date</label>
                  <Input
                    id="paid-date"
                    type="date"
                    value={newCustomerInvoice.paid_date}
                    onChange={(e) => setNewCustomerInvoice({...newCustomerInvoice, paid_date: e.target.value})}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsNewCustomerInvoiceOpen(false);
                  setNewCustomerInvoice({
                    campaign_id: '',
                    customer_id: '',
                    invoice_number: '',
                    amount: 0,
                    status: 'pending',
                    issue_date: '',
                    due_date: '',
                    paid_date: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting || !newCustomerInvoice.customer_id || !newCustomerInvoice.campaign_id || !newCustomerInvoice.invoice_number || !newCustomerInvoice.amount || !newCustomerInvoice.issue_date || !newCustomerInvoice.due_date}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    // Validate form data
                    if (!newCustomerInvoice.customer_id) {
                      alert('Customer is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newCustomerInvoice.campaign_id) {
                      alert('Campaign is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newCustomerInvoice.invoice_number) {
                      alert('Invoice number is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newCustomerInvoice.amount) {
                      alert('Amount is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newCustomerInvoice.issue_date) {
                      alert('Issue date is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newCustomerInvoice.due_date) {
                      alert('Due date is required');
                      setIsSubmitting(false);
                      return;
                    }

                    console.log('Submitting customer invoice data:', newCustomerInvoice);

                    const invoice = await createCustomerInvoice({
                      campaign_id: newCustomerInvoice.campaign_id,
                      customer_id: newCustomerInvoice.customer_id,
                      invoice_number: newCustomerInvoice.invoice_number,
                      amount: newCustomerInvoice.amount,
                      status: newCustomerInvoice.status,
                      issue_date: newCustomerInvoice.issue_date,
                      due_date: newCustomerInvoice.due_date,
                      paid_date: newCustomerInvoice.status === 'paid' ? newCustomerInvoice.paid_date : null
                    });

                    if (invoice) {
                      console.log('Customer invoice created successfully:', invoice);

                      // Refresh invoices list
                      const customerInvoicesData = await getCustomerInvoices();
                      setCustomerInvoices(customerInvoicesData);

                      // Reset form and close dialog
                      setNewCustomerInvoice({
                        campaign_id: '',
                        customer_id: '',
                        invoice_number: '',
                        amount: 0,
                        status: 'pending',
                        issue_date: '',
                        due_date: '',
                        paid_date: ''
                      });
                      setIsNewCustomerInvoiceOpen(false);

                      alert('Customer invoice created successfully!');
                    } else {
                      alert('Failed to create customer invoice. Please check the console for details.');
                    }
                  } catch (error) {
                    console.error('Error creating customer invoice:', error);
                    alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Vendor Invoice Dialog */}
        <Dialog open={isNewVendorInvoiceOpen} onOpenChange={setIsNewVendorInvoiceOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Vendor Invoice</DialogTitle>
              <DialogDescription>
                Add a new invoice for a vendor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="vendor">Vendor</label>
                <select
                  id="vendor"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newVendorInvoice.vendor_id}
                  onChange={(e) => setNewVendorInvoice({...newVendorInvoice, vendor_id: e.target.value})}
                >
                  <option value="">Select a vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name} ({vendor.service_type})</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="campaign">Campaign (Optional)</label>
                <select
                  id="campaign"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newVendorInvoice.campaign_id}
                  onChange={(e) => setNewVendorInvoice({...newVendorInvoice, campaign_id: e.target.value})}
                >
                  <option value="">Select a campaign (optional)</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="invoice-number">Invoice Number</label>
                <Input
                  id="invoice-number"
                  placeholder="Enter invoice number"
                  value={newVendorInvoice.invoice_number}
                  onChange={(e) => setNewVendorInvoice({...newVendorInvoice, invoice_number: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="amount">Amount (₹)</label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newVendorInvoice.amount || ''}
                  onChange={(e) => setNewVendorInvoice({...newVendorInvoice, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="issue-date">Issue Date</label>
                  <Input
                    id="issue-date"
                    type="date"
                    value={newVendorInvoice.issue_date}
                    onChange={(e) => setNewVendorInvoice({...newVendorInvoice, issue_date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="due-date">Due Date</label>
                  <Input
                    id="due-date"
                    type="date"
                    value={newVendorInvoice.due_date}
                    onChange={(e) => setNewVendorInvoice({...newVendorInvoice, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newVendorInvoice.status}
                  onChange={(e) => setNewVendorInvoice({...newVendorInvoice, status: e.target.value as 'paid' | 'pending' | 'overdue'})}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              {newVendorInvoice.status === 'paid' && (
                <div className="grid gap-2">
                  <label htmlFor="paid-date">Paid Date</label>
                  <Input
                    id="paid-date"
                    type="date"
                    value={newVendorInvoice.paid_date}
                    onChange={(e) => setNewVendorInvoice({...newVendorInvoice, paid_date: e.target.value})}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsNewVendorInvoiceOpen(false);
                  setNewVendorInvoice({
                    campaign_id: '',
                    vendor_id: '',
                    invoice_number: '',
                    amount: 0,
                    status: 'pending',
                    issue_date: '',
                    due_date: '',
                    paid_date: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting || !newVendorInvoice.vendor_id || !newVendorInvoice.invoice_number || !newVendorInvoice.amount || !newVendorInvoice.issue_date || !newVendorInvoice.due_date}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    // Validate form data
                    if (!newVendorInvoice.vendor_id) {
                      alert('Vendor is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newVendorInvoice.invoice_number) {
                      alert('Invoice number is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newVendorInvoice.amount) {
                      alert('Amount is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newVendorInvoice.issue_date) {
                      alert('Issue date is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newVendorInvoice.due_date) {
                      alert('Due date is required');
                      setIsSubmitting(false);
                      return;
                    }

                    console.log('Submitting vendor invoice data:', newVendorInvoice);

                    const invoice = await createVendorInvoice({
                      campaign_id: newVendorInvoice.campaign_id || null,
                      vendor_id: newVendorInvoice.vendor_id,
                      invoice_number: newVendorInvoice.invoice_number,
                      amount: newVendorInvoice.amount,
                      status: newVendorInvoice.status,
                      issue_date: newVendorInvoice.issue_date,
                      due_date: newVendorInvoice.due_date,
                      paid_date: newVendorInvoice.status === 'paid' ? newVendorInvoice.paid_date : null
                    });

                    if (invoice) {
                      console.log('Vendor invoice created successfully:', invoice);

                      // Refresh invoices list
                      const vendorInvoicesData = await getVendorInvoices();
                      setVendorInvoices(vendorInvoicesData);

                      // Reset form and close dialog
                      setNewVendorInvoice({
                        campaign_id: '',
                        vendor_id: '',
                        invoice_number: '',
                        amount: 0,
                        status: 'pending',
                        issue_date: '',
                        due_date: '',
                        paid_date: ''
                      });
                      setIsNewVendorInvoiceOpen(false);

                      alert('Vendor invoice created successfully!');
                    } else {
                      alert('Failed to create vendor invoice. Please check the console for details.');
                    }
                  } catch (error) {
                    console.error('Error creating vendor invoice:', error);
                    alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="customer"
        className="space-y-4"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList>
          <TabsTrigger value="customer">Customer Invoices</TabsTrigger>
          <TabsTrigger value="vendor">Vendor Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="customer" className="space-y-4">
          {loading ? (
            <Card className="p-8">
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading customer invoices...</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomerInvoices.length > 0 ? (
                      filteredCustomerInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>{invoice.campaign_name}</TableCell>
                      <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(invoice.due_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsViewInvoiceOpen(true);
                            }}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              alert(`Generating PDF for invoice ${invoice.invoice_number}`);
                              // In a real app, you would generate and download a PDF
                            }}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            {invoice.status === 'pending' && (
                              <DropdownMenuItem onClick={async () => {
                                try {
                                  setLoading(true);

                                  // Update the invoice status in the database
                                  const today = new Date().toISOString().split('T')[0];
                                  const updatedInvoice = await updateCustomerInvoiceStatus(invoice.id, 'paid', today);

                                  if (updatedInvoice) {
                                    alert(`Invoice ${invoice.invoice_number} marked as paid`);

                                    // Update the invoice in the local state
                                    const updatedInvoices = customerInvoices.map(inv =>
                                      inv.id === invoice.id
                                        ? { ...inv, status: 'paid', paid_date: today }
                                        : inv
                                    );
                                    setCustomerInvoices(updatedInvoices);
                                  } else {
                                    // If the update failed, refresh the entire list
                                    const customerInvoicesData = await getCustomerInvoices();
                                    setCustomerInvoices(customerInvoicesData);
                                  }
                                } catch (error) {
                                  console.error('Error updating invoice status:', error);
                                  alert('Failed to update invoice status');

                                  // Refresh the invoices list to ensure consistency
                                  const customerInvoicesData = await getCustomerInvoices();
                                  setCustomerInvoices(customerInvoicesData);
                                } finally {
                                  setLoading(false);
                                }
                              }}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => {
                              setSelectedInvoice(invoice);
                              // Populate the edit form with the invoice data
                              setEditCustomerInvoice({
                                id: invoice.id,
                                campaign_id: invoice.campaign_id || '',
                                customer_id: invoice.customer_id,
                                invoice_number: invoice.invoice_number,
                                amount: invoice.amount,
                                status: invoice.status,
                                issue_date: invoice.issue_date,
                                due_date: invoice.due_date,
                                paid_date: invoice.paid_date || ''
                              });
                              setIsEditCustomerInvoiceOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
                                  try {
                                    setLoading(true);
                                    // Delete the invoice from the database
                                    const success = await deleteCustomerInvoice(invoice.id);

                                    if (success) {
                                      alert(`Invoice ${invoice.invoice_number} deleted successfully`);

                                      // Refresh the invoices list
                                      const customerInvoicesData = await getCustomerInvoices();
                                      setCustomerInvoices(customerInvoicesData);
                                    } else {
                                      alert('Failed to delete invoice');
                                    }
                                  } catch (error) {
                                    console.error('Error deleting invoice:', error);
                                    alert('Failed to delete invoice');
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No customer invoices found. Create your first invoice to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="vendor" className="space-y-4">
          {loading ? (
            <Card className="p-8">
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading vendor invoices...</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendorInvoices.length > 0 ? (
                      filteredVendorInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.vendor_name}</TableCell>
                      <TableCell>{invoice.campaign_name}</TableCell>
                      <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(invoice.due_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsViewInvoiceOpen(true);
                            }}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              alert(`Generating PDF for invoice ${invoice.invoice_number}`);
                              // In a real app, you would generate and download a PDF
                            }}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            {invoice.status === 'pending' && (
                              <DropdownMenuItem onClick={async () => {
                                try {
                                  setLoading(true);

                                  // Update the invoice status in the database
                                  const today = new Date().toISOString().split('T')[0];
                                  const updatedInvoice = await updateVendorInvoiceStatus(invoice.id, 'paid', today);

                                  if (updatedInvoice) {
                                    alert(`Invoice ${invoice.invoice_number} marked as paid`);

                                    // Update the invoice in the local state
                                    const updatedInvoices = vendorInvoices.map(inv =>
                                      inv.id === invoice.id
                                        ? { ...inv, status: 'paid', paid_date: today }
                                        : inv
                                    );
                                    setVendorInvoices(updatedInvoices);
                                  } else {
                                    // If the update failed, refresh the entire list
                                    const vendorInvoicesData = await getVendorInvoices();
                                    setVendorInvoices(vendorInvoicesData);
                                  }
                                } catch (error) {
                                  console.error('Error updating invoice status:', error);
                                  alert('Failed to update invoice status');

                                  // Refresh the invoices list to ensure consistency
                                  const vendorInvoicesData = await getVendorInvoices();
                                  setVendorInvoices(vendorInvoicesData);
                                } finally {
                                  setLoading(false);
                                }
                              }}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => {
                              setSelectedInvoice(invoice);
                              // Populate the edit form with the invoice data
                              setEditVendorInvoice({
                                id: invoice.id,
                                campaign_id: invoice.campaign_id || '',
                                vendor_id: invoice.vendor_id,
                                invoice_number: invoice.invoice_number,
                                amount: invoice.amount,
                                status: invoice.status,
                                issue_date: invoice.issue_date,
                                due_date: invoice.due_date,
                                paid_date: invoice.paid_date || ''
                              });
                              setIsEditVendorInvoiceOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
                                  try {
                                    setLoading(true);
                                    // Delete the invoice from the database
                                    const success = await deleteVendorInvoice(invoice.id);

                                    if (success) {
                                      alert(`Invoice ${invoice.invoice_number} deleted successfully`);

                                      // Refresh the invoices list
                                      const vendorInvoicesData = await getVendorInvoices();
                                      setVendorInvoices(vendorInvoicesData);
                                    } else {
                                      alert('Failed to delete invoice');
                                    }
                                  } catch (error) {
                                    console.error('Error deleting invoice:', error);
                                    alert('Failed to delete invoice');
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No vendor invoices found. Create your first invoice to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Customer Invoice Dialog */}
      <Dialog open={isEditCustomerInvoiceOpen} onOpenChange={setIsEditCustomerInvoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer Invoice</DialogTitle>
            <DialogDescription>
              Update invoice information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-customer">Customer</label>
              <select
                id="edit-customer"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editCustomerInvoice.customer_id}
                onChange={(e) => setEditCustomerInvoice({...editCustomerInvoice, customer_id: e.target.value})}
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name} ({customer.company})</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-campaign">Campaign</label>
              <select
                id="edit-campaign"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editCustomerInvoice.campaign_id}
                onChange={(e) => setEditCustomerInvoice({...editCustomerInvoice, campaign_id: e.target.value})}
              >
                <option value="">Select a campaign</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-invoice-number">Invoice Number</label>
              <Input
                id="edit-invoice-number"
                placeholder="Enter invoice number"
                value={editCustomerInvoice.invoice_number}
                onChange={(e) => setEditCustomerInvoice({...editCustomerInvoice, invoice_number: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-amount">Amount (₹)</label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0.00"
                value={editCustomerInvoice.amount || ''}
                onChange={(e) => setEditCustomerInvoice({...editCustomerInvoice, amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-issue-date">Issue Date</label>
                <Input
                  id="edit-issue-date"
                  type="date"
                  value={editCustomerInvoice.issue_date}
                  onChange={(e) => setEditCustomerInvoice({...editCustomerInvoice, issue_date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-due-date">Due Date</label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editCustomerInvoice.due_date}
                  onChange={(e) => setEditCustomerInvoice({...editCustomerInvoice, due_date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editCustomerInvoice.status}
                onChange={(e) => setEditCustomerInvoice({...editCustomerInvoice, status: e.target.value as 'paid' | 'pending' | 'overdue'})}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            {editCustomerInvoice.status === 'paid' && (
              <div className="grid gap-2">
                <label htmlFor="edit-paid-date">Paid Date</label>
                <Input
                  id="edit-paid-date"
                  type="date"
                  value={editCustomerInvoice.paid_date}
                  onChange={(e) => setEditCustomerInvoice({...editCustomerInvoice, paid_date: e.target.value})}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCustomerInvoiceOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting || !editCustomerInvoice.customer_id || !editCustomerInvoice.invoice_number || !editCustomerInvoice.amount || !editCustomerInvoice.issue_date || !editCustomerInvoice.due_date}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  // In a real app, you would update the invoice in the database
                  alert(`Updating invoice ${editCustomerInvoice.invoice_number}`);

                  // Refresh the invoices list
                  const customerInvoicesData = await getCustomerInvoices();
                  setCustomerInvoices(customerInvoicesData);

                  // Close dialog
                  setIsEditCustomerInvoiceOpen(false);
                } catch (error) {
                  console.error('Error updating invoice:', error);
                  alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Invoice Dialog */}
      <Dialog open={isEditVendorInvoiceOpen} onOpenChange={setIsEditVendorInvoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vendor Invoice</DialogTitle>
            <DialogDescription>
              Update invoice information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-vendor">Vendor</label>
              <select
                id="edit-vendor"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editVendorInvoice.vendor_id}
                onChange={(e) => setEditVendorInvoice({...editVendorInvoice, vendor_id: e.target.value})}
              >
                <option value="">Select a vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>{vendor.name} ({vendor.service_type})</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-campaign">Campaign (Optional)</label>
              <select
                id="edit-campaign"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editVendorInvoice.campaign_id}
                onChange={(e) => setEditVendorInvoice({...editVendorInvoice, campaign_id: e.target.value})}
              >
                <option value="">Select a campaign (optional)</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-invoice-number">Invoice Number</label>
              <Input
                id="edit-invoice-number"
                placeholder="Enter invoice number"
                value={editVendorInvoice.invoice_number}
                onChange={(e) => setEditVendorInvoice({...editVendorInvoice, invoice_number: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-amount">Amount (₹)</label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0.00"
                value={editVendorInvoice.amount || ''}
                onChange={(e) => setEditVendorInvoice({...editVendorInvoice, amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-issue-date">Issue Date</label>
                <Input
                  id="edit-issue-date"
                  type="date"
                  value={editVendorInvoice.issue_date}
                  onChange={(e) => setEditVendorInvoice({...editVendorInvoice, issue_date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-due-date">Due Date</label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editVendorInvoice.due_date}
                  onChange={(e) => setEditVendorInvoice({...editVendorInvoice, due_date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editVendorInvoice.status}
                onChange={(e) => setEditVendorInvoice({...editVendorInvoice, status: e.target.value as 'paid' | 'pending' | 'overdue'})}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            {editVendorInvoice.status === 'paid' && (
              <div className="grid gap-2">
                <label htmlFor="edit-paid-date">Paid Date</label>
                <Input
                  id="edit-paid-date"
                  type="date"
                  value={editVendorInvoice.paid_date}
                  onChange={(e) => setEditVendorInvoice({...editVendorInvoice, paid_date: e.target.value})}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditVendorInvoiceOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting || !editVendorInvoice.vendor_id || !editVendorInvoice.invoice_number || !editVendorInvoice.amount || !editVendorInvoice.issue_date || !editVendorInvoice.due_date}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  // In a real app, you would update the invoice in the database
                  alert(`Updating invoice ${editVendorInvoice.invoice_number}`);

                  // Refresh the invoices list
                  const vendorInvoicesData = await getVendorInvoices();
                  setVendorInvoices(vendorInvoicesData);

                  // Close dialog
                  setIsEditVendorInvoiceOpen(false);
                } catch (error) {
                  console.error('Error updating invoice:', error);
                  alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Details Dialog */}
      <Dialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Invoice #${selectedInvoice.invoice_number}`}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Invoice Number</h3>
                  <p className="text-base">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge className={getStatusColor(selectedInvoice.status)}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {activeTab === 'customer' ? 'Customer' : 'Vendor'}
                  </h3>
                  <p className="text-base">
                    {activeTab === 'customer' ? selectedInvoice.customer_name : selectedInvoice.vendor_name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Campaign</h3>
                  <p className="text-base">{selectedInvoice.campaign_name || 'Not assigned'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                  <p className="text-base font-medium">₹{selectedInvoice.amount.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Issue Date</h3>
                  <p className="text-base">{formatDate(selectedInvoice.issue_date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p className="text-base">{formatDate(selectedInvoice.due_date)}</p>
                </div>
                {selectedInvoice.status === 'paid' && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Paid Date</h3>
                    <p className="text-base">{formatDate(selectedInvoice.paid_date)}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Actions</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      alert(`Generating PDF for invoice ${selectedInvoice.invoice_number}`);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  {selectedInvoice.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          setLoading(true);

                          const today = new Date().toISOString().split('T')[0];
                          let updatedInvoice;

                          // Update the invoice status in the database based on the active tab
                          if (activeTab === 'customer') {
                            updatedInvoice = await updateCustomerInvoiceStatus(selectedInvoice.id, 'paid', today);

                            if (updatedInvoice) {
                              // Update the invoice in the local state
                              const updatedInvoices = customerInvoices.map(inv =>
                                inv.id === selectedInvoice.id
                                  ? { ...inv, status: 'paid', paid_date: today }
                                  : inv
                              );
                              setCustomerInvoices(updatedInvoices);
                              alert(`Invoice ${selectedInvoice.invoice_number} marked as paid`);
                            } else {
                              // If the update failed, refresh the entire list
                              const customerInvoicesData = await getCustomerInvoices();
                              setCustomerInvoices(customerInvoicesData);
                            }
                          } else {
                            updatedInvoice = await updateVendorInvoiceStatus(selectedInvoice.id, 'paid', today);

                            if (updatedInvoice) {
                              // Update the invoice in the local state
                              const updatedInvoices = vendorInvoices.map(inv =>
                                inv.id === selectedInvoice.id
                                  ? { ...inv, status: 'paid', paid_date: today }
                                  : inv
                              );
                              setVendorInvoices(updatedInvoices);
                              alert(`Invoice ${selectedInvoice.invoice_number} marked as paid`);
                            } else {
                              // If the update failed, refresh the entire list
                              const vendorInvoicesData = await getVendorInvoices();
                              setVendorInvoices(vendorInvoicesData);
                            }
                          }

                          // Close the dialog
                          setIsViewInvoiceOpen(false);
                        } catch (error) {
                          console.error('Error updating invoice status:', error);
                          alert('Failed to update invoice status');

                          // Refresh the invoices list to ensure consistency
                          if (activeTab === 'customer') {
                            const customerInvoicesData = await getCustomerInvoices();
                            setCustomerInvoices(customerInvoicesData);
                          } else {
                            const vendorInvoicesData = await getVendorInvoices();
                            setVendorInvoices(vendorInvoicesData);
                          }
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewInvoiceOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
