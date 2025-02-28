
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import Cookies from "js-cookie";
import axios from "axios";
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
import Profile from "./components/profile";  // Import Profile
import ResetPassword from "./components/ResetPassword";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();
console.log("het");
// Custom hook to get user role
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");
      console.log("Token:", token);
      if (token) {
        try {
          const response = await axios.get("http://localhost:8089/api/auth/me", { withCredentials: true });
          setUser(response.data);
          console.log("User Data:", response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      }
      setLoading(false); // Stop loading after fetching
    };
    fetchUser();
  }, []);

  return { user, loading };
};

// Protected Route Component
const ProtectedRoute = ({ element: Component, roles }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) { // Only check after loading is complete
      if (user) {
        if (roles.includes(user.role)) {
          return; // Authorized
        } else {
          navigate("/login", { state: { from: location }, replace: true });
        }
      } else {
        navigate("/login");
      }
    }
  }, [user, loading, roles, navigate, location]);

  if (loading) {
    return <div>Loading...</div>; // Show loading spinner or placeholder
  }

  return user ? <Component /> : null;
};

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
  const noSidebarRoutes = ["/login", "/", "/register", "/forgotpassword", "/reset-password/:token", "/home", "/profile"];
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
              <Route path="/profile" element={<Profile />} /> {/* Add the Profile route */}

              {/* Role-based Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/patients" element={<ProtectedRoute element={Patients} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/calendar" element={<ProtectedRoute element={Calendar} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/records" element={<ProtectedRoute element={Records} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/emergency" element={<ProtectedRoute element={Emergency} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/staff" element={<ProtectedRoute element={Staff} roles={["Administrator"]} />} />
              <Route path="/alerts" element={<ProtectedRoute element={Alerts} roles={["Administrator", "Doctor", "Nurse"]} />} />
              <Route path="/settings" element={<ProtectedRoute element={Settings} roles={["Administrator"]} />} />
              <Route path="/forum" element={<ProtectedRoute element={Forum} roles={["Administrator", "Doctor", "Nurse", "Patient"]} />} />
              <Route path="/doctors" element={<ProtectedRoute element={Doctors} roles={["Administrator", "Doctor"]} />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <ToastContainer position="top-center" />
          {showHeaderFooter && <Footer />}
        </div>
      </div>
    </SidebarProvider>
  );
}

export default App;