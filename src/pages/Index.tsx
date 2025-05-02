import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import { mockFarmers, mockProducts, mockTransactions } from '@/utils/mockData';
import { Users, Package, Receipt, DollarSign, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Index = () => {
  const navigate = useNavigate();
  
  // Summary stats
  const totalFarmers = mockFarmers.length;
  const totalProducts = mockProducts.length;
  const totalTransactions = mockTransactions.length;
  const totalValue = mockTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Get monthly data for chart
  const getMonthlyData = () => {
    const monthlyMap = new Map();
    
    mockTransactions.forEach(transaction => {
      if (transaction.type === 'credit') {
        const date = transaction.date;
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthlyMap.get(monthYear) || 0;
        monthlyMap.set(monthYear, existing + transaction.amount);
      }
    });
    
    return Array.from(monthlyMap.entries())
      .map(([month, amount]) => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' });
        return {
          month: `${monthName} ${year}`,
          amount
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const monthlyData = getMonthlyData();
  
  // Get recent transactions
  const recentTransactions = [...mockTransactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
  
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Earnings']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="amount" name="Earnings (₹)" fill="#2E7D32" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map(transaction => {
                    const farmer = mockFarmers.find(f => f.id === transaction.farmerId);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">{farmer?.name}</p>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.date.toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-right ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <p className="font-medium">
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-xs">{transaction.type === 'credit' ? 'Credit' : 'Debit'}</p>
                        </div>
                      </div>
                    );
                  })}
                  {recentTransactions.length === 0 && (
                    <p className="text-center py-4 text-muted-foreground">No recent transactions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
