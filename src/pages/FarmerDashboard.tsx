import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import TransactionHistory from '@/components/TransactionHistory';
import { Farmer, Ticket } from '@/utils/types';
import { mockFarmers, getDailyEarnings, getMonthlyEarnings, getUnsettledAmount } from '@/utils/mockData';
import { format } from 'date-fns';
import { 
  LogOut, 
  Package, 
  Receipt, 
  Menu as TicketIcon, 
  Menu,
  ChevronDown
} from 'lucide-react';
import TicketDialog from '@/components/ticket/TicketDialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const FarmerDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [dailyEarnings, setDailyEarnings] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [unsettledAmount, setUnsettledAmount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if farmer is logged in
    const currentFarmerStr = localStorage.getItem('currentFarmer');
    if (!currentFarmerStr) {
      toast({
        title: "Authentication required",
        description: "Please login to access your dashboard.",
        variant: "destructive"
      });
      navigate('/farmer-login');
      return;
    }

    const currentFarmer = JSON.parse(currentFarmerStr);
    if (currentFarmer.id !== id) {
      toast({
        title: "Access denied",
        description: "You do not have permission to access this farmer's dashboard.",
        variant: "destructive"
      });
      navigate('/farmer-login');
      return;
    }
    
    // If authenticated, fetch farmer data
    if (id) {
      const foundFarmer = mockFarmers.find(farmer => farmer.id === id);
      if (foundFarmer) {
        setFarmer(foundFarmer);
        setDailyEarnings(getDailyEarnings(id));
        setMonthlyEarnings(getMonthlyEarnings(id));
        setUnsettledAmount(getUnsettledAmount(id));
      } else {
        toast({
          title: "Farmer not found",
          description: "The requested farmer could not be found.",
          variant: "destructive"
        });
        navigate('/farmer-login');
      }
    }
  }, [id, navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('currentFarmer');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/farmer-login');
  };
  
  const handleTicketSubmit = (ticket: Omit<Ticket, 'id'>) => {
    // In a real app, this would submit the ticket to an API
    // For now, we'll just show a toast
    toast({
      title: "Ticket Submitted",
      description: "Your support ticket has been submitted.",
      variant: "default",
    });
  };

  if (!farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading farmer dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold hidden sm:inline">AgriPay Farmer Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span className="hidden sm:inline">{farmer.name}</span>
                  <span className="sm:hidden">Account</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <p className="font-medium">{farmer.name}</p>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <p className="text-sm text-muted-foreground">Farmer ID: {farmer.id}</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/farmer-ticket-history/${farmer.id}`} className="flex items-center gap-2">
                    <TicketIcon className="h-4 w-4" />
                    <span>Ticket History</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <TicketDialog
                      userType="farmer"
                      userId={farmer.id}
                      userName={farmer.name}
                      userContact={farmer.phone}
                      onSubmit={handleTicketSubmit}
                      buttonText="Raise a Ticket"
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-sm p-4">
          <div className="space-y-2">
            <p className="font-medium">{farmer.name}</p>
            <p className="text-sm text-muted-foreground">Farmer ID: {farmer.id}</p>
            <div className="pt-2">
              <Link to={`/farmer-ticket-history/${farmer.id}`} className="flex items-center gap-2 py-2">
                <TicketIcon className="h-4 w-4" />
                <span>Ticket History</span>
              </Link>
              <TicketDialog
                userType="farmer"
                userId={farmer.id}
                userName={farmer.name}
                userContact={farmer.phone}
                onSubmit={handleTicketSubmit}
                buttonText="Raise a Ticket"
              />
              <Button 
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2 mt-2 w-full justify-start"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Farmer Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span>{farmer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Address:</span>
                      <span className="text-right">{farmer.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Joined:</span>
                      <span>{format(farmer.dateJoined, 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Payment Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bank:</span>
                      <span>{farmer.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account:</span>
                      <span>{farmer.accountNumber}</span>
                    </div>
                    {farmer.ifscCode && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">IFSC:</span>
                        <span>{farmer.ifscCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Unsettled Amount</p>
                <p className="text-3xl font-bold text-agri-primary">₹{unsettledAmount.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-xl font-semibold">{farmer.products.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-semibold">{farmer.transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="products" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
              </CardHeader>
              <CardContent>
                {farmer.products.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No products added yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Product</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-right p-2">Quantity</th>
                          <th className="text-right p-2">Unit Price (₹)</th>
                          <th className="text-right p-2">Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {farmer.products.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">{format(product.date, 'MMM dd, yyyy')}</td>
                            <td className="text-right p-2">{product.quantity} {product.unit}</td>
                            <td className="text-right p-2">₹{product.pricePerUnit.toFixed(2)}</td>
                            <td className="text-right p-2 font-medium">
                              ₹{(product.quantity * product.pricePerUnit).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {farmer.transactions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No transactions yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-center p-2">Type</th>
                          <th className="text-center p-2">Status</th>
                          <th className="text-right p-2">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...farmer.transactions]
                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                          .map((transaction) => (
                            <tr key={transaction.id} className="border-b">
                              <td className="p-2">{format(transaction.date, 'MMM dd, yyyy')}</td>
                              <td className="p-2">{transaction.description}</td>
                              <td className="text-center p-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.type === 'credit' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                                </span>
                              </td>
                              <td className="text-center p-2">
                                {transaction.type === 'credit' && (
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    transaction.settled 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {transaction.settled ? 'Settled' : 'Pending'}
                                  </span>
                                )}
                              </td>
                              <td className={`text-right p-2 font-medium ${
                                transaction.type === 'credit' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {transaction.type === 'credit' ? '+' : '-'}
                                ₹{transaction.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <TransactionHistory 
          transactions={farmer.transactions} 
          dailyEarnings={dailyEarnings} 
          monthlyEarnings={monthlyEarnings} 
        />
      </main>
    </div>
  );
};

export default FarmerDashboard;
