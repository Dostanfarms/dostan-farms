
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar as SidebarContainer, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { DollarSign, Users, Package, Receipt, BarChart } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <BarChart className="h-5 w-5" />,
      path: '/',
    },
    {
      title: 'Farmers',
      icon: <Users className="h-5 w-5" />,
      path: '/farmers',
    },
    {
      title: 'Products',
      icon: <Package className="h-5 w-5" />,
      path: '/products',
    },
    {
      title: 'Transactions',
      icon: <Receipt className="h-5 w-5" />,
      path: '/transactions',
    },
    {
      title: 'Settlements',
      icon: <DollarSign className="h-5 w-5" />,
      path: '/settlements',
    }
  ];

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
              {menuItems.map((item) => (
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
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
