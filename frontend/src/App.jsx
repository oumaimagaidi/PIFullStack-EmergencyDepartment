import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

// Layout & Components
import Header from "./components/header";
import Footer from "./components/Footer";
import Layout from "./components/Layout";
import { ToastContainer } from "react-toastify";

// Pages
import Login from "./components/Login";
import Register from "./components/register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Home from "./components/Home";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Calendar from "./pages/Calendar";
import Records from "./pages/Records";
import Emergency from "./pages/Emergency";
import Staff from "./pages/Staff";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Forum from "./pages/Forum";
import Doctors from "./pages/Doctors";
import NotFound from "./pages/NotFound";
import Profile from "./components/profile";

const queryClient = new QueryClient();

function App() {
  return (
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
}


function MainContent() {
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
    );
  }
  

export default App;
