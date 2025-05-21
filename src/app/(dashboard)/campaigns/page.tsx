'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCampaigns, getCampaignProfitability, getUnassignedVendorInvoices, assignVendorInvoiceToCampaign, createCampaign } from '@/lib/supabase';
import { deleteCampaign, updateCampaign } from '@/lib/supabase-delete';
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
  BarChart,
  FileText,
  PlusCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

// Type definition for campaign with financial data
type CampaignWithFinancials = {
  id: string;
  name: string;
  description: string;
  po_number: string;
  start_date: string;
  end_date: string | null;
  budget: number;
  status: 'active' | 'completed' | 'planned';
  created_at: string;
  updated_at: string;
  customer_invoices: {
    id: string;
    invoice_number: string;
    amount: number;
    status: string;
  }[];
  vendor_invoices: {
    id: string;
    invoice_number: string;
    amount: number;
    status: string;
  }[];
  total_revenue: number;
  total_expenses: number;
  profit: number;
  profit_margin: number;
};



export default function CampaignsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<CampaignWithFinancials[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithFinancials | null>(null);
  const [isAssignInvoiceOpen, setIsAssignInvoiceOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [unassignedVendorInvoices, setUnassignedVendorInvoices] = useState<{
    id: string;
    invoice_number: string;
    vendor_name: string;
    amount: number;
    status: string;
    issue_date: string;
  }[]>([]);
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    po_number: '',
    start_date: '',
    end_date: '',
    budget: 0,
    status: 'planned' as 'active' | 'completed' | 'planned'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCampaigns() {
      setLoading(true);
      try {
        // Fetch campaigns from Supabase
        const campaignsData = await getCampaigns();

        // Fetch financial data for each campaign
        const campaignsWithFinancials = await Promise.all(
          campaignsData.map(async (campaign) => {
            const financials = await getCampaignProfitability(campaign.id);
            return {
              ...campaign,
              customer_invoices: [], // These will be populated in the detail view
              vendor_invoices: [],   // These will be populated in the detail view
              total_revenue: financials.total_revenue,
              total_expenses: financials.total_expenses,
              profit: financials.profit,
              profit_margin: financials.profit_margin
            };
          })
        );

        setCampaigns(campaignsWithFinancials);
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, []);

  useEffect(() => {
    async function loadUnassignedInvoices() {
      if (isAssignInvoiceOpen) {
        try {
          const invoices = await getUnassignedVendorInvoices();
          setUnassignedVendorInvoices(invoices);
        } catch (error) {
          console.error('Error loading unassigned vendor invoices:', error);
        }
      }
    }

    loadUnassignedInvoices();
  }, [isAssignInvoiceOpen]);

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.po_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">
          Manage your marketing campaigns and track their performance.
        </p>
      </div>

      {loading && (
        <Card className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading campaigns...</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search campaigns..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
              <DialogDescription>
                {selectedCampaign
                  ? 'Update campaign details to track performance and profitability.'
                  : 'Add a new marketing campaign to track performance and profitability.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Campaign Name</label>
                <Input
                  id="name"
                  placeholder="Enter campaign name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description">Description</label>
                <Input
                  id="description"
                  placeholder="Enter campaign description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="po-number">PO Number</label>
                <Input
                  id="po-number"
                  placeholder="Enter purchase order number"
                  value={newCampaign.po_number}
                  onChange={(e) => setNewCampaign({...newCampaign, po_number: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="start-date">Start Date</label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) => setNewCampaign({...newCampaign, start_date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="end-date">End Date</label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) => setNewCampaign({...newCampaign, end_date: e.target.value || null})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="budget">Budget</label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="0.00"
                  value={newCampaign.budget || ''}
                  onChange={(e) => setNewCampaign({...newCampaign, budget: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newCampaign.status}
                  onChange={(e) => setNewCampaign({...newCampaign, status: e.target.value as 'active' | 'completed' | 'planned'})}
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsNewCampaignOpen(false);
                setNewCampaign({
                  name: '',
                  description: '',
                  po_number: '',
                  start_date: '',
                  end_date: '',
                  budget: 0,
                  status: 'planned'
                });
              }}>
                Cancel
              </Button>
              <Button
                disabled={isSubmitting || !newCampaign.name || !newCampaign.po_number || !newCampaign.start_date}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    // Validate form data
                    if (!newCampaign.name) {
                      alert('Campaign name is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newCampaign.po_number) {
                      alert('PO number is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newCampaign.start_date) {
                      alert('Start date is required');
                      setIsSubmitting(false);
                      return;
                    }

                    // Format the budget as a number
                    const budget = parseFloat(newCampaign.budget.toString());
                    if (isNaN(budget)) {
                      alert('Budget must be a valid number');
                      setIsSubmitting(false);
                      return;
                    }

                    const campaignData = {
                      name: newCampaign.name,
                      description: newCampaign.description,
                      po_number: newCampaign.po_number,
                      start_date: newCampaign.start_date,
                      end_date: newCampaign.end_date || null,
                      budget: budget,
                      status: newCampaign.status
                    };

                    console.log(`${selectedCampaign ? 'Updating' : 'Creating'} campaign data:`, campaignData);

                    let campaign;

                    // If we have a selected campaign, update it; otherwise create a new one
                    if (selectedCampaign) {
                      campaign = await updateCampaign(selectedCampaign.id, campaignData);
                    } else {
                      campaign = await createCampaign(campaignData);
                    }

                    if (campaign) {
                      console.log('Campaign created successfully:', campaign);

                      // Refresh campaigns list
                      const campaignsData = await getCampaigns();
                      console.log('Fetched campaigns:', campaignsData);

                      const campaignsWithFinancials = await Promise.all(
                        campaignsData.map(async (campaign) => {
                          const financials = await getCampaignProfitability(campaign.id);
                          return {
                            ...campaign,
                            customer_invoices: [],
                            vendor_invoices: [],
                            total_revenue: financials.total_revenue,
                            total_expenses: financials.total_expenses,
                            profit: financials.profit,
                            profit_margin: financials.profit_margin
                          };
                        })
                      );

                      setCampaigns(campaignsWithFinancials);

                      // Reset form and close dialog
                      setNewCampaign({
                        name: '',
                        description: '',
                        po_number: '',
                        start_date: '',
                        end_date: '',
                        budget: 0,
                        status: 'planned'
                      });
                      setIsNewCampaignOpen(false);
                      setSelectedCampaign(null);

                      alert(`Campaign ${selectedCampaign ? 'updated' : 'created'} successfully!`);
                    } else {
                      // Try a direct approach as a last resort
                      try {
                        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                        if (!supabaseUrl || !supabaseKey) {
                          throw new Error('Supabase URL or key is missing');
                        }

                        const response = await fetch(`${supabaseUrl}/rest/v1/campaigns`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`,
                            'Prefer': 'return=representation'
                          },
                          body: JSON.stringify({
                            name: newCampaign.name,
                            description: newCampaign.description,
                            po_number: newCampaign.po_number,
                            start_date: newCampaign.start_date,
                            end_date: newCampaign.end_date || null,
                            budget: budget,
                            status: newCampaign.status
                          })
                        });

                        if (!response.ok) {
                          const errorText = await response.text();
                          throw new Error(`API error: ${response.status} - ${errorText}`);
                        }

                        const data = await response.json();
                        console.log('Campaign created successfully with direct fetch:', data);

                        // Refresh campaigns list
                        const campaignsData = await getCampaigns();
                        const campaignsWithFinancials = await Promise.all(
                          campaignsData.map(async (campaign) => {
                            const financials = await getCampaignProfitability(campaign.id);
                            return {
                              ...campaign,
                              customer_invoices: [],
                              vendor_invoices: [],
                              total_revenue: financials.total_revenue,
                              total_expenses: financials.total_expenses,
                              profit: financials.profit,
                              profit_margin: financials.profit_margin
                            };
                          })
                        );

                        setCampaigns(campaignsWithFinancials);

                        // Reset form and close dialog
                        setNewCampaign({
                          name: '',
                          description: '',
                          po_number: '',
                          start_date: '',
                          end_date: '',
                          budget: 0,
                          status: 'planned'
                        });
                        setIsNewCampaignOpen(false);

                        alert('Campaign created successfully!');
                      } catch (directError) {
                        console.error('Error with direct fetch approach:', directError);
                        alert(`Failed to create campaign: ${directError.message || 'Unknown error'}`);
                      }
                    }
                  } catch (error) {
                    console.error('Error creating campaign:', error);
                    alert(`An error occurred: ${error.message || 'Unknown error'}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting
                  ? (selectedCampaign ? 'Updating...' : 'Creating...')
                  : (selectedCampaign ? 'Update Campaign' : 'Create Campaign')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!loading && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Start Date</TableHead>
                  <TableHead className="hidden md:table-cell">End Date</TableHead>
                  <TableHead className="hidden md:table-cell">Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div>
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      >
                        {campaign.name}
                      </span>
                      <p className="text-sm text-muted-foreground md:hidden">
                        {formatDate(campaign.start_date)} -
                        {campaign.end_date ? formatDate(campaign.end_date) : 'Ongoing'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.po_number}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(campaign.start_date)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {campaign.end_date ? formatDate(campaign.end_date) : 'Ongoing'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    ₹{campaign.budget.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Campaign Details</DropdownMenuLabel>
                        <div className="px-2 py-1.5 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">PO Number:</span>
                            <span>{campaign.po_number}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Profitability:</span>
                            <span className={campaign.profit >= 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                              ₹{campaign.profit.toLocaleString()} ({campaign.profit_margin}%)
                            </span>
                          </div>
                        </div>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Customer Invoices</DropdownMenuLabel>

                        {campaign.customer_invoices.length > 0 ? (
                          <div className="px-2 py-1 max-h-32 overflow-y-auto">
                            {campaign.customer_invoices.map(invoice => (
                              <div key={invoice.id} className="flex items-center justify-between py-1 text-sm">
                                <span>{invoice.invoice_number}</span>
                                <div className="flex items-center gap-2">
                                  <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}>
                                    {invoice.status}
                                  </Badge>
                                  <span>₹{invoice.amount.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No customer invoices
                          </div>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Vendor Invoices</DropdownMenuLabel>

                        {campaign.vendor_invoices.length > 0 ? (
                          <div className="px-2 py-1 max-h-32 overflow-y-auto">
                            {campaign.vendor_invoices.map(invoice => (
                              <div key={invoice.id} className="flex items-center justify-between py-1 text-sm">
                                <span>{invoice.invoice_number}</span>
                                <div className="flex items-center gap-2">
                                  <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}>
                                    {invoice.status}
                                  </Badge>
                                  <span>₹{invoice.amount.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No vendor invoices
                          </div>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/campaigns/${campaign.id}`)}>
                          <BarChart className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          window.location.href = `/invoices?campaign=${campaign.id}`;
                        }}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Invoices
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedCampaign(campaign);
                          setIsAssignInvoiceOpen(true);
                        }}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Assign Vendor Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          // Set the campaign data for editing
                          setNewCampaign({
                            name: campaign.name,
                            description: campaign.description,
                            po_number: campaign.po_number,
                            start_date: campaign.start_date,
                            end_date: campaign.end_date || '',
                            budget: campaign.budget,
                            status: campaign.status
                          });

                          // Open the dialog in edit mode
                          setSelectedCampaign(campaign);
                          setIsNewCampaignOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Campaign
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${campaign.name}?`)) {
                              try {
                                setLoading(true);
                                // Delete the campaign from the database
                                const success = await deleteCampaign(campaign.id);

                                if (success) {
                                  alert(`Campaign ${campaign.name} deleted successfully`);

                                  // Refresh the campaigns list
                                  const campaignsData = await getCampaigns();
                                  const campaignsWithFinancials = await Promise.all(
                                    campaignsData.map(async (campaign) => {
                                      const financials = await getCampaignProfitability(campaign.id);
                                      return {
                                        ...campaign,
                                        customer_invoices: [],
                                        vendor_invoices: [],
                                        total_revenue: financials.total_revenue,
                                        total_expenses: financials.total_expenses,
                                        profit: financials.profit,
                                        profit_margin: financials.profit_margin
                                      };
                                    })
                                  );
                                  setCampaigns(campaignsWithFinancials);
                                } else {
                                  alert('Failed to delete campaign');
                                }
                              } catch (error) {
                                console.error('Error deleting campaign:', error);
                                alert('Failed to delete campaign');
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Campaign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No campaigns found. Create your first campaign to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog for assigning vendor invoices to campaigns */}
      <Dialog open={isAssignInvoiceOpen} onOpenChange={setIsAssignInvoiceOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assign Vendor Invoices to Campaign</DialogTitle>
            <DialogDescription>
              {selectedCampaign && (
                <>Assign vendor invoices to <strong>{selectedCampaign.name}</strong> (PO: {selectedCampaign.po_number})</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Available Vendor Invoices</h3>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInvoices(unassignedVendorInvoices.map(invoice => invoice.id));
                              } else {
                                setSelectedInvoices([]);
                              }
                            }}
                            checked={selectedInvoices.length === unassignedVendorInvoices.length && unassignedVendorInvoices.length > 0}
                          />
                        </div>
                      </TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issue Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedVendorInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={selectedInvoices.includes(invoice.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInvoices([...selectedInvoices, invoice.id]);
                                } else {
                                  setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                                }
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.vendor_name}</TableCell>
                        <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground">
                {selectedInvoices.length} invoice{selectedInvoices.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAssignInvoiceOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={selectedInvoices.length === 0}
                onClick={() => {
                  // Assign the selected invoices to the campaign
                  if (selectedCampaign) {
                    const assignmentPromises = selectedInvoices.map(invoiceId =>
                      assignVendorInvoiceToCampaign(invoiceId, selectedCampaign.id)
                    );

                    Promise.all(assignmentPromises)
                      .then(() => {
                        // Refresh the campaigns data
                        getCampaigns().then(campaignsData => {
                          Promise.all(
                            campaignsData.map(async (campaign) => {
                              const financials = await getCampaignProfitability(campaign.id);
                              return {
                                ...campaign,
                                customer_invoices: [],
                                vendor_invoices: [],
                                total_revenue: financials.total_revenue,
                                total_expenses: financials.total_expenses,
                                profit: financials.profit,
                                profit_margin: financials.profit_margin
                              };
                            })
                          ).then(updatedCampaigns => {
                            setCampaigns(updatedCampaigns);
                          });
                        });
                      })
                      .catch(error => {
                        console.error('Error assigning invoices:', error);
                      });
                  }

                  setIsAssignInvoiceOpen(false);
                  setSelectedInvoices([]);
                }}
              >
                Assign to Campaign
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
