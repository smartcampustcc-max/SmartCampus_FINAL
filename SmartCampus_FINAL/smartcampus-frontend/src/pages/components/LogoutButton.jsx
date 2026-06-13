import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { logoutLocal } from "../../api/auth";

export default function LogoutButton({ collapsed }) {
  const navigate = useNavigate();

  function handleLogout() {
    logoutLocal();
    navigate("/login");
  }

  return (
    <button
      onClick={handleLogout}
      title="Sair"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: 10,
        padding: "10px 12px",
        width: "100%",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.15)",
        background: "rgba(255,255,255,.10)",
        color: "#fff",
        fontWeight: 800,
        cursor: "pointer",
        transition: "all .2s ease",
      }}
    >
      <LogOut size={18} />

      {!collapsed && <span>Sair</span>}
    </button>
  );
}
