
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Sidebar from '@/components/Sidebar';
import { mockProducts } from '@/utils/mockData';
import { Product, CartItem, Customer } from '@/utils/types';
import { Search, ShoppingCart, Package, Tag, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const Sales = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products] = useState<Product[]>(mockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [customer, setCustomer] = useState<Customer>({ name: '', mobile: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay'>('cash');
  
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
      // Add new product to cart
      setCart([...cart, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity: quantityToAdd,
        pricePerUnit: selectedProduct.pricePerUnit,
        unit: selectedProduct.unit,
        category: selectedProduct.category
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

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.quantity * item.pricePerUnit);
    }, 0);
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
  };

  const processPayment = () => {
    // Validate customer information
    if (!customer.name || !customer.mobile) {
      toast({
        title: "Missing information",
        description: "Please provide customer name and mobile number",
        variant: "destructive"
      });
      return;
    }

    // Handle payment method
    if (paymentMethod === 'razorpay') {
      // In a real implementation, you would integrate with Razorpay API here
      toast({
        title: "Razorpay payment initiated",
        description: "This is a placeholder for Razorpay integration",
      });
      
      // Mock successful payment after 2 seconds
      setTimeout(() => {
        completeOrder();
      }, 2000);
    } else {
      // Cash payment
      completeOrder();
    }
  };

  const completeOrder = () => {
    toast({
      title: "Order completed",
      description: `Order for ${customer.name} has been processed successfully`,
    });
    setCart([]);
    setCustomer({ name: '', mobile: '', email: '' });
    setIsCheckoutDialogOpen(false);
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
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Payment
                  </Label>
                  <div className="col-span-3 flex space-x-2">
                    <Button
                      type="button"
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('cash')}
                      className={paymentMethod === 'cash' ? 'bg-agri-primary hover:bg-agri-secondary' : ''}
                    >
                      Cash
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'razorpay' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('razorpay')}
                      className={paymentMethod === 'razorpay' ? 'bg-agri-primary hover:bg-agri-secondary' : ''}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Razorpay
                    </Button>
                  </div>
                </div>
                
                <div className="border-t my-2"></div>
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Amount:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={processPayment} className="bg-agri-primary hover:bg-agri-secondary">
                  {paymentMethod === 'razorpay' ? 'Pay with Razorpay' : 'Complete Sale'}
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
