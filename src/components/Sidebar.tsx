
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar as SidebarContainer, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { 
  DollarSign, 
  Users, 
  Package, 
  Receipt, 
  BarChart, 
  LogIn, 
  ShoppingCart, 
  UserCog, 
  LogOut,
  ChevronDown,
  ChevronUp,
  Settings,
  Tag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAccessibleResources } from '@/utils/employeeData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const Sidebar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [manageOpen, setManageOpen] = useState(false);

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
  ];

  // Items in the "Manage" section
  const manageItems = [
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
      title: 'Coupons',
      icon: <Tag className="h-5 w-5" />,
      path: '/coupons',
      resource: 'coupons'
    },
    {
      title: 'Employees',
      icon: <UserCog className="h-5 w-5" />,
      path: '/employees',
      resource: 'employees'
    },
    {
      title: 'Roles',
      icon: <Settings className="h-5 w-5" />,
      path: '/roles',
      resource: 'roles'
    }
  ];

  // Filter menu items based on user permissions
  const accessibleResources = currentUser ? getAccessibleResources(currentUser.role) : [];
  const filteredTopLevelItems = currentUser 
    ? topLevelItems.filter(item => accessibleResources.includes(item.resource))
    : topLevelItems;
  const filteredManageItems = currentUser 
    ? manageItems.filter(item => accessibleResources.includes(item.resource))
    : manageItems;

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

              {filteredManageItems.length > 0 && (
                <SidebarMenuItem>
                  <Collapsible open={manageOpen} onOpenChange={setManageOpen} className="w-full">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Settings className="h-5 w-5" />
                          <span>Manage</span>
                        </div>
                        {manageOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-9 pt-2 space-y-1">
                      {filteredManageItems.map((item) => (
                        <Link 
                          key={item.path}
                          to={item.path} 
                          className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                            location.pathname === item.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-muted'
                          }`}
                        >
                          {item.icon}
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              )}
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
