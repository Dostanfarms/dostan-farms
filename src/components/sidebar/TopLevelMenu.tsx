
import React from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  UserCheck, 
  Receipt, 
  Ticket,
  Gift
} from 'lucide-react';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from '@/components/ui/sidebar';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';

const TopLevelMenu = () => {
  const { checkPermission } = useAuth();
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const getNavClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "bg-muted text-primary font-medium" 
      : "hover:bg-muted/50";
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      resource: "dashboard",
      action: "view" as const
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,
      resource: "products",
      action: "view" as const
    },
    {
      title: "Sales Dashboard",
      url: "/sales-dashboard",
      icon: ShoppingCart,
      resource: "sales",
      action: "view" as const
    },
    {
      title: "Sales",
      url: "/sales",
      icon: Receipt,
      resource: "sales",
      action: "view" as const
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
      resource: "customers",
      action: "view" as const
    },
    {
      title: "Farmers",
      url: "/farmers",
      icon: UserCheck,
      resource: "farmers",
      action: "view" as const
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: Ticket,
      resource: "tickets",
      action: "view" as const
    },
    {
      title: "Coupons",
      url: "/coupons",
      icon: Gift,
      resource: "coupons",
      action: "view" as const
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    checkPermission(item.resource, item.action)
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink 
                  to={item.url} 
                  className={getNavClass(item.url)}
                  onClick={handleLinkClick}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default TopLevelMenu;
