
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <SidebarTrigger />
          <div className="fade-in">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
