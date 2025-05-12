import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import DashboardLayout from "./Layouts/DashboardLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import Records from "./pages/Records";
import PublicLayout from "./Layouts/PublicLayout";
import './index.css'

import Home from "./components/home";
import Profile from "./components/profile";
import Login from "./pages/Login";
import Register from "./components/register";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Calendar from "./pages/Calendar";
import Staff from "./pages/Staff";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Emergency from"./pages/Emergency";
import Forum from "./pages/Forum";
import EmergencyRegister from "./pages/EmergencyRegister";
import ConfirmationEmergencyRegister from "./pages/ConfirmationEmergencyRegister";
import EmergencyStatus from "./pages/EmergencyStatus"; // Importez le composant de statut
import AmbulanceDashboard from "./pages/AmbulanceDashboard";
import AmbulanceNurseDashboard from "./pages/AmbulanceNurseDashboard";
import MedicalRecordDetails from './pages/MedicalRecordDetails';
import MedicalDocument from "./pages/MedicalDocument";
import Feedback from "./components/FeedBack";
import  HexGrid  from "./components/HexGrid";
import ParticlesComponent from "./components/ParticlesComponent";
import ResourcesPage from "./pages/ResourcesPage";
import PatientResourcesPage from"./pages/PatientResourcesPage";
function App() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  

  return (
      <Routes>
        {/* Redirection par défaut vers login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Routes publiques sans header/footer/sidebar */}
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      
        <Route path="/emergency-confirmation" element={<MainLayout><ConfirmationEmergencyRegister /></MainLayout>} />
        <Route path="/emergency-status" element={<MainLayout><EmergencyStatus /> </MainLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/forgotpassword" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
        <Route path="/feedback" element={<MainLayout><Feedback /></MainLayout>} />
         <Route path="/PatientResourcesPage" element={<MainLayout><PatientResourcesPage /></MainLayout>} />


<Route path="/hexa" element={<HexGrid/>}/>
        {/* Routes Main avec header/footer */}
        <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/document" element={<MainLayout><MedicalDocument /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/emergency-register" element={<MainLayout><EmergencyRegister /></MainLayout>} />
        <Route path="/emergency-confirmation" element={<MainLayout><ConfirmationEmergencyRegister /></MainLayout>} />
        

        {/* Routes Dashboard avec sidebar */}
        <Route path="/dashboard" element={
    <SidebarProvider>
        <DashboardLayout><Dashboard /></DashboardLayout>
    </SidebarProvider>} />
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
        {user?.role === 'Administrator' ? (
          <Route path="/ambulance" element={<DashboardLayout><AmbulanceDashboard /></DashboardLayout>} />
        ) : (
          <Route path="/ambulance" element={<DashboardLayout><AmbulanceNurseDashboard /></DashboardLayout>} />
        )}
      </Routes>
  );
}



export default App;
