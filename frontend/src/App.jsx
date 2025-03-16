import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import DashboardLayout from "./Layouts/DashboardLayout";
import { SidebarProvider } from "@/components/ui/sidebar";

import PublicLayout from "./Layouts/PublicLayout";
import './index.css';
import Home from "./components/Home";
import Profile from "./components/Profile";
import Login from "./pages/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Donators from "./components/Donators";
import Calendar from "./pages/Calendar";
import Staff from "./pages/Staff";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Forum from "./pages/Forum";
import EmergencyRegister from "./pages/EmergencyRegister";
import ConfirmationEmergencyRegister from "./pages/ConfirmationEmergencyRegister";
import EmergencyStatus from "./pages/EmergencyStatus";

function App() {
  return (
    <Routes>
      {/* Redirection par défaut vers login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Routes publiques sans header/footer/sidebar */}
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/emergency-confirmation" element={<PublicLayout><ConfirmationEmergencyRegister /></PublicLayout>} />
      <Route path="/emergency-status" element={<EmergencyStatus />} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/forgotpassword" element={<PublicLayout><ForgotPassword /></PublicLayout>} />

      {/* Routes Main avec header/footer */}
      <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
      <Route path="/emergency-register" element={<MainLayout><EmergencyRegister /></MainLayout>} />

      {/* Routes Dashboard avec sidebar */}
      <Route path="/dashboard" element={
        <SidebarProvider>
          <DashboardLayout><Dashboard /></DashboardLayout>
        </SidebarProvider>
      } />
      <Route path="/doctors" element={<DashboardLayout><Doctors /></DashboardLayout>} />
      <Route path="/donators" element={<DashboardLayout><Donators /></DashboardLayout>} />
      <Route path="/patients" element={<DashboardLayout><Patients /></DashboardLayout>} />
      <Route path="/calendar" element={<DashboardLayout><Calendar /></DashboardLayout>} />
      <Route path="/staff" element={<DashboardLayout><Staff /></DashboardLayout>} />
      <Route path="/alerts" element={<DashboardLayout><Alerts /></DashboardLayout>} />
      <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
      <Route path="/forum" element={<DashboardLayout><Forum /></DashboardLayout>} />
    </Routes>
  );
}

export default App;