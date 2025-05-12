// src/components/DashboardSidebar.jsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
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
  Moon,
  Sun,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

const DashboardSidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate(); // Define navigate using useNavigate hook

  const mainMenuItems = [
    { title: "Dashboard", icon: Home, path: "/dashboard" },
    { title: "Calendar", icon: Calendar, path: "/calendar" },
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
    { title: "Forum", icon: MessageCircle, path: "/forum" },
    { title: "Settings", icon: Settings, path: "/settings" },
    { title: "Login", icon: LogIn, path: "/login" },
  ];

  const renderMenuItems = (items) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <Link
            to={item.path}
            className="flex items-center gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors dark:text-sidebar-foreground dark:hover:text-sidebar-accent-foreground"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background dark:bg-sidebar-background">
      <SidebarHeader className="py-4">
        <div className="flex items-center px-4 gap-2">
          <img src="/images/logo1.png" alt="Emergency Management System Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold text-primary-500 dark:text-primary-500">Emergency</h1>
            <p className="text-xs text-sidebar-foreground/70 dark:text-sidebar-foreground/70">Management System</p>
          </div>
        </div>
      </SidebarHeader>
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => navigate("/home")} // Use the navigate function
          className="rounded-full p-3 shadow-lg hover:shadow-xl transition-all bg-white/90 backdrop-blur-sm"
          variant="ghost"
        >
          <Home className="h-6 w-6 text-blue-600 hover:text-blue-700" />
        </Button>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 dark:text-sidebar-foreground/70">
            MAIN
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(mainMenuItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 dark:text-sidebar-foreground/70">
            MEDICAL
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(medicalMenuItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 dark:text-sidebar-foreground/70">
            MANAGEMENT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(managementMenuItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border dark:border-sidebar-border">
        {/* Footer content */}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;