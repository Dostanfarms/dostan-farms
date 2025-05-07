
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  User,
  LogOut,
  Package,
  List,
  Menu,
  ArrowLeft,
  Ticket
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Product, CartItem } from '@/utils/types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Placeholder products data
const DUMMY_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "Organic Tomatoes",
    quantity: 100,
    unit: "kg",
    pricePerUnit: 50,
    category: "Vegetables",
    date: new Date(),
    farmerId: "farmer_1"
  },
  {
    id: "prod_2",
    name: "Fresh Potatoes",
    quantity: 50,
    unit: "kg",
    pricePerUnit: 30,
    category: "Vegetables",
    date: new Date(),
    farmerId: "farmer_2"
  },
  {
    id: "prod_3",
    name: "Brown Rice",
    quantity: 200,
    unit: "kg",
    pricePerUnit: 60,
    category: "Grains",
    date: new Date(),
    farmerId: "farmer_1"
  },
  {
    id: "prod_4",
    name: "Raw Honey",
    quantity: 20,
    unit: "bottle",
    pricePerUnit: 250,
    category: "Other",
    date: new Date(),
    farmerId: "farmer_3"
  }
];

const CustomerHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(DUMMY_PRODUCTS);
  const [addedToCartIds, setAddedToCartIds] = useState<{[key: string]: boolean}>({});
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Load cart from localStorage on component mount
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('customerCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('customerCart', JSON.stringify(cart));
  }, [cart]);
  
  // Check if customer is logged in
  const customerString = localStorage.getItem('currentCustomer');
  const customer = customerString ? JSON.parse(customerString) : null;
  
  useEffect(() => {
    if (!customer) {
      navigate('/customer-login');
    }
  }, [customer, navigate]);
  
  if (!customer) {
    return null; // Redirect handled in useEffect
  }
  
  const handleLogout = () => {
    localStorage.removeItem('currentCustomer');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
    navigate('/app-landing');
  };
  
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new item to cart
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        pricePerUnit: product.pricePerUnit,
        unit: product.unit,
        category: product.category,
        farmerId: product.farmerId
      }]);
    }
    
    // Show added notification on the card
    setAddedToCartIds(prev => ({ ...prev, [product.id]: true }));
    
    // Clear the notification after a delay
    setTimeout(() => {
      setAddedToCartIds(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };
  
  // Calculate total cart items
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top navigation bar */}
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-xl font-bold hidden sm:inline">AgriPay</span>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/customer-profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/order-history" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ticket-history" className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>Ticket History</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Cart icon with badge showing item count */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </div>
        </div>
      </header>
      
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
                <Package className="h-6 w-6 text-agri-primary" />
                <span className="text-lg font-bold">AgriPay</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto"
                  onClick={() => setMenuOpen(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>
              <Link to="/customer-profile" className="flex items-center gap-2 py-2" onClick={() => setMenuOpen(false)}>
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link to="/order-history" className="flex items-center gap-2 py-2" onClick={() => setMenuOpen(false)}>
                <List className="h-5 w-5" />
                <span>My Orders</span>
              </Link>
              <Link to="/ticket-history" className="flex items-center gap-2 py-2" onClick={() => setMenuOpen(false)}>
                <Ticket className="h-5 w-5" />
                <span>Ticket History</span>
              </Link>
              <Link to="/cart" className="flex items-center gap-2 py-2" onClick={() => setMenuOpen(false)}>
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 justify-start mt-auto"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Available Products</h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden relative">
              <div className="bg-muted aspect-square flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <span className="text-agri-primary font-semibold">
                    ₹{product.pricePerUnit}/{product.unit}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Category: {product.category}</p>
                <Button 
                  className="w-full bg-agri-primary hover:bg-agri-secondary"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
              
              {/* Added to Cart notification */}
              {addedToCartIds[product.id] && (
                <div className="absolute top-0 right-0 w-full bg-green-500 text-white text-center py-1 text-sm animate-pulse">
                  Added Successfully
                </div>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CustomerHome;
