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
import { Link } from "react-router-dom";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

const DashboardSidebar = () => {
  const { theme, toggleTheme } = useTheme();

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium dark:text-sidebar-foreground">Admin User</span>
              <span className="text-xs text-sidebar-foreground/70 dark:text-sidebar-foreground/70">Administrator</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-9 w-9 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;