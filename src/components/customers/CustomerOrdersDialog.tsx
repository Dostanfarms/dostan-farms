
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  dateRegistered: string;
}

interface Order {
  id: string;
  customerId: string;
  items: any[];
  total: number;
  status: string;
  date: string;
}

interface CustomerOrdersDialogProps {
  customer: Customer;
  open: boolean;
  onClose: () => void;
}

const CustomerOrdersDialog = ({ customer, open, onClose }: CustomerOrdersDialogProps) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load orders for this customer from localStorage
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const allOrders = JSON.parse(savedOrders);
        const customerOrders = allOrders.filter((order: Order) => order.customerId === customer.id);
        setOrders(customerOrders);
      } catch (error) {
        console.error('Error parsing orders:', error);
        setOrders([]);
      }
    }
  }, [customer.id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Orders for {customer.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>Customer:</strong> {customer.name}</p>
            <p><strong>Mobile:</strong> {customer.mobile}</p>
            <p><strong>Email:</strong> {customer.email}</p>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for this customer
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order History ({orders.length})</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>{order.items.length} item(s)</TableCell>
                      <TableCell>₹{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerOrdersDialog;
