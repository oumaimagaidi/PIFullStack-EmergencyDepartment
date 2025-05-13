import { createRoot } from 'react-dom/client';
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from './context/SocketContext.jsx'; 
import { NotificationProvider } from './context/NotificationContext.jsx'; 
import { Toaster } from "@/components/ui/sonner" 
import App from './App.jsx';
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>        {/* Add SocketProvider */}
        <NotificationProvider> {/* Add NotificationProvider */}
          <App />
          <Toaster position="top-right" richColors /> {/* Add Sonner Toaster here */}
        </NotificationProvider>
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);