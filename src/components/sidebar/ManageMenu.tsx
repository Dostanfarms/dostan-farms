
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenuItem, 
  SidebarMenu, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Package, 
  Receipt, 
  ShoppingCart, 
  Settings,
  UserCog,
  Tag,
  Ticket
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/context/AuthContext';
import { getAccessibleResources } from '@/utils/employeeData';

const ManageMenu = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [manageOpen, setManageOpen] = useState(false);

  // Open the manage menu if current location is under any manage item
  useEffect(() => {
    const managePathsToCheck = ['/products', '/sales', '/transactions', '/coupons', '/employees', '/roles', '/tickets'];
    if (managePathsToCheck.some(path => location.pathname.startsWith(path))) {
      setManageOpen(true);
    }
  }, [location.pathname]);

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
      title: 'Coupons',
      icon: <Tag className="h-5 w-5" />,
      path: '/coupons',
      resource: 'coupons'
    },
    {
      title: 'Tickets',
      icon: <Ticket className="h-5 w-5" />,
      path: '/tickets',
      resource: 'tickets'
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
  const filteredManageItems = currentUser 
    ? manageItems.filter(item => accessibleResources.includes(item.resource))
    : manageItems;

  if (filteredManageItems.length === 0) {
    return null;
  }

  return (
    <SidebarMenu>
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
    </SidebarMenu>
  );
};

export default ManageMenu;
