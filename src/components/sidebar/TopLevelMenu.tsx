
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenuItem, 
  SidebarMenu, 
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar';
import { Home, Users } from 'lucide-react';

const TopLevelMenu = () => {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  const topLevelItems = [
    {
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/dashboard'
    },
    {
      title: 'Farmers',
      icon: <Users className="h-5 w-5" />,
      path: '/farmers'
    }
  ];

  const handleSalesDashboardClick = () => {
    setOpenMobile(false);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {topLevelItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild>
                <Link 
                  to={item.path} 
                  className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                    location.pathname === item.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-muted'
                  }`}
                  onClick={item.path === '/sales-dashboard' ? handleSalesDashboardClick : undefined}
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
