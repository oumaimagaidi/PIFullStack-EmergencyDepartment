import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Si le rôle de l'utilisateur n'est pas autorisé
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" />;
  }

  // L'utilisateur a le rôle autorisé, afficher les enfants
  return children;
};

export default ProtectedRoute;
