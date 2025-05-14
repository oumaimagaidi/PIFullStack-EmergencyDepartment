// src/main.jsx
import { createRoot } from 'react-dom/client';
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'; // <-- Importez le nouveau Provider
import { Toaster } from "@/components/ui/sonner"
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <NotificationProvider>
          <AccessibilityProvider> {/* <-- Enveloppez l'App avec le Provider */}
            <App />
           
          </AccessibilityProvider> {/* <-- Fin du Provider */}
        </NotificationProvider>
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);