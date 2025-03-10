// src/components/Layout.jsx
import React from 'react';
import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import DashboardSidebar from "./DashboardSidebar";

export const HeaderFooterLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const DashboardLayout = () => {
  return (
    <div className="flex">
      <DashboardSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export const BasicLayout = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};