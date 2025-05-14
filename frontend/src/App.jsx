import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import DashboardLayout from "./Layouts/DashboardLayout";
import PublicLayout from "./Layouts/PublicLayout";
import './index.css';

import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { AccessibilityProvider } from './context/AccessibilityContext'; 
import useAccessibilityTTS from './hooks/useAccessibilityTTS'; 
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";

// Components & Pages
import Home from "./components/home";
import Profile from "./components/profile";
import Login from "./pages/Login";
import Register from "./components/register";
import ForgotPassword from "./components/ForgotPassword";
import Feedback from "./components/FeedBack";
import HexGrid from "./components/HexGrid";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Calendar from "./pages/Calendar";
import Staff from "./pages/Staff";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Emergency from "./pages/Emergency";
import Forum from "./pages/Forum";
import EmergencyRegister from "./pages/EmergencyRegister";
import ConfirmationEmergencyRegister from "./pages/ConfirmationEmergencyRegister";
import EmergencyStatus from "./pages/EmergencyStatus";
import AmbulanceDashboard from "./pages/AmbulanceDashboard";
import AmbulanceNurseDashboard from "./pages/AmbulanceNurseDashboard";
import MedicalRecordDetails from './pages/MedicalRecordDetails';
import MedicalDocument from "./pages/MedicalDocument";
import ResourcesPage from "./pages/ResourcesPage";
import AmbulanceCheck from "./pages/AmbulanceCheck";
import Records from "./pages/Records";
import ActiveBloodRequestsPage from "./pages/ActiveBloodRequestsPage";
import ManageBloodRequestes from "./components/staff/ManageBloodRequestsPage";

function AppContent() {
  useAccessibilityTTS(); // Appel du hook pour activer l'accessibilité

  const user = JSON.parse(sessionStorage.getItem("user"));

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Public routes */}
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/forgotpassword" element={<PublicLayout><ForgotPassword /></PublicLayout>} />

          {/* Main layout routes */}
          <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/feedback" element={<MainLayout><Feedback /></MainLayout>} />
          <Route path="/document" element={<MainLayout><MedicalDocument /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/emergency-register" element={<MainLayout><EmergencyRegister /></MainLayout>} />
          <Route path="/emergency-confirmation" element={<MainLayout><ConfirmationEmergencyRegister /></MainLayout>} />
          <Route path="/emergency-status" element={<MainLayout><EmergencyStatus /></MainLayout>} />
          <Route path="/ambulance_check" element={<MainLayout><AmbulanceCheck /></MainLayout>} />
          <Route path="/blood-requests/active" element={<MainLayout><ActiveBloodRequestsPage/></MainLayout>} />

          <Route path="/hexa" element={<HexGrid />} />

          {/* Dashboard layout routes */}
          <Route path="/dashboard" element={<SidebarProvider><DashboardLayout><Dashboard /></DashboardLayout></SidebarProvider>} />
          <Route path="/doctors" element={<DashboardLayout><Doctors /></DashboardLayout>} />
          <Route path="/patients" element={<DashboardLayout><Patients /></DashboardLayout>} />
          <Route path="/calendar" element={<DashboardLayout><Calendar /></DashboardLayout>} />
          <Route path="/records" element={<DashboardLayout><Records /></DashboardLayout>} />
          <Route path="/medical-records/:id" element={<DashboardLayout><MedicalRecordDetails /></DashboardLayout>} />
          <Route path="/staff" element={<DashboardLayout><Staff /></DashboardLayout>} />
          <Route path="/alerts" element={<DashboardLayout><Alerts /></DashboardLayout>} />
          <Route path="/emergency" element={<DashboardLayout><Emergency /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          <Route path="/forum" element={<DashboardLayout><Forum /></DashboardLayout>} />
          <Route path="/resources" element={<DashboardLayout><ResourcesPage /></DashboardLayout>} />
          <Route path="/staff/blood-requests/manage" element={<DashboardLayout><ManageBloodRequestes /></DashboardLayout>} />

          {user?.role === 'Administrator' ? (
            <Route path="/ambulance" element={<DashboardLayout><AmbulanceDashboard /></DashboardLayout>} />
          ) : (
            <Route path="/ambulance" element={<DashboardLayout><AmbulanceNurseDashboard /></DashboardLayout>} />
          )}
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <NotificationProvider>
        <SocketProvider>
          {/* <SidebarProvider> */}
           
            <AppContent />
          {/* </SidebarProvider> */}
        </SocketProvider>
      </NotificationProvider>
    </AccessibilityProvider>
  );
}


export default App;
