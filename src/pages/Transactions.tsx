
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockTransactions, mockFarmers } from '@/utils/mockData';
import { Transaction } from '@/utils/types';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Check, X, ArrowLeft } from 'lucide-react';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([...mockTransactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  ));
  const { checkPermission } = useAuth();
  
  const canEdit = checkPermission('transactions', 'edit');
  
  const handleMarkAsSettled = (id: string) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === id ? { ...transaction, settled: true } : transaction
      )
    );
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              className="mr-4" 
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-2xl font-bold">Transactions</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Farmer</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-center p-2">Type</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-center p-2">Status</th>
                      {canEdit && <th className="text-right p-2">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => {
                      const farmer = mockFarmers.find(f => f.id === transaction.farmerId);
                      return (
                        <tr key={transaction.id} className="border-b">
                          <td className="p-2">{transaction.id}</td>
                          <td className="p-2">{format(transaction.date, 'MMM dd, yyyy')}</td>
                          <td className="p-2">{farmer?.name}</td>
                          <td className="p-2">{transaction.description}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              transaction.type === 'credit' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {transaction.type === 'credit' 
                                ? <ArrowDownLeft className="h-3 w-3" /> 
                                : <ArrowUpRight className="h-3 w-3" />}
                              {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                            </span>
                          </td>
                          <td className={`text-right p-2 font-medium ${
                            transaction.type === 'credit' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}
                            ₹{transaction.amount.toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            {transaction.type === 'credit' && (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                transaction.settled 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {transaction.settled 
                                  ? <Check className="h-3 w-3" /> 
                                  : <X className="h-3 w-3" />}
                                {transaction.settled ? 'Settled' : 'Pending'}
                              </span>
                            )}
                          </td>
                          {canEdit && (
                            <td className="p-2 text-right">
                              {transaction.type === 'credit' && !transaction.settled && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleMarkAsSettled(transaction.id)}
                                >
                                  Mark as Settled
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Transactions;
