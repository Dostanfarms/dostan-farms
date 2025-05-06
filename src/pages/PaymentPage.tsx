
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  ArrowLeft, 
  CreditCard,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/utils/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get customer data from localStorage
  const customerString = localStorage.getItem('currentCustomer');
  const customer = customerString ? JSON.parse(customerString) : null;
  
  // Local state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      productId: 'prod_1',
      name: 'Organic Tomatoes',
      quantity: 2,
      pricePerUnit: 50,
      unit: 'kg',
      category: 'Vegetables'
    },
    {
      productId: 'prod_2',
      name: 'Fresh Potatoes',
      quantity: 1,
      pricePerUnit: 30,
      unit: 'kg',
      category: 'Vegetables'
    }
  ]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!customer) {
      navigate('/customer-login');
    }
  }, [customer, navigate]);
  
  if (!customer) {
    return null; // Redirect handled in useEffect
  }
  
  // Functions to update cart
  const increaseQuantity = (productId: string) => {
    setCartItems(prev => 
      prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };
  
  const decreaseQuantity = (productId: string) => {
    setCartItems(prev => 
      prev.map(item => 
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };
  
  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };
  
  // Calculate subtotal, taxes and total
  const subtotal = cartItems.reduce((total, item) => 
    total + (item.quantity * item.pricePerUnit), 0);
  
  const taxRate = 0.05; // 5% tax
  const taxAmount = subtotal * taxRate;
  const deliveryFee = 30; // Fixed delivery fee
  const total = subtotal + taxAmount + deliveryFee - discount;
  
  // Handle coupon application
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Missing coupon code",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate coupon validation (in a real app, this would check the database)
    if (couponCode.toUpperCase() === 'WELCOME200') {
      // Apply flat discount
      setDiscount(200);
      toast({
        title: "Coupon applied",
        description: "₹200 discount has been applied to your order"
      });
    } else if (couponCode.toUpperCase() === 'SUMMER10') {
      // Apply percentage discount (10% with max limit of 500)
      const discountAmount = Math.min(subtotal * 0.1, 500);
      setDiscount(discountAmount);
      toast({
        title: "Coupon applied",
        description: `₹${discountAmount} discount has been applied to your order`
      });
    } else {
      toast({
        title: "Invalid coupon",
        description: "The coupon code you entered is invalid",
        variant: "destructive"
      });
    }
  };
  
  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate checkout process
    setTimeout(() => {
      // Create order object
      const order = {
        id: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
        customerId: customer.id,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.quantity * item.pricePerUnit
        })),
        totalAmount: total,
        status: 'placed',
        date: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        paymentMethod
      };
      
      // Store order (in a real app, this would save to the database)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      setIsProcessing(false);
      
      // Show success message
      toast({
        title: "Order placed successfully",
        description: `Your order #${order.id} has been placed`
      });
      
      // Navigate to order tracking
      navigate(`/order-tracking/${order.id}`);
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <header className="container mx-auto max-w-md mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/customer-home')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-agri-primary" />
            <span className="text-lg font-bold">AgriPay</span>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto max-w-md">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Cart Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <ul className="divide-y">
                {cartItems.map((item) => (
                  <li key={item.productId} className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.name}</span>
                      <span>₹{item.pricePerUnit}/{item.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => decreaseQuantity(item.productId)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => increaseQuantity(item.productId)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">₹{item.quantity * item.pricePerUnit}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Apply Coupon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button
                variant="outline"
                onClick={applyCoupon}
              >
                Apply
              </Button>
            </div>
            {discount > 0 && (
              <p className="mt-2 text-sm text-green-600">
                Coupon applied: ₹{discount} discount
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={paymentMethod}
              onValueChange={(value: 'cash' | 'online') => setPaymentMethod(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash on Delivery</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span>Order Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t mt-2">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-agri-primary hover:bg-agri-secondary"
              onClick={handleCheckout}
              disabled={isProcessing || cartItems.length === 0}
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
