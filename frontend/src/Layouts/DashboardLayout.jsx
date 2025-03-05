import DashboardSidebar from "../components/DashboardSidebar";
import { SidebarProvider } from '../components/ui/sidebar';

export default function DashboardLayout({ children }) {
    return (
        <SidebarProvider>
            <div className="dashboard-container" style={{ display: 'flex' }}>
                <DashboardSidebar />
                <div className="dashboard-content" style={{ flex: 1, padding: '20px' }}>
                    {children} {/* C’est ici que la page (Dashboard, Doctors, etc.) va s'afficher */}
                </div>
            </div>
        </SidebarProvider>
    );
}
