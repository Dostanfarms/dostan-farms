
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import CustomerEditDialog from '@/components/customers/CustomerEditDialog';
import CustomerOrdersDialog from '@/components/customers/CustomerOrdersDialog';

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  dateRegistered: string;
}

const Customers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingOrders, setViewingOrders] = useState<Customer | null>(null);

  useEffect(() => {
    // Load customers from localStorage
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      try {
        setCustomers(JSON.parse(savedCustomers));
      } catch (error) {
        console.error('Error parsing customers:', error);
        setCustomers([]);
      }
    }
  }, []);

  const handleDeleteCustomer = (customerId: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== customerId);
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    
    toast({
      title: "Customer Deleted",
      description: "Customer has been successfully removed.",
    });
  };

  const handleEditCustomer = (updatedCustomer: Customer) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    );
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    setEditingCustomer(null);
    
    toast({
      title: "Customer Updated",
      description: "Customer details have been successfully updated.",
    });
  };

  return (
    <div className="container mx-auto p-4 min-h-screen max-h-screen flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Customer Management</h1>
      </div>
      
      {/* Mobile sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b pb-4">
                <span className="text-lg font-bold">AgriPay Admin</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto"
                  onClick={() => setMenuOpen(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                className="flex items-center justify-start gap-2"
                onClick={() => {
                  navigate(-1);
                  setMenuOpen(false);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="flex-1 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registered Customers</CardTitle>
            <Badge variant="secondary">
              {customers.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[calc(100vh-200px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Date Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No customers registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.mobile}</TableCell>
                      <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                      <TableCell>{new Date(customer.dateRegistered).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingOrders(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      {editingCustomer && (
        <CustomerEditDialog
          customer={editingCustomer}
          open={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={handleEditCustomer}
        />
      )}

      {/* View Orders Dialog */}
      {viewingOrders && (
        <CustomerOrdersDialog
          customer={viewingOrders}
          open={!!viewingOrders}
          onClose={() => setViewingOrders(null)}
        />
      )}
    </div>
  );
};

export default Customers;
