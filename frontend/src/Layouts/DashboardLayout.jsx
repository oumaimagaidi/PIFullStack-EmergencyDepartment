import { useEffect } from 'react';
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader"; // <--- 1. Import the header
import { SidebarProvider } from '../components/ui/sidebar';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export default function DashboardLayout({ children }) {
    const { socket, isConnected } = useSocket();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    useEffect(() => {
        if (socket && isConnected) {
            console.log("DashboardLayout: Socket connected, setting up 'notification' listener.");

            const handleNotification = (data) => {
                console.log("🔔 Notification received in Layout:", data);
                addNotification(data);

                let targetPath = '/emergency';
                toast.info(data.message || "New notification received", {
                    description: `Patient: ${data.patientName || 'N/A'}. Level: ${data.emergencyLevel || 'N/A'}. Status: ${data.newStatus || 'N/A'}`,
                    duration: 10000,
                    action: {
                        label: "View Details",
                        onClick: () => {
                            console.log(`Navigating due to notification for patient: ${data.patientId}`);
                            navigate(targetPath, { state: { highlightPatientId: data.patientId } });
                        },
                    },
                });
            };

            socket.on('notification', handleNotification);

            return () => {
                console.log("DashboardLayout: Cleaning up 'notification' listener.");
                socket.off('notification', handleNotification);
            };
        } else {
            console.log("DashboardLayout: Socket not available or not connected. Listener not set.");
        }
    }, [socket, isConnected, navigate, addNotification]);

    return (
        <SidebarProvider>
            <div className="dashboard-container" style={{ display: 'flex', width: '100%' }}>
                <DashboardSidebar />
                {/* Main content area that includes the header and the page content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}> {/* Wrapper div */}
                    <DashboardHeader /> {/* <--- 2. Render the header HERE */}
                    {/* Content area with padding and scrolling */}
                    <div className="dashboard-content" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                        {children} {/* Page content (Dashboard, Doctors, etc.) */}
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}