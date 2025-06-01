
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { BarChart, Users, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAccessibleResources } from '@/utils/employeeData';

const TopLevelMenu = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Dashboard is kept at the top level
  const topLevelItems = [
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
      title: 'Customers',
      icon: <ShoppingBag className="h-5 w-5" />,
      path: '/customers',
      resource: 'customers'
    },
  ];

  // Filter menu items based on user permissions
  const accessibleResources = currentUser ? getAccessibleResources(currentUser.role) : [];
  const filteredTopLevelItems = currentUser 
    ? topLevelItems.filter(item => accessibleResources.includes(item.resource))
    : topLevelItems;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Management</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredTopLevelItems.map((item) => (
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
  );
};

export default TopLevelMenu;
