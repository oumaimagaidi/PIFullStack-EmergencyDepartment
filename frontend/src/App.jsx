import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./components/login";
import Register from "./components/register";
import Profile from "./components/profile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Home from "./components/Home/Home";
import Header from "./components/header";
import Footer from "./components/footer";
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
import ProtectedRoute from "./components/ProtectedRoute";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const queryClient = new QueryClient();

function App() {
    return (
        <GoogleOAuthProvider clientId="681587327914-bh8qlfn9kr76hci8d4n0v1mces8ac0r0.apps.googleusercontent.com">
            <QueryClientProvider client={queryClient}>
                <Router>
                    <MainContent />
                </Router>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    );
}

function MainContent() {
    const navigate = useNavigate();
    const hideHeaderFooter = location.pathname === "/login" || location.pathname === "/" || location.pathname === "/register" || location.pathname === "/ForgotPassword" || location.pathname === "/reset-password/:token";

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem("user"));
        if (user) {
            if (user.role === "patient") {
                navigate("/home");
            } else {
                navigate("/");
            }
        }
    }, [navigate]);

    return (
        <div className="App">
            {!hideHeaderFooter && <Header />}
            <main className="container mt-5">
                <Routes>
                    {/* Routes publiques */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/home" element={<Home />} />

                    {/* Routes protégées pour les admins, docteurs et infirmiers */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patients"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Patients />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/calendar"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Calendar />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/records"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Records />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/emergency"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Emergency />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/staff"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Staff />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/alerts"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Alerts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/forum"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Forum />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/doctors"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                                <Doctors />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>

            {!hideHeaderFooter && <Footer />}
        </div>
    );
}

export default App;
