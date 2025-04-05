import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
} from "lucide-react";
import { Link } from "react-router-dom";
import "../app.css";
const menuItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Doctors", icon: Stethoscope, path: "/doctors" },
  { title: "Patients", icon: Users, path: "/patients" },
  { title: "Calendar", icon: Calendar, path: "/calendar" },
  { title: "Records", icon: ClipboardList, path: "/records" },
  { title: "Emergency", icon: Hospital, path: "/emergency" },
  { title: "Staff", icon: UserCog, path: "/staff" },
  { title: "Forum", icon: MessageCircle, path: "/forum" },
  { title: "Alerts", icon: Bell, path: "/alerts" },
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Ambulance", icon: Ambulance, path: "/ambulance" },
  { title: "Login", icon: LogIn, path: "/login" },
];

const DashboardSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <h1 className="text-xl font-bold text-white">Emergency Care</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center gap-2 text-white">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;