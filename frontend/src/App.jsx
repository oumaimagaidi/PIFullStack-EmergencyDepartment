import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import Cookies from "js-cookie";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import Layout from "./components/Layout";
import DashboardSidebar from "./components/DashboardSidebar";
import Header from "./components/header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
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
import Profile from "./components/profile";
import ResetPassword from "./components/ResetPassword";
import EmergencyRegister from "./pages/EmergencyRegister";

const queryClient = new QueryClient();

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:8089/api/auth/me", { withCredentials: true });
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return { user, loading };
};

const ProtectedRoute = ({ element, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return element;
};

const App = () => (
  <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <MainContent />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

function MainContent() {
  const location = useLocation();
  const noSidebarRoutes = ["/login", "/", "/register", "/forgotpassword", "/reset-password/:token", "/home", "/profile", "/emergency-register"];
  const showHeaderFooter = ["/home", "/emergency-register"];

  return (
    <SidebarProvider>
      <div className="App d-flex flex-column" style={{ minHeight: "100vh" }}>
        {showHeaderFooter.includes(location.pathname) && <Header />}
        <div className="d-flex flex-grow-1">
          {!noSidebarRoutes.includes(location.pathname) && <DashboardSidebar />}
          <main className="container mt-5 flex-grow-1">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/emergency-register" element={<EmergencyRegister />} />
              <Route path="/dashboard" element={<ProtectedRoute element={<Layout><Dashboard /></Layout>} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/patients" element={<ProtectedRoute element={<Layout><Patients /></Layout>} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/calendar" element={<ProtectedRoute element={<Layout><Calendar /></Layout>} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/records" element={<ProtectedRoute element={<Layout><Records /></Layout>} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/emergency" element={<ProtectedRoute element={<Layout><Emergency /></Layout>} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/staff" element={<ProtectedRoute element={<Layout><Staff /></Layout>} roles={["Administrator"]} />} />
              <Route path="/alerts" element={<ProtectedRoute element={<Layout><Alerts /></Layout>} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/settings" element={<ProtectedRoute element={<Layout><Settings /></Layout>} roles={["Administrator"]} />} />
              <Route path="/forum" element={<ProtectedRoute element={<Layout><Forum /></Layout>} roles={["Administrator", "Doctor", "Nurse", "Patient"]} />} />
              <Route path="/doctors" element={<ProtectedRoute element={<Layout><Doctors /></Layout>} roles={["Administrator", "Doctor"]} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        {showHeaderFooter.includes(location.pathname) && <Footer />}
        <ToastContainer position="top-center" />
      </div>
    </SidebarProvider>
  );
}

export default App;
