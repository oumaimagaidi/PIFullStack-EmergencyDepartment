// src/components/Layout.jsx
import React from 'react';
import DashboardSidebar from './DashboardSidebar';
import { SidebarProvider } from "@/components/ui/sidebar"; // Import SidebarProvider

const Layout = ({ children }) => {
  return (
      <div className="d-flex">
        <DashboardSidebar />
        <div className="content-container flex-grow-1 p-4">
            {/* No Header here! */}
            <main className="container mt-5">
                {children}
            </main>
        </div>
      </div>
  );
};

export default Layout;