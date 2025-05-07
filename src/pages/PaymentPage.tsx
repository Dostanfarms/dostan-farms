
import React, { useState, useEffect, useRef } from 'react';
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
  Minus,
  Printer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/utils/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const printReceiptRef = useRef<HTMLDivElement>(null);
  
  // Get customer data from localStorage
  const customerString = localStorage.getItem('currentCustomer');
  const customer = customerString ? JSON.parse(customerString) : null;
  
  // Load cart items from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('customerCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Local state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
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
    localStorage.setItem('customerCart', JSON.stringify(cartItems));
  };
  
  const decreaseQuantity = (productId: string) => {
    setCartItems(prev => 
      prev.map(item => 
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
    localStorage.setItem('customerCart', JSON.stringify(cartItems));
  };
  
  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
    localStorage.setItem('customerCart', JSON.stringify(
      cartItems.filter(item => item.productId !== productId)
    ));
  };
  
  // Calculate subtotal, taxes and total
  const subtotal = cartItems.reduce((total, item) => 
    total + (item.quantity * item.pricePerUnit), 0);
  
  const taxRate = 0.05; // 5% tax
  const taxAmount = subtotal * taxRate;
  const deliveryFee = 30; // Fixed delivery fee
  const total = subtotal + taxAmount + deliveryFee - discount;

  // Print receipt function
  const printReceipt = () => {
    if (!orderId) return;
    
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      const currentDate = new Date().toLocaleString();
      
      // Create receipt HTML content
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt #${orderId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .receipt {
              border: 1px solid #ddd;
              padding: 20px;
              margin-bottom: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .customer-info {
              margin-bottom: 20px;
              padding: 10px;
              background-color: #f9f9f9;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .totals {
              margin-top: 20px;
              text-align: right;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>AgriPay</h1>
              <p>Order Receipt</p>
              <p>Order #${orderId}</p>
              <p>${currentDate}</p>
            </div>
            
            <div class="customer-info">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${customer.name}</p>
              <p><strong>Address:</strong> ${customer.address}</p>
              <p><strong>Phone:</strong> ${customer.mobile}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</p>
            </div>
            
            <h3>Order Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${cartItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity} ${item.unit}</td>
                    <td>₹${item.pricePerUnit}</td>
                    <td>₹${item.quantity * item.pricePerUnit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
              <p><strong>Tax (5%):</strong> ₹${taxAmount.toFixed(2)}</p>
              <p><strong>Delivery Fee:</strong> ₹${deliveryFee.toFixed(2)}</p>
              ${discount > 0 ? `<p><strong>Discount:</strong> -₹${discount.toFixed(2)}</p>` : ''}
              <h3>Total: ₹${total.toFixed(2)}</h3>
            </div>
            
            <div class="footer">
              <p>Thank you for shopping with AgriPay!</p>
              <p>For any queries, please contact support@agripay.com</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print();" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">
              Print Receipt
            </button>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
    } else {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your browser settings.",
        variant: "destructive"
      });
    }
  };
  
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
      const newOrderId = `ORD${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(newOrderId);
      
      const order = {
        id: newOrderId,
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
      
      // Clear cart
      localStorage.setItem('customerCart', JSON.stringify([]));
      
      setIsProcessing(false);
      
      // Show success message
      toast({
        title: "Order placed successfully",
        description: `Your order #${order.id} has been placed`
      });
      
      // Navigate to order receipt
      navigate(`/order-receipt/${order.id}`);
    }, 2000);
  };
  
  return (
    <ScrollArea className="min-h-screen h-full">
      <div className="min-h-screen bg-muted/30 p-4">
        <header className="container mx-auto max-w-md mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/cart')}
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
                <span>Order Summary</span>
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
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm">{customer.address}</p>
                <p className="text-sm">Pincode: {customer.pincode}</p>
                <p className="text-sm">Phone: {customer.mobile}</p>
              </div>
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
                <span>Payment Details</span>
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
            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full bg-agri-primary hover:bg-agri-secondary"
                onClick={handleCheckout}
                disabled={isProcessing || cartItems.length === 0}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
              
              {orderId && (
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={printReceipt}
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Hidden receipt for printing */}
          <div className="hidden" ref={printReceiptRef}></div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default PaymentPage;
