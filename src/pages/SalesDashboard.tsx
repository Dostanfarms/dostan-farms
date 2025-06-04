import React, { useState, useRef } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import { getProductsFromLocalStorage } from '@/utils/employeeData';
import { Product } from '@/utils/types';
import { Search, Plus, Package, ShoppingCart, Trash2, Receipt, CreditCard, Smartphone, QrCode, IndianRupee, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';

const SalesDashboardContent = () => {
  const { toast } = useToast();
  const { open: sidebarOpen } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [products] = useState<Product[]>(getProductsFromLocalStorage());
  const [cart, setCart] = useState<Array<{product: Product, quantity: number}>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [quantityInput, setQuantityInput] = useState('1');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
  };

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.pricePerUnit * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  const processPayment = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to cart before processing payment",
        variant: "destructive"
      });
      return;
    }

    const total = calculateTotal();
    
    if (selectedPaymentMethod === 'cash') {
      const received = parseFloat(cashReceived);
      if (isNaN(received) || received < total) {
        toast({
          title: "Insufficient cash",
          description: "Please enter a valid amount greater than or equal to the total",
          variant: "destructive"
        });
        return;
      }
    }

    const saleData = {
      items: cart,
      total,
      paymentMethod: selectedPaymentMethod,
      cashReceived: selectedPaymentMethod === 'cash' ? parseFloat(cashReceived) : total,
      change: selectedPaymentMethod === 'cash' ? parseFloat(cashReceived) - total : 0,
      timestamp: new Date(),
      receiptNumber: Math.floor(Math.random() * 1000000)
    };

    setLastSaleData(saleData);
    setIsPaymentDialogOpen(false);
    setIsReceiptDialogOpen(true);
    clearCart();
    setCashReceived('');

    toast({
      title: "Payment successful",
      description: `Sale completed successfully. Total: ₹${total.toFixed(2)}`,
    });
  };

  const printReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .center { text-align: center; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const generateUpiPaymentUri = () => {
    const total = calculateTotal();
    return `upi://pay?pa=2755c@ybl&pn=DostanfarmsStore&am=${total.toFixed(2)}&cu=INR&tn=Purchase at Dostanfarms Store`;
  };

  const renderPaymentOptions = () => {
    const total = calculateTotal();
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
            onClick={() => setSelectedPaymentMethod('cash')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <IndianRupee className="h-6 w-6 mb-2" />
            <span className="text-sm">Cash</span>
          </Button>
          
          <Button
            variant={selectedPaymentMethod === 'upi' ? 'default' : 'outline'}
            onClick={() => setSelectedPaymentMethod('upi')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Smartphone className="h-6 w-6 mb-2" />
            <span className="text-sm">UPI</span>
          </Button>
          
          <Button
            variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
            onClick={() => setSelectedPaymentMethod('card')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <CreditCard className="h-6 w-6 mb-2" />
            <span className="text-sm">Card</span>
          </Button>
        </div>

        {selectedPaymentMethod === 'cash' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Cash Received</label>
            <Input
              type="number"
              placeholder="Enter amount received"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              min={total}
              step="0.01"
            />
            {cashReceived && parseFloat(cashReceived) >= total && (
              <div className="text-sm text-muted-foreground">
                Change: ₹{(parseFloat(cashReceived) - total).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {selectedPaymentMethod === 'upi' && (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border inline-block">
              <QRCode value={generateUpiPaymentUri()} size={200} />
            </div>
            <p className="text-sm text-muted-foreground">
              Scan QR code with any UPI app to pay ₹{total.toFixed(2)}
            </p>
          </div>
        )}

        {selectedPaymentMethod === 'card' && (
          <div className="text-center p-8 bg-muted rounded-lg">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Please insert or swipe the card on the terminal
            </p>
            <p className="text-lg font-semibold mt-2">₹{total.toFixed(2)}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-lg font-bold">Total: ₹{total.toFixed(2)}</span>
          <Button 
            onClick={processPayment}
            className="bg-green-600 hover:bg-green-700"
            disabled={selectedPaymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < total)}
          >
            Complete Payment
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Sales Dashboard</h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-6 h-full">
          {/* Products Section - Fixed grid layout */}
          <div className={`transition-all duration-300 ${sidebarOpen ? 'w-2/3' : 'w-3/4'}`}>
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No products found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'No products match your search criteria' : 'No products available for sale'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 auto-rows-max">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="overflow-hidden hover:shadow-md transition-shadow flex-shrink-0"
                    style={{ width: '110px', height: '120px' }}
                  >
                    <CardHeader className="bg-muted pb-1 px-2 py-2">
                      <CardTitle className="text-xs font-medium truncate">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 px-2 pb-2 flex flex-col justify-between h-full">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {product.quantity} {product.unit}
                        </div>
                        <div className="text-xs font-semibold">₹{product.pricePerUnit}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToCart(product)}
                        className="w-full h-6 text-xs bg-green-600 hover:bg-green-700 mt-2"
                      >
                        Add Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Section - 1/3 of the page */}
          <div className={`transition-all duration-300 ${sidebarOpen ? 'w-1/3' : 'w-1/4'} min-w-[280px]`}>
            <Card className="h-fit sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map((item, index) => (
                        <div key={`${item.product.id}-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.product.name}</h4>
                            <p className="text-xs text-muted-foreground">₹{item.product.pricePerUnit} per {item.product.unit}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                              className="h-7 w-7 p-0"
                            >
                              -
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                              className="h-7 w-7 p-0"
                            >
                              +
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(index)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={clearCart}>
                          Clear Cart
                        </Button>
                        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700">
                              <Receipt className="h-4 w-4 mr-2" />
                              Checkout
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Payment</DialogTitle>
                            </DialogHeader>
                            {renderPaymentOptions()}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          
          {lastSaleData && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Payment successful!</span>
                <Button variant="outline" size="sm" onClick={printReceipt}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
              
              <div className="border rounded-md p-4" ref={receiptRef}>
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">Dostanfarms Store</h3>
                  <p className="text-sm text-muted-foreground">Receipt #{lastSaleData.receiptNumber}</p>
                  <p className="text-sm text-muted-foreground">{lastSaleData.timestamp.toLocaleString()}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  {lastSaleData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>₹{(item.product.pricePerUnit * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{lastSaleData.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₹{lastSaleData.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment Method:</span>
                    <span className="capitalize">{lastSaleData.paymentMethod}</span>
                  </div>
                  {lastSaleData.paymentMethod === 'cash' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Cash Received:</span>
                        <span>₹{lastSaleData.cashReceived.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Change:</span>
                        <span>₹{lastSaleData.change.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="text-center mt-4 text-xs text-muted-foreground">
                  Thank you for your business!
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SalesDashboard = () => {
  return (
    <SidebarProvider>
      <SalesDashboardContent />
    </SidebarProvider>
  );
};

export default SalesDashboard;
