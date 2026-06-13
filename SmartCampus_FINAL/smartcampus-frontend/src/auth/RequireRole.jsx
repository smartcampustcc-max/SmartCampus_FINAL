import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireRole({ role }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div style={{ padding: 20 }}>A carregar...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = String(user?.role || user?.perfil || "")
    .toLowerCase()
    .trim();

  const allowedRoles = Array.isArray(role)
    ? role.map((r) => String(r).toLowerCase().trim())
    : [String(role).toLowerCase().trim()];

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}