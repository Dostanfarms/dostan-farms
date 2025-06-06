
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import { mockFarmers, mockProducts } from '@/utils/mockData';
import { Users, Package, Receipt, DollarSign, ShoppingCart, Edit, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  customerName: string;
  customerMobile: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  couponUsed: string | null;
  paymentMethod: string;
  timestamp: string;
  status: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // For edit sale dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Online'>('Cash');
  
  // Load transactions from localStorage
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const loadTransactions = () => {
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions);
          setTransactions(parsedTransactions);
        } catch (error) {
          console.error('Error loading transactions:', error);
          setTransactions([]);
        }
      }
    };

    loadTransactions();
    
    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      loadTransactions();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const totalFarmers = mockFarmers.length;
  const totalProducts = mockProducts.length;
  const totalTransactions = transactions.length;
  const totalValue = transactions.reduce((sum, t) => sum + t.total, 0);
  
  // Get recent sales for sales history
  const recentSales = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
  
  const handleEditSale = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPaymentMode(transaction.paymentMethod === 'upi' || transaction.paymentMethod === 'card' ? 'Online' : 'Cash');
    setIsEditDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (!selectedTransaction) return;
    
    const updatedTransactions = transactions.map(t => {
      if (t.id === selectedTransaction.id) {
        return {
          ...t,
          paymentMethod: paymentMode === 'Online' ? 'upi' : 'cash'
        };
      }
      return t;
    });
    
    setTransactions(updatedTransactions);
    // Update localStorage
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setIsEditDialogOpen(false);
    
    toast({
      title: "Sale updated",
      description: "Payment mode was successfully updated."
    });
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome to DostanFarms Dashboard</p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/sales-dashboard')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sales Dashboard
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Farmers</p>
                    <h3 className="text-2xl font-bold">{totalFarmers}</h3>
                    <p className="text-xs text-green-600">+3.2% from last month</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <h3 className="text-2xl font-bold">{totalProducts}</h3>
                    <p className="text-xs text-green-600">+8.1% from last month</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <h3 className="text-2xl font-bold">{totalTransactions}</h3>
                    <p className="text-xs text-green-600">+12.5% from last month</p>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Receipt className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold">₹{totalValue.toFixed(2)}</h3>
                    <p className="text-xs text-green-600">+15.3% from last month</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New farmer registered</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Product added to inventory</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sale completed</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => navigate('/products')}
                  >
                    <Package className="h-6 w-6 mb-2" />
                    <span>Manage Products</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => navigate('/farmers')}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <span>Manage Farmers</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => navigate('/sales-dashboard')}
                  >
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    <span>Start Sale</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => navigate('/transactions')}
                  >
                    <DollarSign className="h-6 w-6 mb-2" />
                    <span>View Transactions</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sales History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Customer</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Payment Mode</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="border-b">
                        <td className="p-2">{format(new Date(sale.timestamp), 'MMM dd, yyyy')}</td>
                        <td className="p-2">{sale.customerName}</td>
                        <td className="p-2 text-right font-medium text-green-600">
                          ₹{sale.total.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            Completed
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            (sale.paymentMethod === 'upi' || sale.paymentMethod === 'card')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {sale.paymentMethod === 'upi' || sale.paymentMethod === 'card' ? 'Online' : 'Cash'}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditSale(sale)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {recentSales.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted-foreground">
                          No sales history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Edit Sale Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base">Payment Mode</Label>
                <RadioGroup 
                  value={paymentMode} 
                  onValueChange={(value) => setPaymentMode(value as 'Cash' | 'Online')}
                  className="flex flex-col space-y-1 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Cash" id="cash" />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Online" id="online" />
                    <Label htmlFor="online">Online</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Index;
