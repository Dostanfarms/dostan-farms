
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Users, Package, ShoppingCart, Receipt, TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const dashboardStats = [
    {
      title: "Total Farmers",
      value: "156",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Products",
      value: "89",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Sales Today",
      value: "23",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Revenue",
      value: "₹12,450",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const quickActions = [
    {
      title: "Manage Farmers",
      description: "View and manage farmer profiles",
      icon: Users,
      action: () => navigate('/farmers'),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Product Management",
      description: "Add and manage products",
      icon: Package,
      action: () => navigate('/products'),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "View Transactions",
      description: "Track all transactions",
      icon: Receipt,
      action: () => navigate('/transactions'),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Sales Analytics",
      description: "View sales reports and analytics",
      icon: TrendingUp,
      action: () => navigate('/sales'),
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {currentUser?.name}</p>
            </div>
            <Button 
              onClick={() => navigate('/sales-dashboard')}
              className="bg-agri-primary hover:bg-agri-secondary"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Sales Dashboard
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className={`${action.color} text-white border-none h-auto p-6 flex flex-col items-center gap-3`}
                    onClick={action.action}
                  >
                    <action.icon className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs opacity-90">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Package className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">New product added</p>
                    <p className="text-sm text-muted-foreground">Tomatoes added to inventory</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">New farmer registered</p>
                    <p className="text-sm text-muted-foreground">Rahul Kumar joined the platform</p>
                  </div>
                  <span className="text-sm text-muted-foreground">5 hours ago</span>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <ShoppingCart className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Sale completed</p>
                    <p className="text-sm text-muted-foreground">₹450 sale processed successfully</p>
                  </div>
                  <span className="text-sm text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
