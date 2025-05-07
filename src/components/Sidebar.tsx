
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar as SidebarComponent } from './sidebar/Sidebar';

// This wrapper ensures the Sidebar always has Router context
const Sidebar = () => {
  return (
    <BrowserRouter>
      <SidebarComponent />
    </BrowserRouter>
  );
};

export default Sidebar;
