'use client';

import { useState, useEffect } from 'react';
import { getCustomers, createCustomer } from '@/lib/supabase';
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
  FileText
} from 'lucide-react';



export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [editCustomer, setEditCustomer] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const customersData = await getCustomers();
        setCustomers(customersData);
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customers and their campaign associations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Add a new customer to your database.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="company">Company Name</label>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={newCustomer.company}
                  onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="contact-name">Contact Name</label>
                <Input
                  id="contact-name"
                  placeholder="Enter contact name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="phone">Phone</label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsNewCustomerOpen(false);
                  setNewCustomer({
                    name: '',
                    email: '',
                    phone: '',
                    company: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting || !newCustomer.name || !newCustomer.company}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    // Validate form data
                    if (!newCustomer.name) {
                      alert('Contact name is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newCustomer.company) {
                      alert('Company name is required');
                      setIsSubmitting(false);
                      return;
                    }

                    console.log('Submitting customer data:', newCustomer);

                    const customer = await createCustomer({
                      name: newCustomer.name,
                      email: newCustomer.email,
                      phone: newCustomer.phone,
                      company: newCustomer.company
                    });

                    if (customer) {
                      console.log('Customer created successfully:', customer);

                      // Refresh customers list
                      const customersData = await getCustomers();
                      setCustomers(customersData);

                      // Reset form and close dialog
                      setNewCustomer({
                        name: '',
                        email: '',
                        phone: '',
                        company: ''
                      });
                      setIsNewCustomerOpen(false);

                      alert('Customer created successfully!');
                    } else {
                      alert('Failed to create customer. Please check the console for details.');
                    }
                  } catch (error) {
                    console.error('Error creating customer:', error);
                    alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? 'Creating...' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-company">Company Name</label>
              <Input
                id="edit-company"
                placeholder="Enter company name"
                value={editCustomer.company}
                onChange={(e) => setEditCustomer({...editCustomer, company: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-contact-name">Contact Name</label>
              <Input
                id="edit-contact-name"
                placeholder="Enter contact name"
                value={editCustomer.name}
                onChange={(e) => setEditCustomer({...editCustomer, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-email">Email</label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={editCustomer.email}
                onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-phone">Phone</label>
              <Input
                id="edit-phone"
                placeholder="Enter phone number"
                value={editCustomer.phone}
                onChange={(e) => setEditCustomer({...editCustomer, phone: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditCustomerOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting || !editCustomer.name || !editCustomer.company}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  // Validate form data
                  if (!editCustomer.name) {
                    alert('Contact name is required');
                    setIsSubmitting(false);
                    return;
                  }

                  if (!editCustomer.company) {
                    alert('Company name is required');
                    setIsSubmitting(false);
                    return;
                  }

                  console.log('Updating customer data:', editCustomer);

                  // In a real app, you would update the customer in the database
                  alert(`Customer updated: ${editCustomer.company}`);

                  // Refresh customers list
                  const customersData = await getCustomers();
                  setCustomers(customersData);

                  // Close dialog
                  setIsEditCustomerOpen(false);
                } catch (error) {
                  console.error('Error updating customer:', error);
                  alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading customers...</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <div>
                      {customer.company}
                      <p className="text-sm text-muted-foreground md:hidden">
                        {customer.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.phone}
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
                          // Navigate to invoices page with customer filter
                          window.location.href = `/invoices?customer=${customer.id}`;
                        }}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Invoices
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          // Set the selected customer for editing
                          setSelectedCustomer(customer);
                          setEditCustomer({
                            id: customer.id,
                            name: customer.name,
                            email: customer.email,
                            phone: customer.phone,
                            company: customer.company
                          });
                          setIsEditCustomerOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Customer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${customer.company}?`)) {
                              try {
                                setLoading(true);
                                // In a real app, you would delete the customer from the database
                                alert(`Deleting customer: ${customer.company}`);

                                // Refresh the customers list
                                const customersData = await getCustomers();
                                setCustomers(customersData);
                              } catch (error) {
                                console.error('Error deleting customer:', error);
                                alert('Failed to delete customer');
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No customers found. Add your first customer to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
