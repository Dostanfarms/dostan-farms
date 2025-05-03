
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar as SidebarContainer, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { DollarSign, Users, Package, Receipt, BarChart, LogIn, ShoppingCart, UserCog, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAccessibleResources } from '@/utils/employeeData';

export const Sidebar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  // Base menu items
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <BarChart className="h-5 w-5" />,
      path: '/',
      resource: 'dashboard'
    },
    {
      title: 'Farmers',
      icon: <Users className="h-5 w-5" />,
      path: '/farmers',
      resource: 'farmers'
    },
    {
      title: 'Products',
      icon: <Package className="h-5 w-5" />,
      path: '/products',
      resource: 'products'
    },
    {
      title: 'Add Sale',
      icon: <ShoppingCart className="h-5 w-5" />,
      path: '/sales',
      resource: 'sales'
    },
    {
      title: 'Transactions',
      icon: <Receipt className="h-5 w-5" />,
      path: '/transactions',
      resource: 'transactions'
    },
    {
      title: 'Settlements',
      icon: <DollarSign className="h-5 w-5" />,
      path: '/settlements',
      resource: 'settlements'
    },
    {
      title: 'Employees',
      icon: <UserCog className="h-5 w-5" />,
      path: '/employees',
      resource: 'employees'
    }
  ];

  // Filter menu items based on user permissions
  const accessibleResources = currentUser ? getAccessibleResources(currentUser.role) : [];
  const filteredMenuItems = currentUser 
    ? menuItems.filter(item => accessibleResources.includes(item.resource))
    : menuItems;

  return (
    <SidebarContainer>
      <SidebarHeader className="py-6">
        <div className="flex items-center px-4 gap-2">
          <Package className="h-6 w-6 text-agri-primary" />
          <span className="text-lg font-bold">AgriPay Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path} 
                      className={`flex items-center gap-3 ${
                        location.pathname === item.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                      }`}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {currentUser ? (
                <>
                  <SidebarMenuItem>
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{currentUser.role} Role</p>
                    </div>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={logout} className="flex items-center gap-3 w-full">
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link 
                        to="/employee-login" 
                        className={`flex items-center gap-3 ${
                          location.pathname === '/employee-login' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                        }`}
                      >
                        <LogIn className="h-5 w-5" />
                        <span>Employee Login</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link 
                        to="/farmer-login" 
                        className={`flex items-center gap-3 ${
                          location.pathname === '/farmer-login' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                        }`}
                      >
                        <LogIn className="h-5 w-5" />
                        <span>Farmer Login</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
