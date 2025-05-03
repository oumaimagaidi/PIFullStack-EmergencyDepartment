// src/main.jsx (Example - adjust based on your actual file)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx'; // <-- Import
import { Toaster } from "@/components/ui/sonner";
import './index.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <NotificationProvider> {/* <-- Wrap App */}
          <App />
          <Toaster position="top-right" />
        </NotificationProvider>
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>,
);