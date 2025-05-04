
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import { mockFarmers, mockProducts, mockTransactions } from '@/utils/mockData';
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
import { Transaction } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // For edit sale dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Online'>('Cash');
  
  // Summary stats
  const [transactions, setTransactions] = useState(mockTransactions);
  
  const totalFarmers = mockFarmers.length;
  const totalProducts = mockProducts.length;
  const totalTransactions = transactions.length;
  const totalValue = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Get recent sales for sales history
  const recentSales = [...transactions]
    .filter(t => t.type === 'credit')
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);
  
  const handleEditSale = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPaymentMode(transaction.paymentMode || 'Cash');
    setIsEditDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (!selectedTransaction) return;
    
    const updatedTransactions = transactions.map(t => {
      if (t.id === selectedTransaction.id) {
        return {
          ...t,
          paymentMode: paymentMode
        };
      }
      return t;
    });
    
    setTransactions(updatedTransactions);
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
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Button 
              className="bg-agri-primary hover:bg-agri-secondary"
              onClick={() => navigate('/sales')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add Sale
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Farmers</p>
                    <h3 className="text-2xl font-bold">{totalFarmers}</h3>
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
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <h3 className="text-2xl font-bold">₹{totalValue.toFixed(2)}</h3>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
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
                      <th className="text-left p-2">Farmer</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Payment Mode</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => {
                      const farmer = mockFarmers.find(f => f.id === sale.farmerId);
                      return (
                        <tr key={sale.id} className="border-b">
                          <td className="p-2">{format(sale.date, 'MMM dd, yyyy')}</td>
                          <td className="p-2">{farmer?.name}</td>
                          <td className="p-2 text-right font-medium text-green-600">
                            ₹{sale.amount.toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              sale.settled 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {sale.settled ? 'Settled' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              (sale.paymentMode === 'Online')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {sale.paymentMode || 'Cash'}
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
                      );
                    })}
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
