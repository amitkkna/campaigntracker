'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  getCampaigns,
  getCustomerInvoices,
  getVendorInvoices
} from '@/lib/supabase';

// Empty data for initial state
const emptyCampaignData = [];
const emptyProfitTrend = [];

// Helper function to generate monthly data for charts
function generateMonthlyData(customerInvoices: any[], vendorInvoices: any[]) {
  // Get all unique months from both invoice types
  const allInvoices = [...customerInvoices, ...vendorInvoices];
  const months: Record<string, { month: string, revenue: number, expenses: number, profit: number, sortKey: number }> = {};

  // Get current date and calculate last 6 months
  const today = new Date();
  const last6Months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear();
    const sortKey = d.getFullYear() * 100 + d.getMonth(); // For proper sorting

    months[monthKey] = {
      month: monthKey,
      revenue: 0,
      expenses: 0,
      profit: 0,
      sortKey: sortKey
    };

    last6Months.push(monthKey);
  }

  // Process customer invoices (revenue)
  customerInvoices.forEach(invoice => {
    if (!invoice.issue_date) return;

    const date = new Date(invoice.issue_date);
    const monthKey = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
    const sortKey = date.getFullYear() * 100 + date.getMonth();

    if (!months[monthKey]) {
      months[monthKey] = {
        month: monthKey,
        revenue: 0,
        expenses: 0,
        profit: 0,
        sortKey: sortKey
      };
    }

    months[monthKey].revenue += invoice.amount;
  });

  // Process vendor invoices (expenses)
  vendorInvoices.forEach(invoice => {
    if (!invoice.issue_date) return;

    const date = new Date(invoice.issue_date);
    const monthKey = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
    const sortKey = date.getFullYear() * 100 + date.getMonth();

    if (!months[monthKey]) {
      months[monthKey] = {
        month: monthKey,
        revenue: 0,
        expenses: 0,
        profit: 0,
        sortKey: sortKey
      };
    }

    months[monthKey].expenses += invoice.amount;
  });

  // Calculate profit for each month
  Object.values(months).forEach(month => {
    month.profit = month.revenue - month.expenses;
  });

  // Convert to array, sort by date, and limit to last 6 months
  return Object.values(months)
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ month, revenue, expenses, profit }) => ({ month, revenue, expenses, profit }));
}

// Helper function to generate expense breakdown by category
function generateExpensesByCategory(vendorInvoices: any[]) {
  const categories: Record<string, number> = {};

  // Group expenses by vendor service type
  vendorInvoices.forEach(invoice => {
    const serviceType = invoice.service_type || 'Other';

    if (!categories[serviceType]) {
      categories[serviceType] = 0;
    }

    categories[serviceType] += invoice.amount;
  });

  // Convert to array format for pie chart
  return Object.entries(categories).map(([name, value]) => ({
    name,
    value
  }));
}

// Helper function to generate campaign performance data
function generateCampaignPerformanceData(campaigns: any[], customerInvoices: any[], vendorInvoices: any[]) {
  // Create a map of campaign IDs to their data
  const campaignMap: Record<string, { name: string, revenue: number, expenses: number, profit: number }> = {};

  // Initialize with campaign names
  campaigns.forEach(campaign => {
    campaignMap[campaign.id] = {
      name: campaign.name,
      revenue: 0,
      expenses: 0,
      profit: 0
    };
  });

  // Add revenue from customer invoices
  customerInvoices.forEach(invoice => {
    if (invoice.campaign_id && campaignMap[invoice.campaign_id]) {
      campaignMap[invoice.campaign_id].revenue += invoice.amount;
    }
  });

  // Add expenses from vendor invoices
  vendorInvoices.forEach(invoice => {
    if (invoice.campaign_id && campaignMap[invoice.campaign_id]) {
      campaignMap[invoice.campaign_id].expenses += invoice.amount;
    }
  });

  // Calculate profit for each campaign
  Object.values(campaignMap).forEach(campaign => {
    campaign.profit = campaign.revenue - campaign.expenses;
  });

  // Convert to array and return top 5 campaigns by revenue
  return Object.values(campaignMap)
    .filter(campaign => campaign.revenue > 0 || campaign.expenses > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [profitTrend, setProfitTrend] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [customerInvoiceStats, setCustomerInvoiceStats] = useState({
    paid: 0,
    pending: 0,
    overdue: 0
  });
  const [vendorInvoiceStats, setVendorInvoiceStats] = useState({
    paid: 0,
    pending: 0,
    overdue: 0
  });

  // State for expense breakdown chart
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // Fetch real data from Supabase
        const [campaignsData, customerInvoicesData, vendorInvoicesData] = await Promise.all([
          getCampaigns(),
          getCustomerInvoices(),
          getVendorInvoices()
        ]);

        // Calculate total revenue, expenses, and profit
        const totalRevenue = customerInvoicesData.reduce((sum, invoice) => sum + invoice.amount, 0);
        const totalExpenses = vendorInvoicesData.reduce((sum, invoice) => sum + invoice.amount, 0);
        const netProfit = totalRevenue - totalExpenses;

        // Log all campaign data for debugging
        console.log('All campaigns data:', JSON.stringify(campaignsData, null, 2));

        // Count active campaigns - handle case sensitivity and log each campaign status
        const activeCampaigns = campaignsData.filter(campaign => {
          const isActive = campaign.status &&
            (campaign.status.toLowerCase() === 'active' ||
             campaign.status.toUpperCase() === 'ACTIVE' ||
             campaign.status === 'Active');

          console.log(`Campaign ${campaign.id} - ${campaign.name} - Status: "${campaign.status}" - Is Active: ${isActive}`);
          return isActive;
        });

        // Count of active campaigns
        const activeCampaignsCount = activeCampaigns.length;

        console.log('Active campaigns count:', activeCampaignsCount);
        console.log('Active campaigns:', activeCampaigns.map(c => c.name));
        console.log('All campaign statuses:', campaignsData.map(c => `"${c.status}"`));

        // Calculate invoice statistics
        const customerInvoiceStats = {
          paid: customerInvoicesData.filter(invoice => invoice.status === 'paid')
            .reduce((sum, invoice) => sum + invoice.amount, 0),
          pending: customerInvoicesData.filter(invoice => invoice.status === 'pending')
            .reduce((sum, invoice) => sum + invoice.amount, 0),
          overdue: customerInvoicesData.filter(invoice => invoice.status === 'overdue')
            .reduce((sum, invoice) => sum + invoice.amount, 0)
        };

        const vendorInvoiceStats = {
          paid: vendorInvoicesData.filter(invoice => invoice.status === 'paid')
            .reduce((sum, invoice) => sum + invoice.amount, 0),
          pending: vendorInvoicesData.filter(invoice => invoice.status === 'pending')
            .reduce((sum, invoice) => sum + invoice.amount, 0),
          overdue: vendorInvoicesData.filter(invoice => invoice.status === 'overdue')
            .reduce((sum, invoice) => sum + invoice.amount, 0)
        };

        // Generate chart data
        // Group invoices by month for the chart
        const monthlyData = generateMonthlyData(customerInvoicesData, vendorInvoicesData);
        const expensesByCategory = generateExpensesByCategory(vendorInvoicesData);

        // Update state with calculated values
        setTotalRevenue(totalRevenue);
        setTotalExpenses(totalExpenses);
        setNetProfit(netProfit);
        setActiveCampaigns(activeCampaignsCount);
        setCustomerInvoiceStats(customerInvoiceStats);
        setVendorInvoiceStats(vendorInvoiceStats);
        setCampaignData(generateCampaignPerformanceData(campaignsData, customerInvoicesData, vendorInvoicesData));
        setProfitTrend(monthlyData);
        setExpenseBreakdown(expensesByCategory);

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your marketing campaigns and financial performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0
                ? `From ${customerInvoiceStats.paid + customerInvoiceStats.pending + customerInvoiceStats.overdue > 0
                    ? `${Object.values(customerInvoiceStats).filter(val => val > 0).length} invoice types`
                    : 'customer invoices'}`
                : 'No revenue data yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalExpenses > 0
                ? `From ${vendorInvoiceStats.paid + vendorInvoiceStats.pending + vendorInvoiceStats.overdue > 0
                    ? `${Object.values(vendorInvoiceStats).filter(val => val > 0).length} invoice types`
                    : 'vendor invoices'}`
                : 'No expense data yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{netProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {netProfit !== 0
                ? netProfit > 0
                  ? `${((netProfit / totalRevenue) * 100).toFixed(1)}% profit margin`
                  : `Loss of ${Math.abs(((netProfit / totalRevenue) * 100)).toFixed(1)}%`
                : 'No profit data yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {activeCampaigns > 0
                ? `${activeCampaigns} active campaign${activeCampaigns > 1 ? 's' : ''}`
                : 'No active campaigns yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
                <CardDescription>
                  Monthly profit over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  </div>
                ) : profitTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        name="Revenue"
                        dataKey="revenue"
                        stroke="#0088FE"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        name="Expenses"
                        dataKey="expenses"
                        stroke="#00C49F"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        name="Profit"
                        dataKey="profit"
                        stroke="#FF8042"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-muted-foreground">No profit data available yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Create campaigns and add invoices to see profit trends</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  Expenses by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  </div>
                ) : expenseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[
                              '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
                              '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'
                            ][index % 8]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-muted-foreground">No expense data available yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Add vendor invoices to see expense breakdown</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Revenue, expenses, and profit by campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading data...</p>
                  </div>
                </div>
              ) : campaignData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={campaignData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Bar name="Revenue" dataKey="revenue" fill="#0088FE" />
                    <Bar name="Expenses" dataKey="expenses" fill="#00C49F" />
                    <Bar name="Profit" dataKey="profit" fill="#FF8042" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground">No campaign data available yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Create campaigns and add invoices to see performance data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status</CardTitle>
              <CardDescription>
                Overview of customer and vendor invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Customer Invoices</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Paid</span>
                      <span className="text-sm font-medium">₹{customerInvoiceStats.paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending</span>
                      <span className="text-sm font-medium">₹{customerInvoiceStats.pending.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Overdue</span>
                      <span className="text-sm font-medium">₹{customerInvoiceStats.overdue.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Vendor Invoices</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Paid</span>
                      <span className="text-sm font-medium">₹{vendorInvoiceStats.paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending</span>
                      <span className="text-sm font-medium">₹{vendorInvoiceStats.pending.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Overdue</span>
                      <span className="text-sm font-medium">₹{vendorInvoiceStats.overdue.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
