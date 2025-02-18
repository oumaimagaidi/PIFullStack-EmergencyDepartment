import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ForgotPassword from "./components/ForgotPassword";
import Home from "./components/home";
import Header from "./components/header";
import { FooterComponent } from "./components/footer";
import AnimatedBackground from "./components/AnimatedBackground";
import ResetPassword from "./components/ResetPassword";
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="681587327914-bh8qlfn9kr76hci8d4n0v1mces8ac0r0.apps.googleusercontent.com">
      <Router>
        <MainContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

function MainContent() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/login" || location.pathname === "/" || location.pathname === "/register";

  return (
   
      <div className="App">
        {!hideHeaderFooter && <Header />}
        
        <main className="container mt-5">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </main>

        {!hideHeaderFooter && <FooterComponent />}
      </div>
    
  );
}

export default App;
