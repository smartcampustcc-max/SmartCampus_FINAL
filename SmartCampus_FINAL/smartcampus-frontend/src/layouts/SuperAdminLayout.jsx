import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
} from "lucide-react";
import { logoutLocal } from "../api/auth";

export default function SuperAdminLayout() {
  const navigate = useNavigate();

  function sair() {
    logoutLocal();
    navigate("/login");
  }

  const navItems = [
    { to: "/superadmin", label: "Painel", icon: LayoutDashboard },
    { to: "/superadmin/escolas", label: "Escolas", icon: Building2 },
    { to: "/superadmin/administradores", label: "Administradores", icon: Users },
  ];

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <h2 style={{ margin: 0 }}>Super Admin</h2>
            <p style={styles.brandSub}>SmartCampus</p>
          </div>

          <nav style={styles.nav}>
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/superadmin"}
                  style={({ isActive }) => ({
                    ...styles.link,
                    ...(isActive ? styles.linkActive : {}),
                  })}
                >
                  <Icon size={18} strokeWidth={2.2} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <button onClick={sair} style={styles.logoutBtn}>
          <LogOut size={18} strokeWidth={2.2} />
          <span>Sair</span>
        </button>
      </aside>

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    background: "#F5F7FB",
  },
  sidebar: {
    background: "linear-gradient(180deg, #0A4174 , #08345D )",
    color: "#fff",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "8px 0 24px rgba(15,61,222,.12)",
  },
  brand: {
    marginBottom: 24,
  },
  brandSub: {
    margin: "4px 0 0",
    opacity: 0.8,
    fontWeight: 600,
  },
  nav: {
    display: "grid",
    gap: 10,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#fff",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 800,
    opacity: 0.92,
    transition: "all .2s ease",
    border: "1px solid transparent",
  },
  linkActive: {
    background: "#fff",
    color: "#0B1B2A",
    opacity: 1,
    border: "1px solid rgba(255,255,255,.25)",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    borderRadius: 14,
    padding: "12px 14px",
    background: "rgba(255,255,255,.12)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  content: {
    padding: 20,
  },
};