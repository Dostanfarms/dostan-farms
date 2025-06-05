
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Wallet, Banknote, Tag } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  isActive: boolean;
  minAmount?: number;
}

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { cartItems, total } = location.state as { cartItems: CartItem[]; total: number } || { cartItems: [], total: 0 };
  
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [finalTotal, setFinalTotal] = useState(total);

  useEffect(() => {
    // Load coupons from localStorage
    const storedCoupons = localStorage.getItem('coupons');
    if (storedCoupons) {
      setCoupons(JSON.parse(storedCoupons));
    }
  }, []);

  useEffect(() => {
    // Calculate final total with coupon discount
    if (appliedCoupon) {
      let discount = 0;
      if (appliedCoupon.type === 'percentage') {
        discount = total * (appliedCoupon.discount / 100);
      } else {
        discount = appliedCoupon.discount;
      }
      setFinalTotal(Math.max(0, total - discount));
    } else {
      setFinalTotal(total);
    }
  }, [appliedCoupon, total]);

  const handleApplyCoupon = () => {
    const coupon = coupons.find(c => 
      c.code.toLowerCase() === couponCode.toLowerCase() && 
      c.isActive &&
      (!c.minAmount || total >= c.minAmount)
    );
    
    if (coupon) {
      setAppliedCoupon(coupon);
      toast({
        title: "Coupon Applied",
        description: `${coupon.type === 'percentage' ? coupon.discount + '%' : '₹' + coupon.discount} discount applied`,
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "Coupon code is invalid or doesn't meet minimum requirements",
        variant: "destructive"
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast({
      title: "Coupon Removed",
      description: "Discount has been removed",
    });
  };

  const handlePayment = () => {
    if (!customerName.trim() || !customerMobile.trim() || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "No items to process",
        variant: "destructive"
      });
      return;
    }

    // Create transaction record
    const transaction = {
      id: Date.now().toString(),
      customerName,
      customerMobile,
      items: cartItems,
      subtotal: total,
      discount: appliedCoupon ? (appliedCoupon.type === 'percentage' ? total * (appliedCoupon.discount / 100) : appliedCoupon.discount) : 0,
      total: finalTotal,
      paymentMethod,
      couponUsed: appliedCoupon?.code || null,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    // Save transaction to localStorage
    const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    existingTransactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(existingTransactions));

    toast({
      title: "Payment Successful",
      description: "Transaction completed successfully",
    });

    // Navigate to order receipt or back to sales dashboard
    navigate('/order-receipt', { 
      state: { transaction }
    });
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No items in cart</p>
            <Button onClick={() => navigate('/sales-dashboard')}>
              Back to Sales Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Payment</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerMobile">Mobile Number *</Label>
                <Input
                  id="customerMobile"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Card
                      </div>
                    </SelectItem>
                    <SelectItem value="upi">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        UPI
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Coupon Section */}
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    disabled={appliedCoupon !== null}
                  />
                  {appliedCoupon ? (
                    <Button variant="outline" onClick={handleRemoveCoupon}>
                      Remove
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleApplyCoupon}>
                      Apply
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <Tag className="h-3 w-3" />
                    {appliedCoupon.code} - {appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}%` : `₹${appliedCoupon.discount}`} off
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>-₹{(total - finalTotal).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6"
                  onClick={handlePayment}
                  disabled={!customerName || !customerMobile || !paymentMethod}
                >
                  Complete Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
