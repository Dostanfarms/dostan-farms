
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  CheckCircle,
  ShoppingBag,
  Truck
} from 'lucide-react';
import { format } from 'date-fns';
import { Order } from '@/utils/types';

const OrderReceiptPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  
  // Get customer data from localStorage
  const customerString = localStorage.getItem('currentCustomer');
  const customer = customerString ? JSON.parse(customerString) : null;
  
  // Load order data
  useEffect(() => {
    if (id) {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = orders.find((o: Order) => o.id === id);
      setOrder(foundOrder || null);
    }
  }, [id]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!customer) {
      navigate('/customer-login');
    }
  }, [customer, navigate]);
  
  if (!customer || !order) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">Order not found</h3>
              <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist</p>
              <Button 
                onClick={() => navigate('/order-history')}
                className="bg-agri-primary hover:bg-agri-secondary"
              >
                Go to Order History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="container mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-2">
              <div className="bg-green-100 text-green-600 rounded-full p-3">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <p className="text-muted-foreground">Your order has been placed successfully</p>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Order Details
              </h3>
              <div className="bg-muted rounded-lg p-3">
                <p><span className="font-medium">Order ID:</span> #{order.id}</p>
                <p><span className="font-medium">Date:</span> {format(new Date(order.date), 'dd MMM yyyy')}</p>
                <p><span className="font-medium">Payment Method:</span> {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Delivery Information
              </h3>
              <div className="bg-muted rounded-lg p-3">
                <p><span className="font-medium">Delivery Address:</span></p>
                <p>{customer.name}</p>
                <p>{customer.address}</p>
                <p>PIN: {customer.pincode}</p>
                <p>Phone: {customer.mobile}</p>
                
                <div className="mt-3">
                  <p><span className="font-medium">Estimated Delivery:</span></p>
                  <p>{order.estimatedDelivery ? format(new Date(order.estimatedDelivery), 'dd MMM yyyy') : 'To be determined'}</p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate(`/order-tracking/${order.id}`)}
              className="w-full bg-agri-primary hover:bg-agri-secondary"
            >
              Track Order
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/customer-home')}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OrderReceiptPage;
