'use client';

import { useState, useEffect } from 'react';
import { getVendors, createVendor } from '@/lib/supabase';
import { deleteVendor } from '@/lib/supabase-delete';
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
  FileText,
  Tag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';



export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewVendorOpen, setIsNewVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: ''
  });
  const [editVendor, setEditVendor] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    service_type: ''
  });

  useEffect(() => {
    async function loadVendors() {
      setLoading(true);
      try {
        const vendorsData = await getVendors();
        setVendors(vendorsData);
      } catch (error) {
        console.error('Error loading vendors:', error);
      } finally {
        setLoading(false);
      }
    }

    loadVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.service_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getServiceTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'social media':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'email marketing':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'content creation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'seo':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'video production':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
        <p className="text-muted-foreground">
          Manage your vendors and service providers.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vendors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isNewVendorOpen} onOpenChange={setIsNewVendorOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Add a new vendor or service provider to your database.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Vendor Name</label>
                <Input
                  id="name"
                  placeholder="Enter vendor name"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="service-type">Service Type</label>
                <Input
                  id="service-type"
                  placeholder="Enter service type"
                  value={newVendor.service_type}
                  onChange={(e) => setNewVendor({...newVendor, service_type: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="phone">Phone</label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsNewVendorOpen(false);
                  setNewVendor({
                    name: '',
                    email: '',
                    phone: '',
                    service_type: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting || !newVendor.name || !newVendor.service_type}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    // Validate form data
                    if (!newVendor.name) {
                      alert('Vendor name is required');
                      setIsSubmitting(false);
                      return;
                    }

                    if (!newVendor.service_type) {
                      alert('Service type is required');
                      setIsSubmitting(false);
                      return;
                    }

                    console.log('Submitting vendor data:', newVendor);

                    const vendor = await createVendor({
                      name: newVendor.name,
                      email: newVendor.email,
                      phone: newVendor.phone,
                      service_type: newVendor.service_type
                    });

                    if (vendor) {
                      console.log('Vendor created successfully:', vendor);

                      // Refresh vendors list
                      const vendorsData = await getVendors();
                      setVendors(vendorsData);

                      // Reset form and close dialog
                      setNewVendor({
                        name: '',
                        email: '',
                        phone: '',
                        service_type: ''
                      });
                      setIsNewVendorOpen(false);

                      alert('Vendor created successfully!');
                    } else {
                      alert('Failed to create vendor. Please check the console for details.');
                    }
                  } catch (error) {
                    console.error('Error creating vendor:', error);
                    alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? 'Creating...' : 'Add Vendor'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update vendor information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-name">Vendor Name</label>
              <Input
                id="edit-name"
                placeholder="Enter vendor name"
                value={editVendor.name}
                onChange={(e) => setEditVendor({...editVendor, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-service-type">Service Type</label>
              <Input
                id="edit-service-type"
                placeholder="Enter service type"
                value={editVendor.service_type}
                onChange={(e) => setEditVendor({...editVendor, service_type: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-email">Email</label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={editVendor.email}
                onChange={(e) => setEditVendor({...editVendor, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-phone">Phone</label>
              <Input
                id="edit-phone"
                placeholder="Enter phone number"
                value={editVendor.phone}
                onChange={(e) => setEditVendor({...editVendor, phone: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditVendorOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting || !editVendor.name || !editVendor.service_type}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  // Validate form data
                  if (!editVendor.name) {
                    alert('Vendor name is required');
                    setIsSubmitting(false);
                    return;
                  }

                  if (!editVendor.service_type) {
                    alert('Service type is required');
                    setIsSubmitting(false);
                    return;
                  }

                  console.log('Updating vendor data:', editVendor);

                  // In a real app, you would update the vendor in the database
                  alert(`Vendor updated: ${editVendor.name}`);

                  // Refresh vendors list
                  const vendorsData = await getVendors();
                  setVendors(vendorsData);

                  // Close dialog
                  setIsEditVendorOpen(false);
                } catch (error) {
                  console.error('Error updating vendor:', error);
                  alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Vendor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading vendors...</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">
                    <div>
                      {vendor.name}
                      <p className="text-sm text-muted-foreground md:hidden">
                        {vendor.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getServiceTypeColor(vendor.service_type)}>
                      {vendor.service_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {vendor.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {vendor.phone}
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
                          // Navigate to invoices page with vendor filter
                          window.location.href = `/invoices?vendor=${vendor.id}`;
                        }}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Invoices
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          // Navigate to campaigns page with vendor filter
                          window.location.href = `/campaigns?vendor=${vendor.id}`;
                        }}>
                          <Tag className="mr-2 h-4 w-4" />
                          View Campaigns
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          // Set the selected vendor for editing
                          setSelectedVendor(vendor);
                          setEditVendor({
                            id: vendor.id,
                            name: vendor.name,
                            email: vendor.email,
                            phone: vendor.phone,
                            service_type: vendor.service_type
                          });
                          setIsEditVendorOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Vendor
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
                              try {
                                setLoading(true);
                                // Delete the vendor from the database
                                const result = await deleteVendor(vendor.id);

                                if (result.success) {
                                  alert(result.message);

                                  // Refresh the vendors list
                                  const vendorsData = await getVendors();
                                  setVendors(vendorsData);
                                } else {
                                  alert(result.message);
                                }
                              } catch (error) {
                                console.error('Error deleting vendor:', error);
                                alert('Failed to delete vendor');
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Vendor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No vendors found. Add your first vendor to get started.
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
