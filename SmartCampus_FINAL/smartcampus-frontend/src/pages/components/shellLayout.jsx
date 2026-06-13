import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const navStyle = ({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 14,
  textDecoration: "none",
  fontWeight: 900,
  color: isActive ? "#001D39" : "rgba(255,255,255,.92)",
  background: isActive ? "rgba(255,255,255,.92)" : "transparent",
  border: isActive ? "1px solid rgba(255,255,255,.22)" : "1px solid transparent",
});

export default function ShellLayout({ title, menu }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        minHeight: "100vh",
      }}
    >
      {/* SIDEBAR */}
      <aside
        className="sidebar"
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 950 }}>{title}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>SmartCampus</div>
        </div>

        <nav style={{ display: "grid", gap: 8 }}>
          {menu.map((m) => (
            <NavLink key={m.to} to={m.to} style={navStyle}>
              {m.label}
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <LogoutButton />
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main
        className="page"
        style={{
          padding: 18,
          background: "var(--sc-bg)",
        }}
      >
        <div
          className="topbar"
          style={{
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 18 }}>{title}</div>
          <div style={{ color: "var(--sc-muted)", fontSize: 13 }}>Painel de gestão</div>
        </div>

        <div
          className="sc-card"
          style={{
            padding: 16,
            background: "var(--sc-surface)",
            border: "1px solid var(--sc-border)",
            borderRadius: 18,
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );

}


