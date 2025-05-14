// src/components/DashboardSidebar.jsx
"use client";
import React from 'react'; // Ensure React is imported
// import { useTheme } from "./theme-provider"; // Kept if you need theme context for other things
import {
  Calendar,
  ClipboardList,
  Home,
  Users,
  Bell,
  Settings,
  UserCog,
  Hospital,
  Stethoscope,
  MessageCircle,
  LogIn,
  Ambulance,
  ChevronRight,
  // Moon, // Not used in this version of sidebar body
  // Sun,   // Not used in this version of sidebar body
  ListChecks
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button"; // Assuming this Button is from your existing UI lib and you want to keep it for the top-right Home button

// --- Inlined UI Components ---

const Sidebar = ({ className, children }) => (
  <aside className={`flex flex-col h-screen ${className}`}>
    {children}
  </aside>
);

const SidebarHeader = ({ className, children }) => (
  <div className={`px-4 ${className}`}>{children}</div>
);

const SidebarContent = ({ className, children }) => (
  <div className={`flex-1 overflow-y-auto ${className}`}>{children}</div>
);

const SidebarGroup = ({ className, children }) => (
  <div className={`py-2 ${className}`}>{children}</div>
);

const SidebarGroupLabel = ({ className, children }) => (
  <h3 className={`px-4 mb-1 text-xs font-semibold tracking-wider ${className}`}>
    {children}
  </h3>
);

const SidebarGroupContent = ({ className, children }) => (
  <div className={className}>{children}</div>
);

const SidebarMenu = ({ className, children }) => (
  <ul className={`space-y-1 ${className}`}>{children}</ul>
);

const SidebarMenuItem = ({ className, children }) => (
  <li className={className}>{children}</li>
);

// SidebarMenuButton will now be directly a Link, styled.
// No need for asChild as we are controlling the rendering directly.

const SidebarFooter = ({ className, children }) => (
  <div className={`p-4 border-t border-[#547792]/20 ${className}`}>
    {children}
  </div>
);

const SidebarSeparator = ({ className }) => (
  <hr className={`my-3 border-[#547792]/20 ${className}`} />
);

// --- Main DashboardSidebar Component ---

const DashboardSidebar = () => {
  // const { theme } = useTheme(); // Kept if needed for conditional styling not covered by direct colors
  const navigate = useNavigate();
  const location = useLocation(); // For active menu item

  const mainMenuItems = [
    { title: "Dashboard", icon: Home, path: "/dashboard" },
    { title: "Calendar", icon: Calendar, path: "/calendar" },
    { title: "Blood Requests", icon: ListChecks, path: "/staff/blood-requests/manage" },
    { title: "Alerts", icon: Bell, path: "/alerts" },
  ];

  const medicalMenuItems = [
    { title: "Doctors", icon: Stethoscope, path: "/doctors" },
    { title: "Patients", icon: Users, path: "/patients" },
    { title: "Records", icon: ClipboardList, path: "/records" },
    { title: "Emergency", icon: Hospital, path: "/emergency" },
    { title: "Ambulance", icon: Ambulance, path: "/ambulance" },
    { title: "Resources", icon: ClipboardList, path: "/resources" },
  ];

  const managementMenuItems = [
    { title: "Staff", icon: UserCog, path: "/staff" },
  
    { title: "Settings", icon: Settings, path: "/settings" },
    { title: "Login", icon: LogIn, path: "/login" },
  ];

  const renderMenuItems = (items) => {
    return items.map((item) => {
      const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
      return (
        <SidebarMenuItem key={item.title}>
          <Link
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-[#213448] hover:bg-[#547792]/10 transition-colors ${
              isActive ? "font-bold bg-[#213448]/15" : "font-medium"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? "text-[#213448]" : "text-[#213448]/80"}`} />
            <span className="flex-1">{item.title}</span>
            <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
          </Link>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <Sidebar className="w-72 bg-gradient-to-b from-[#213448] to-[#ECEFCA] text-[#547792] shadow-lg">
      <SidebarHeader className="py-6">
        <div className="flex items-center gap-3">
          <img src="/images/logo1.png" alt="Emergency Management System Logo" className="h-12 w-auto" />
          <div>
            <h1 className="text-xl font-bold text-white">Emergency</h1> {/* White contrasts well on dark part of gradient */}
            <p className="text-sm text-[#D0E0F0]/90">Management System</p> {/* Lighter shade for subtitle */}
          </div>
        </div>
      </SidebarHeader>

      {/* Home button positioned at top right of the viewport */}
      

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#547792]/80">
            MAIN
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(mainMenuItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[#547792]/80">
            MEDICAL
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(medicalMenuItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[#547792]/80">
            MANAGEMENT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(managementMenuItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="text-center text-xs text-[#547792]/70">
        © {new Date().getFullYear()} EMS. All rights reserved.
        {/* You can add more footer content here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;