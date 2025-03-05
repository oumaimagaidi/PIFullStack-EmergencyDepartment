import { Outlet } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import DashboardSidebar from "./components/DashboardSidebar";

/**
 * Layout avec Header et Footer
 * Utilisé pour les pages comme Home et Profile
 */
export const HeaderFooterLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* Affiche les composants enfants des routes imbriquées */}
      </main>
      <Footer />
    </>
  );
};

/**
 * Layout avec DashboardSidebar
 * Utilisé pour les pages comme Dashboard, Doctors, Patients, etc.
 */
export const DashboardLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <DashboardSidebar />
      <main style={{ flex: 1 }}>
        <Outlet /> {/* Affiche les composants enfants des routes imbriquées */}
      </main>
    </div>
  );
};

/**
 * Layout de base sans Header, Footer ou Sidebar
 * Utilisé pour les pages comme Login, Register, ForgotPassword, etc.
 */
export const BasicLayout = () => {
  return (
    <main>
      <Outlet /> {/* Affiche les composants enfants des routes imbriquées */}
    </main>
  );
};