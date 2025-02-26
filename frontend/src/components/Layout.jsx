// src/components/Layout.jsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader"; // Importez DashboardHeader

const Layout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950">
        <DashboardSidebar />
        <div className="flex-1"> {/* Conteneur pour Header et Main */}
          <DashboardHeader /> {/* Ajoutez le composant DashboardHeader ici */}
          <main className="flex-1 p-6">
            <SidebarTrigger />
            <div className="fade-in">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;