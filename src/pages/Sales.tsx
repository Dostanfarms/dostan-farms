import React, { useState, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Sidebar from '@/components/Sidebar';
import { Product, CartItem, Customer, Coupon } from '@/utils/types';
import { Search, ShoppingCart, Package, Tag, Plus, Minus, Trash2, CreditCard, Check, Receipt, Printer, CreditCard as PosIcon, Coins, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import QRCode from 'react-qr-code';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductsFromLocalStorage } from '@/utils/employeeData';

const Sales = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentSuccessDialogOpen, setIsPaymentSuccessDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [customer, setCustomer] = useState<Customer>({ name: '', mobile: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | 'pos'>('online');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Load products from localStorage instead of mockData
  React.useEffect(() => {
    const storedProducts = getProductsFromLocalStorage();
    setProducts(storedProducts);
  }, []);
  
  // Load available coupons
  React.useEffect(() => {
    // In a real app, fetch from API/backend
    const mockCoupons: Coupon[] = [
      { 
        code: 'DISCOUNT10', 
        discountType: 'percentage', 
        discountValue: 10,
        maxDiscountLimit: 1000,
        expiryDate: new Date('2025-12-31')
      },
      {
        code: 'FLAT500',
        discountType: 'flat',
        discountValue: 500,
        expiryDate: new Date('2025-12-31')
      },
      {
        code: 'SUMMER20',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscountLimit: 2000,
        expiryDate: new Date('2025-08-31')
      }
    ];
    
    // Filter to only show valid coupons
    const validCoupons = mockCoupons.filter(coupon => new Date(coupon.expiryDate) > new Date());
    setAvailableCoupons(validCoupons);
  }, []);
  
  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const openQuantityDialog = (product: Product) => {
    setSelectedProduct(product);
    setQuantityToAdd(1);
    setIsQuantityDialogOpen(true);
  };

  const addToCart = () => {
    if (!selectedProduct || quantityToAdd <= 0) return;
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.productId === selectedProduct.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantityToAdd;
      setCart(updatedCart);
    } else {
      // Add new product to cart, including the farmerId property
      setCart([...cart, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity: quantityToAdd,
        pricePerUnit: selectedProduct.pricePerUnit,
        unit: selectedProduct.unit,
        category: selectedProduct.category,
        farmerId: selectedProduct.farmerId // Include farmerId from selected product
      }]);
    }
    
    setIsQuantityDialogOpen(false);
    toast({
      title: "Added to cart",
      description: `${quantityToAdd} ${selectedProduct.unit} of ${selectedProduct.name} added to cart`,
    });
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartItem(index);
      return;
    }
    
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
  };

  const removeCartItem = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.quantity * item.pricePerUnit);
    }, 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = calculateSubtotal();
    let discount = 0;
    
    if (appliedCoupon.discountType === 'percentage') {
      discount = subtotal * (appliedCoupon.discountValue / 100);
      // Apply max discount limit if set and if calculated discount exceeds it
      if (appliedCoupon.maxDiscountLimit && discount > appliedCoupon.maxDiscountLimit) {
        discount = appliedCoupon.maxDiscountLimit;
      }
    } else {
      // Flat discount
      discount = appliedCoupon.discountValue;
    }
    
    return discount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const startCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }
    setIsCheckoutDialogOpen(true);
    // Reset coupon-related state
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
  };

  const validateCoupon = () => {
    setCouponError('');
    
    // Check if coupon code is empty
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // Find the coupon in our available coupons
    const foundCoupon = availableCoupons.find(
      c => c.code.toLowerCase() === couponCode.toLowerCase()
    );
      
    if (foundCoupon) {
      setAppliedCoupon(foundCoupon);
      toast({
        title: "Coupon applied",
        description: foundCoupon.discountType === 'percentage'
          ? `${foundCoupon.discountValue}% discount applied`
          : `₹${foundCoupon.discountValue} discount applied`
      });
    } else {
      setAppliedCoupon(null);
      setCouponError('Invalid or expired coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const proceedToPayment = () => {
    // Validate customer information
    if (!customer.name || !customer.mobile) {
      toast({
        title: "Missing information",
        description: "Please provide customer name and mobile number",
        variant: "destructive"
      });
      return;
    }

    setIsCheckoutDialogOpen(false);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    setIsPaymentSuccessDialogOpen(true);
  };

  const resetSale = () => {
    setIsPaymentSuccessDialogOpen(false);
    setCart([]);
    setCustomer({ name: '', mobile: '', email: '' });
    setPaymentMethod('online');
  };

  const printReceipt = () => {
    if (receiptRef.current) {
      const printContent = receiptRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; }
                .receipt-container { max-width: 300px; margin: 0 auto; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { text-align: left; padding: 5px 0; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .border-top { border-top: 1px solid #ddd; margin-top: 8px; padding-top: 8px; }
                .border-bottom { border-bottom: 1px solid #ddd; margin-bottom: 8px; padding-bottom: 8px; }
                .text-sm { font-size: 0.875rem; }
                .text-xs { font-size: 0.75rem; }
                .font-bold { font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${printContent}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      } else {
        toast({
          title: "Unable to open print window",
          description: "Please check your browser settings and try again.",
          variant: "destructive"
        });
      }
    }
  };

  const formatDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Generate UPI payment URI based on cart total
  const generateUpiPaymentUri = () => {
    const total = calculateTotal();
    return `upi://pay?pa=2755c@ybl&pn=AgriPayStore&am=${total.toFixed(2)}&cu=INR&tn=Purchase at AgriPay Store`;
  };

  // Display payment options section
  const renderPaymentOptions = () => {
    return (
      <Tabs defaultValue="online" className="w-full" onValueChange={(v) => setPaymentMethod(v as 'cash' | 'online' | 'pos')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="online">QR Code (UPI)</TabsTrigger>
          <TabsTrigger value="cash">Cash</TabsTrigger>
          <TabsTrigger value="pos">POS Machine</TabsTrigger>
        </TabsList>
        <TabsContent value="online" className="py-4">
          <div className="flex flex-col items-center justify-center py-2">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <QRCode
                value={generateUpiPaymentUri()}
                size={200}
              />
            </div>
            <p className="mt-4 text-sm text-center text-muted-foreground">
              Scan with any UPI app to pay ₹{calculateTotal().toFixed(2)}
            </p>
            <p className="text-sm text-center text-muted-foreground">
              UPI ID: 2755c@ybl
            </p>
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={handlePaymentSuccess} className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" /> Payment Complete
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="cash" className="py-4">
          <div className="flex flex-col items-center justify-center py-6">
            <Coins className="h-16 w-16 text-yellow-500 mb-4" />
            <p className="text-center mb-4">
              Collect <span className="font-bold">₹{calculateTotal().toFixed(2)}</span> cash from the customer
            </p>
            <Button onClick={handlePaymentSuccess} className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" /> Payment Complete
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="pos" className="py-4">
          <div className="flex flex-col items-center justify-center py-6">
            <PosIcon className="h-16 w-16 text-blue-500 mb-4" />
            <p className="text-center mb-4">
              Process <span className="font-bold">₹{calculateTotal().toFixed(2)}</span> through POS machine
            </p>
            <Button onClick={handlePaymentSuccess} className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" /> Payment Complete
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold">Add Sale</h1>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                    {cart.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 flex items-center justify-center p-0 rounded-full">
                        {cart.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="font-medium py-1 border-b mb-2">Shopping Cart</div>
                  {cart.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground">
                      Your cart is empty
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="h-[200px] pr-4">
                        {cart.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ₹{item.pricePerUnit} × {item.quantity} {item.unit}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                                onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                                onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-red-500"
                                onClick={() => removeCartItem(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                      
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between font-medium">
                          <span>Total:</span>
                          <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                        <Button 
                          className="w-full bg-agri-primary hover:bg-agri-secondary"
                          onClick={startCheckout}
                        >
                          Proceed to Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium mb-1">No products found</h3>
                  <p className="text-muted-foreground text-center">
                    No products match your search criteria. Try with a different name or category.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-1">No products available</h3>
                  <p className="text-muted-foreground text-center">
                    Please add products from the Products page first.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="bg-muted pb-2">
                    <CardTitle className="text-lg flex justify-between items-start">
                      <span>{product.name}</span>
                      <Badge variant="outline" className="bg-agri-primary/10">
                        <Tag className="h-3 w-3 mr-1" /> {product.category}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Available:</span>
                        <span>{product.quantity} {product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price/Unit:</span>
                        <span>₹{product.pricePerUnit}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          className="flex-1 bg-agri-primary hover:bg-agri-secondary"
                          onClick={() => openQuantityDialog(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" /> Add to Sale
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Quantity Selection Dialog */}
          <Dialog open={isQuantityDialogOpen} onOpenChange={setIsQuantityDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Cart</DialogTitle>
                <DialogDescription>
                  How many {selectedProduct?.unit} of {selectedProduct?.name} would you like to add?
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setQuantityToAdd(Math.max(1, quantityToAdd - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    type="number"
                    min="1"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setQuantityToAdd(quantityToAdd + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center text-muted-foreground">
                  Total: ₹{((selectedProduct?.pricePerUnit || 0) * quantityToAdd).toFixed(2)}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsQuantityDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addToCart} className="bg-agri-primary hover:bg-agri-secondary">
                  Add to Cart
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Checkout Dialog */}
          <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Checkout</DialogTitle>
                <DialogDescription>
                  Enter customer details and complete the sale
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerName" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Customer name"
                    className="col-span-3"
                    value={customer.name}
                    onChange={(e) => setCustomer({...customer, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerMobile" className="text-right">
                    Mobile
                  </Label>
                  <Input
                    id="customerMobile"
                    placeholder="Mobile number"
                    className="col-span-3"
                    value={customer.mobile}
                    onChange={(e) => setCustomer({...customer, mobile: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerEmail" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="customerEmail"
                    placeholder="Email (optional)"
                    className="col-span-3"
                    value={customer.email}
                    onChange={(e) => setCustomer({...customer, email: e.target.value})}
                  />
                </div>
                
                <div className="border-t my-2"></div>
                
                {/* Available Coupons Section */}
                <div className="mb-2">
                  <h3 className="font-medium text-sm mb-2">Available Coupons:</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.length > 0 ? (
                      availableCoupons.map((coupon, index) => (
                        <Badge 
                          key={index}
                          className="cursor-pointer bg-muted hover:bg-muted/80 text-foreground"
                          onClick={() => setCouponCode(coupon.code)}
                        >
                          {coupon.code} - {coupon.discountType === 'percentage' 
                            ? `${coupon.discountValue}% off` 
                            : `₹${coupon.discountValue} off`}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No coupons available</p>
                    )}
                  </div>
                </div>
                
                {/* Coupon section */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="couponCode" className="text-right">
                    Coupon
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="couponCode"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="flex-1"
                    />
                    {!appliedCoupon ? (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={validateCoupon}
                      >
                        Apply
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={removeCoupon}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                
                {couponError && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-start-2 col-span-3">
                      <p className="text-sm text-red-500">{couponError}</p>
                    </div>
                  </div>
                )}
                
                {appliedCoupon && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-start-2 col-span-3">
                      <p className="text-sm text-green-500">
                        {appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% off applied!`
                          : `₹${appliedCoupon.discountValue} discount applied!`}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="border-t my-2"></div>
                
                {/* Summary section */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount:</span>
                      <span>- ₹{calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={proceedToPayment} className="bg-agri-primary hover:bg-agri-secondary">
                  Proceed to Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Payment Method Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Payment Method</DialogTitle>
                <DialogDescription>
                  Choose how the customer will pay ₹{calculateTotal().toFixed(2)}
                </DialogDescription>
              </DialogHeader>
              
              {renderPaymentOptions()}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsPaymentDialogOpen(false);
                  setIsCheckoutDialogOpen(true);
                }}>
                  Back
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Payment Success & Receipt Dialog */}
          <Dialog open={isPaymentSuccessDialogOpen} onOpenChange={setIsPaymentSuccessDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Receipt className="mr-2 h-5 w-5" /> 
                  Payment Receipt
                </DialogTitle>
                <DialogDescription>
                  Sale completed successfully!
                </DialogDescription>
              </DialogHeader>
              
              <div className="border rounded-md p-4" ref={receiptRef}>
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">AgriPay Store</h3>
                  <p className="text-sm text-muted-foreground">Receipt #{Math.floor(Math.random() * 1000000)}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime()}</p>
                </div>
                
                <div className="mb-4">
                  <p><span className="font-medium">Customer:</span> {customer.name}</p>
                  {customer.mobile && <p><span className="font-medium">Mobile:</span> {customer.mobile}</p>}
                </div>
                
                <div className="border-t border-b py-2 mb-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-sm font-medium">
                        <th className="text-left">Item</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr key={index} className="text-sm">
                          <td className="text-left">{item.name}</td>
                          <td className="text-right">{item.quantity} {item.unit}</td>
                          <td className="text-right">₹{item.pricePerUnit}</td>
                          <td className="text-right">₹{(item.quantity * item.pricePerUnit).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>- ₹{calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <span>Payment Mode:</span>
                    <span>{paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'pos' ? 'POS Machine' : 'Online (UPI)'}</span>
                  </div>
                </div>
                
                <div className="mt-6 text-center text-xs text-muted-foreground">
                  <p>Thank you for your purchase!</p>
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2" 
                  onClick={printReceipt}
                >
                  <Printer className="h-4 w-4" /> Print Receipt
                </Button>
                <Button 
                  onClick={resetSale} 
                  className="flex-1 bg-agri-primary hover:bg-agri-secondary"
                >
                  New Sale
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Sales;
