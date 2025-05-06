
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  User, 
  List, 
  LogOut,
  Home,
  Package
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Product, CartItem } from '@/utils/types';

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
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Check if customer is logged in
  const customerString = localStorage.getItem('currentCustomer');
  const customer = customerString ? JSON.parse(customerString) : null;
  
  if (!customer) {
    navigate('/customer-login');
    return null;
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
        category: product.category
      }]);
    }
    
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`
    });
  };
  
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top navigation bar */}
      <header className="bg-white shadow p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-xl font-bold">AgriPay</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/customer-profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
            <Link to="/order-history">
              <Button variant="ghost" size="icon">
                <List className="h-5 w-5" />
                <span className="sr-only">Orders</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Available Products</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
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
            </Card>
          ))}
        </div>
        
        {/* Floating cart button */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6">
            <Button 
              className="bg-agri-primary hover:bg-agri-secondary rounded-full h-14 w-14 shadow-lg"
              onClick={() => navigate('/payment')}
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerHome;
