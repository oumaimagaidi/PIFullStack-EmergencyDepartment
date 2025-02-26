import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import DashboardSidebar from "./components/DashboardSidebar";
import Header from "./components/header";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Calendar from "./pages/Calendar";
import Records from "./pages/Records";
import Emergency from "./pages/Emergency";
import Staff from "./pages/Staff";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Forum from "./pages/Forum";
import Doctors from "./pages/Doctors";
import Login from "./components/Login";
import Register from "./components/register";
import ForgotPassword from "./components/ForgotPassword";
import Home from "./components/Home";
import ResetPassword from "./components/ResetPassword";
import { ToastContainer } from "react-toastify";
import NotFound from "./pages/NotFound";
import Profile from "./components/profile";

const queryClient = new QueryClient();

const App = () => (
  <GoogleOAuthProvider clientId="681587327914-bh8qlfn9kr76hci8d4n0v1mces8ac0r0.apps.googleusercontent.com">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <MainContent />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

function MainContent() {
  const location = useLocation();
  const noSidebarRoutes = ["/login", "/", "/register", "/forgotpassword", "/reset-password/:token","/home"];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);
  const showHeaderFooter = location.pathname === "/home";

  return (
    <SidebarProvider>
      <div className="App d-flex">
        {showSidebar && <DashboardSidebar />}
        <div className="content-container flex-grow-1">
          {showHeaderFooter && <Header />}
          <main className="container mt-5">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/records" element={<Records />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <ToastContainer position="top-center" />
          {showHeaderFooter && <Footer />}
        </div>
    const location = useLocation();
    const hideHeaderFooterRoutes = [
      "/login", 
      "/", 
      "/register", 
      "/forgotpassword", 
      "/reset-password/:token",
      "/dashboard",
      "/patients",
      "/calendar",
      "/records",
      "/emergency",
      "/staff",
      "/alerts",
      "/settings",
      "/forum",
      "/doctors"
    ];
  
    const hideHeaderFooter = hideHeaderFooterRoutes.includes(location.pathname);
  
    return (
      <div className="App">
        {!hideHeaderFooter && <Header />}
        <main className="container mt-5">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/home" element={<Home />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/records" element={<Records />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/profile" element={<Profile />} />
            {/* Catch-All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ToastContainer position="top-center" />
        {!hideHeaderFooter && <Footer />}
      </div>
    </SidebarProvider>
  );
}

export default App;
