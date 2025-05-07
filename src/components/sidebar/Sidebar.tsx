
import React from 'react';
import { 
  Sidebar as SidebarContainer, 
  SidebarContent, 
  SidebarHeader,
  SidebarTrigger
} from '@/components/ui/sidebar';
import TopLevelMenu from './TopLevelMenu';
import ManageMenu from './ManageMenu';
import UserSection from './UserSection';
import { Package, Menu } from 'lucide-react';

export const Sidebar = () => {
  return (
    <SidebarContainer>
      <SidebarHeader className="py-6">
        <div className="flex items-center px-4 gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold">AgriPay Admin</span>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <TopLevelMenu />
        <ManageMenu />
        <UserSection />
      </SidebarContent>
    </SidebarContainer>
  );
};
