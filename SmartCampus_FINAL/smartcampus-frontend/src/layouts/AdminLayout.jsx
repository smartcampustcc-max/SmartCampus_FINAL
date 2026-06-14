import { useMemo, useState,useEffect} from "react";
import { NavLink, Outlet, useLocation,useNavigate } from "react-router-dom";
import LogoutButton from "../pages/components/LogoutButton";
import http   from "../api/http";
import { getUser } from "../api/auth";
import {
  LayoutDashboard,
  UserCog,
  BookOpen,
  MessageSquare,
  School,
  GraduationCap,
  Link as LinkIcon,
  CalendarDays,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
} from "lucide-react";

const getLinkStyle = (isActive, collapsed) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: collapsed ? "12px 10px" : "12px 14px",
  borderRadius: 14,
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 14,
  color: isActive ? "#0A4174" : "#F9FAFB",
  background: isActive ? "#F9FAFB" : "transparent",
  border: isActive
    ? "1px solid rgba(255,255,255,.18)"
    : "1px solid transparent",
  justifyContent: collapsed ? "center" : "flex-start",
  transition: "all .22s ease",
  position: "relative",
});

const navItems = [
  { to: "/admin/dashboard", label: "Painel", icon: LayoutDashboard },

    { to: "/admin/cursos", label: "Cursos", icon: BookOpen },
    { to: "/admin/disciplinas", label: "Disciplinas", icon: BookOpen },

  { to: "/admin/professores", label: "Professores", icon: UserCog },
  { to: "/admin/turmas", label: "Turmas", icon: School },
  { to: "/admin/alunos", label: "Alunos", icon: GraduationCap },

  { to: "/admin/atribuicoes", label: "Atribuições", icon: LinkIcon },
  { to: "/admin/horarios", label: "Horários", icon: CalendarDays },

   { to: "/admin/chats", label: "Supervisão de Chats", icon: MessageSquare},
   { to: "/admin/informacoes", label: "Informações", icon: Info },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
const [notificacoes, setNotificacoes] = useState([]);
const [openNotificacoes, setOpenNotificacoes] = useState(false);
  const user = getUser?.();

  const currentTitle = useMemo(() => {
    const found = navItems.find((item) => location.pathname.startsWith(item.to));
    return found?.label || "Painel";
  }, [location.pathname]);

  const currentSubtitle = useMemo(() => {
    const map = {
      Painel: "Visão geral do sistema SmartCampus.",
      Professores: "Gestão e controlo dos professores cadastrados.",
      Disciplinas: "Gestão das disciplinas disponíveis no sistema.",
      Cursos: "Cursos disponíveis no sistema.",
      Turmas: "Gestão e organização das turmas.",
      Alunos: "Consulta e gestão dos alunos cadastrados.",
      Horários: "Gestão do horário escolar por turma, disciplina, sala e professor.",
      Atribuições: "Ligação entre professores, turmas e disciplinas.",
     "Supervisão de  Chats": "Acompanhamento das comunicações entre professores e alunos.",
      Informações: "Dados Instituicionais do Colégio Henriques.",
    };

    return map[currentTitle] || "Área administrativa do sistema.";
  }, [currentTitle]);

  const userName = user?.name || user?.username || "Administrador";
  const schoolName = "Colégio Henriques do kinaxixi"
  const initials = userName.trim().charAt(0).toUpperCase();

  const sidebarWidth = collapsed ? 86 : 268;

  useEffect(() => {
  carregarNotificacoes();
}, []);

async function carregarNotificacoes() {
  try {
    const res = await http.get("/admin/notificacoes");
    setNotificacoes(Array.isArray(res.data) ? res.data : []);
  } catch {
    setNotificacoes([]);
  }
}

  return (
    <div style={{ minHeight: "100vh", background: "#F5F9FC" }}>
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: sidebarWidth,
          padding: 16,
          background: "linear-gradient(180deg, #0A4174, #08345D)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          transition: "width .25s ease",
          boxShadow: "8px 0 30px rgba(0,0,0,.10)",
          zIndex: 1000,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            marginBottom: 8,
            minHeight: 40,
          }}
        >
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 950, fontSize: 18, lineHeight: 1 }}>
                Administração
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "rgba(255,255,255,.72)",
                  fontWeight: 650,
                }}
              >
                {schoolName}
              </div>
            </div>
          )}

  <button
  onClick={() => setCollapsed(!collapsed)}
  style={{
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.10)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .2s ease",
    flexShrink: 0,
  }}
  title={collapsed ? "Expandir menu" : "Fechar menu"}
>
  {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
</button>
        </div>

        <nav style={{ display: "grid", gap: 8 }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : ""}
              style={({ isActive }) => getLinkStyle(isActive, collapsed)}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 8,
                        bottom: 8,
                        width: 4,
                        borderRadius: 999,
                        background: "#0A4174",
                      }}
                    />
                  )}

                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 22,
                    }}
                  >
                    <Icon size={20} strokeWidth={2.2} />
                  </span>

                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,.10)",
            display: "flex",
            justifyContent: collapsed ? "center" : "stretch",
          }}
        >
          <LogoutButton collapsed={collapsed} />
        </div>
      </aside>

      <main
        style={{
          marginLeft: sidebarWidth,
          minHeight: "100vh",
          transition: "margin-left .25s ease",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 18,
            minWidth: 0,
          }}
        >
          <div
            style={{
              marginBottom: 18,
              padding: 18,
              borderRadius: 20,
              background: "#fff",
              border: "1px solid rgba(11,27,42,.08)",
              boxShadow: "0 10px 30px rgba(11,27,42,.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 950,
                  color: "#0B1B2A",
                  lineHeight: 1.1,
                }}
              >
                {currentTitle}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: "rgba(11,27,42,.62)",
                  fontWeight: 650,
                }}
              >
                {currentSubtitle}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
             <div style={{ position: "relative" }}>
  <button
    style={styles.bellBtn}
    title="Notificações"
    onClick={async () => {
      const novoEstado = !openNotificacoes;
      setOpenNotificacoes(novoEstado);

      if (novoEstado) {
        await carregarNotificacoes();
        await http.post("/admin/notificacoes/ler");

        setNotificacoes((prev) =>
          prev.map((n) => ({ ...n, lida: true }))
        );
      }
    }}
  >
    <Bell size={20} />

    {notificacoes.some((n) => !n.lida) && (
      <span style={styles.notificationDot} />
    )}
  </button>

  {openNotificacoes && (
    <div style={styles.notificationsBox}>
      <div style={styles.notificationsTitle}>Notificações</div>

      {notificacoes.length === 0 ? (
        <div style={styles.notificationEmpty}>Sem notificações.</div>
      ) : (
        notificacoes.map((n) => (
          <div
            key={n.id}
            style={styles.notificationItem}
            onClick={() => {
              if (n.link) navigate(n.link);
              setOpenNotificacoes(false);
            }}
          >
            <strong>{n.titulo}</strong>

            <p style={styles.notificationText}>
              {n.mensagem}
            </p>
          </div>
        ))
      )}
    </div>
  )}
</div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  borderRadius: 16,
                  background: "rgba(11,27,42,.03)",
                  border: "1px solid rgba(11,27,42,.06)",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 950,
                    fontSize: 16,
                  }}
                >
                  {initials}
                </div>

                <div>
                  <div style={{ fontWeight: 900, color: "#0B1B2A" }}>
                    {userName}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(11,27,42,.58)",
                      fontWeight: 700,
                    }}
                  >
                    Administrador • {schoolName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
const styles = {
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(11,27,42,.08)",
    background: "#fff",
    color: "#0B1B2A",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(11,27,42,.05)",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#EF4444",
    border: "2px solid #fff",
  },

  notificationsBox: {
    position: "absolute",
    top: 52,
    right: 0,
    width: 330,
    background: "#fff",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 16,
    boxShadow: "0 18px 50px rgba(0,0,0,.16)",
    padding: 12,
    zIndex: 99999,
  },

  notificationsTitle: {
    fontWeight: 950,
    color: "#0B1B2A",
    marginBottom: 10,
  },

  notificationEmpty: {
    color: "rgba(11,27,42,.6)",
    fontWeight: 700,
  },

  notificationItem: {
    padding: 10,
    borderRadius: 12,
    background: "rgba(37,99,235,.08)",
    border: "1px solid rgba(11,27,42,.06)",
    marginBottom: 8,
    cursor: "pointer",
  },

  notificationText: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "rgba(11,27,42,.65)",
    fontWeight: 650,
  },
};