
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Smartphone, IndianRupee, Tag } from 'lucide-react';
import QRCode from 'react-qr-code';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minAmount: number;
  maxDiscount?: number;
  description: string;
  isActive: boolean;
  expiryDate: string;
}

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { cartItems = [], total = 0 } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('upi');
  const [cashAmount, setCashAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [finalTotal, setFinalTotal] = useState(total);
  
  // Load coupons from localStorage
  useEffect(() => {
    const storedCoupons = localStorage.getItem('coupons');
    if (storedCoupons) {
      try {
        const coupons = JSON.parse(storedCoupons);
        const activeCoupons = coupons.filter((coupon: Coupon) => coupon.isActive);
        setAvailableCoupons(activeCoupons);
      } catch (error) {
        console.error('Error loading coupons:', error);
      }
    }
  }, []);

  // Recalculate total when coupon is applied
  useEffect(() => {
    if (appliedCoupon) {
      let discount = 0;
      if (appliedCoupon.type === 'percentage') {
        discount = (total * appliedCoupon.discount) / 100;
        if (appliedCoupon.maxDiscount) {
          discount = Math.min(discount, appliedCoupon.maxDiscount);
        }
      } else {
        discount = appliedCoupon.discount;
      }
      setFinalTotal(Math.max(0, total - discount));
    } else {
      setFinalTotal(total);
    }
  }, [appliedCoupon, total]);

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Enter coupon code",
        description: "Please enter a coupon code to apply",
        variant: "destructive"
      });
      return;
    }

    const coupon = availableCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
    
    if (!coupon) {
      toast({
        title: "Invalid coupon",
        description: "The coupon code you entered is not valid or has expired",
        variant: "destructive"
      });
      return;
    }

    if (total < coupon.minAmount) {
      toast({
        title: "Minimum amount not met",
        description: `This coupon requires a minimum order amount of ₹${coupon.minAmount}`,
        variant: "destructive"
      });
      return;
    }

    setAppliedCoupon(coupon);
    toast({
      title: "Coupon applied!",
      description: `${coupon.description} has been applied to your order`,
    });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order",
    });
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    
    let discount = 0;
    if (appliedCoupon.type === 'percentage') {
      discount = (total * appliedCoupon.discount) / 100;
      if (appliedCoupon.maxDiscount) {
        discount = Math.min(discount, appliedCoupon.maxDiscount);
      }
    } else {
      discount = appliedCoupon.discount;
    }
    return discount;
  };

  const handlePayment = () => {
    // Validate customer info
    if (!customerName.trim()) {
      toast({
        title: "Customer name required",
        description: "Please enter the customer's name",
        variant: "destructive"
      });
      return;
    }

    if (!customerMobile.trim() || !/^[6-9]\d{9}$/.test(customerMobile)) {
      toast({
        title: "Valid mobile number required",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'cash') {
      const cash = parseFloat(cashAmount);
      if (isNaN(cash) || cash < finalTotal) {
        toast({
          title: "Insufficient cash",
          description: "Please enter a valid cash amount",
          variant: "destructive"
        });
        return;
      }
    }

    // Process payment
    const orderData = {
      id: `order-${Date.now()}`,
      items: cartItems,
      customer: {
        name: customerName,
        mobile: customerMobile
      },
      subtotal: total,
      coupon: appliedCoupon,
      discount: getDiscountAmount(),
      total: finalTotal,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? parseFloat(cashAmount) : finalTotal,
      change: paymentMethod === 'cash' ? parseFloat(cashAmount) - finalTotal : 0,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    // Save order to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Navigate to receipt page
    navigate('/order-receipt', { 
      state: { orderData },
      replace: true 
    });

    toast({
      title: "Payment successful",
      description: `Order completed successfully. Total: ₹${finalTotal.toFixed(2)}`,
    });
  };

  const generateUpiPaymentUri = () => {
    return `upi://pay?pa=2755c@ybl&pn=DostanfarmsStore&am=${finalTotal.toFixed(2)}&cu=INR&tn=Order payment for ${customerName}`;
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No items to pay for</h2>
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => navigate('/customer-home')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Payment</h1>
        </div>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerMobile">Mobile Number *</Label>
                  <Input
                    id="customerMobile"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apply Coupons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Apply Coupon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1"
                  />
                  <Button onClick={applyCoupon} variant="outline">
                    Apply
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">{appliedCoupon.code}</div>
                    <div className="text-sm text-green-600">{appliedCoupon.description}</div>
                    <div className="text-sm text-green-600">
                      Discount: ₹{getDiscountAmount().toFixed(2)}
                    </div>
                  </div>
                  <Button onClick={removeCoupon} variant="outline" size="sm">
                    Remove
                  </Button>
                </div>
              )}

              {availableCoupons.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Available Coupons:</Label>
                  <div className="grid gap-2 mt-2">
                    {availableCoupons.slice(0, 3).map((coupon) => (
                      <div key={coupon.id} className="p-2 border rounded-lg bg-blue-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <Badge variant="secondary" className="text-xs">{coupon.code}</Badge>
                            <div className="text-xs text-muted-foreground mt-1">{coupon.description}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCouponCode(coupon.code);
                              applyCoupon();
                            }}
                            disabled={total < coupon.minAmount}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cartItems.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{getDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('upi')}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Smartphone className="h-6 w-6 mb-2" />
                  <span className="text-sm">UPI</span>
                </Button>
                
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <IndianRupee className="h-6 w-6 mb-2" />
                  <span className="text-sm">Cash</span>
                </Button>
                
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <CreditCard className="h-6 w-6 mb-2" />
                  <span className="text-sm">Card</span>
                </Button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    <QRCode value={generateUpiPaymentUri()} size={200} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scan QR code with any UPI app to pay ₹{finalTotal.toFixed(2)}
                  </p>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <Label htmlFor="cashAmount">Cash Received</Label>
                  <Input
                    id="cashAmount"
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Enter cash amount"
                    min={finalTotal}
                    step="0.01"
                  />
                  {cashAmount && parseFloat(cashAmount) >= finalTotal && (
                    <div className="text-sm text-muted-foreground">
                      Change: ₹{(parseFloat(cashAmount) - finalTotal).toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="text-center p-8 bg-muted rounded-lg">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Please insert or swipe the card on the terminal
                  </p>
                  <p className="text-lg font-semibold mt-2">₹{finalTotal.toFixed(2)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            onClick={handlePayment} 
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            size="lg"
          >
            Complete Payment - ₹{finalTotal.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
