// App.jsx (App component)
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './components/Login/login';
import Dashboard from './pages/Dashboard';  // Ensure this is imported correctly
import Register from './components/register';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/home';
import Profile from './components/profile';
import Patient from './pages/Patients';
import Doctors from './pages/Doctors'
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/patient" element={<Patient />} />
      <Route path="/doctors" element={<Doctors />} />
    </Routes>
  );
}

export default App;
