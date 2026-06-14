import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import http from "../api/http";
import {
  LayoutGrid,
  BookOpen,
  FolderOpen,
  ClipboardList,
  AlertTriangle,
  TimerReset,
  LifeBuoy,
  Bell,
  X,
  Info,
  MessageCircle,
} from "lucide-react";
import LogoutButton from "../pages/components/LogoutButton";
import { getUser } from "../api/auth";
const linkStyle = ({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  borderRadius: 12,
  minHeight: 46,
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 13,
  color: isActive ? "#111827" : "#F9FAFB",
  background: isActive ? "#F9FAFB" : "transparent",
  border: isActive ? "1px solid rgba(255,255,255,.2)" : "1px solid transparent",
  transition: "all .2s ease",
});
const iconProps = {
  size: 20,
  strokeWidth: 2.2,
};
export default function StudentLayout() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMsg, setSupportMsg] = useState("");
  const [supportCategory, setSupportCategory] = useState("Materiais");
  const [notificacoes, setNotificacoes] = useState([]);
  const [openNotificacoes, setOpenNotificacoes] = useState(false);
  const user = getUser?.();
  const location = useLocation();
  const navigate = useNavigate();
  const userName = user?.name || user?.username || "Aluno";
  const schoolName = user?.escola?.nome || "Colégio Henriques";
  const initials = userName.trim().charAt(0).toUpperCase();
  const currentTitle =
    location.pathname === "/aluno/dashboard"
      ? `Olá, Aluno ${userName.split(" ")[0]}`
      : location.pathname.includes("disciplinas")
      ? "Professores e Disciplinas"
      : location.pathname.includes("materiais")
      ? "Materiais"
      : location.pathname.includes("notas")
      ? "Notas"
       : location.pathname.includes("faltas")
      ? "faltas"
      : location.pathname.includes("pomodoro")
      ? "Pomodoro"
      : location.pathname.includes("informacoes")
      ? "Informações"
      : location.pathname.includes("mensagens")
? "Mensagens"
      : "Painel do Aluno";
  const subtitles = {
    "/aluno/dashboard": "Bem-vindo ao teu painel.",
    "/aluno/disciplinas": "Consulta os professores e disciplinas da tua turma.",
    "/aluno/materiais": "Materiais disponibilizados pelos professores.",
    "/aluno/mensagens": "Conversa académica com os professores da tua turma.",
    "/aluno/notas": "Consulta as tuas notas e o histórico de faltas por disciplina.",
    "/aluno/faltas": "Consulta o histórico de faltas por disciplina.",
    "/aluno/pomodoro": "Ferramenta de foco e produtividade.",
    "/aluno/informacoes":
  "Consulta os dados da tua conta e da escola associada.",
  };
  const currentSubtitle = subtitles[location.pathname] || "Área do aluno.";
  useEffect(() => {
  carregarNotificacoes();
}, []);

async function carregarNotificacoes() {
  try {
    const res = await http.get("/estudante/notificacoes");
    setNotificacoes(Array.isArray(res.data) ? res.data : []);
  } catch {
    setNotificacoes([]);
  }
}
  function enviarSuporte() {
    if (!supportMsg.trim()) return;
    alert("Pedido de suporte enviado com sucesso.");
    setSupportMsg("");
    setSupportCategory("Materiais");
    setSupportOpen(false);
  }
  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>Aluno</div>
          <nav style={styles.nav}>
            <NavLink to="/aluno/dashboard" style={linkStyle}>
              <LayoutGrid {...iconProps} />
              <span>Painel</span>
            </NavLink>
            <NavLink to="/aluno/disciplinas" style={linkStyle}>
              <BookOpen {...iconProps} />
              <span style={{ whiteSpace: "nowrap" }}>Professores & Disciplinas</span>
            </NavLink>
            <NavLink to="/aluno/materiais" style={linkStyle}>
              <FolderOpen {...iconProps} />
              <span>Materiais</span>
            </NavLink>
            <NavLink to="/aluno/mensagens" style={linkStyle}>
  <MessageCircle {...iconProps} />
  <span>Mensagens</span>
</NavLink>
         <NavLink to="/aluno/faltas" style={linkStyle}>
  <AlertTriangle {...iconProps} />
  <span>Faltas</span>
</NavLink>

<NavLink to="/aluno/notas" style={linkStyle}>
  <ClipboardList {...iconProps} />
  <span>Notas</span>
</NavLink>
            <NavLink to="/aluno/pomodoro" style={linkStyle}>
              <TimerReset {...iconProps} />
              <span>Pomodoro</span>
            </NavLink>
            <NavLink to="/aluno/informacoes" style={linkStyle}>
  <Info {...iconProps} />
  <span>Informações</span>
</NavLink>
          </nav>
        </div>
        <div style={styles.bottom}>
          <button style={styles.supportBtn} onClick={() => setSupportOpen(true)}>
            <LifeBuoy size={20} />
            <span>Suporte</span>
          </button>
          <div style={styles.logoutWrap}>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <main style={styles.content}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.topTitle}>{currentTitle}</div>
            <div style={styles.topSubtitle}>{currentSubtitle}</div>
          </div>
          <div style={styles.topActions}>
            <div style={{ position: "relative" }}>
  <button
    style={styles.bellBtn}
    title="Notificações"
   onClick={async () => {
  const novoEstado = !openNotificacoes;

  setOpenNotificacoes(novoEstado);

  if (novoEstado) {
    await carregarNotificacoes();

    await http.post("/estudante/notificacoes/ler");

    setNotificacoes((prev) =>
      prev.map((n) => ({
        ...n,
        lida: true,
      }))
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
            <div style={styles.userBox}>
              <div style={styles.avatar}>{initials}</div>
              <div>
                <div style={styles.userName}>{userName}</div>
                <div style={styles.userRole}>Aluno • {schoolName}</div>
              </div>
            </div>
          </div>
        </div>
        <Outlet />
      </main>
      {supportOpen && (
        <div style={styles.modalBackdrop} onClick={() => setSupportOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Suporte ao aluno</h3>
                <p style={styles.modalText}>
                  Descreve o problema para a administração poder ajudar.
                </p>
              </div>
              <button style={styles.closeBtn} onClick={() => setSupportOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.formGrid}>
              <div>
                <div style={styles.label}>Tipo de problema</div>
                <select
                  style={styles.input}
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                >
                  <option value="Materiais">Não consigo abrir materiais</option>
                  <option value="Notas">Problema com notas</option>
                  <option value="Dados pessoais">Dados pessoais errados</option>
                  <option value="Acesso">Problema de acesso/senha</option>
                  <option value="Outro">Outro problema</option>
                </select>
              </div>
              <div>
                <div style={styles.label}>Mensagem</div>
                <textarea
                  style={styles.textarea}
                  value={supportMsg}
                  onChange={(e) => setSupportMsg(e.target.value)}
                  placeholder="Explica o que aconteceu..."
                />
              </div>
              <div style={styles.supportInfo}>
                Também podes contactar a administração da escola ou usar o email:
                <br />
                <b>suporte@smartcampus.ao</b>
              </div>
              <button style={styles.primaryBtn} onClick={enviarSuporte}>
                Enviar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const styles = {
  layout: {
    display: "grid",
    gridTemplateColumns: "254px 1fr",
    height: "100vh",
    overflow: "hidden",
  },
  sidebar: {
    height: "100vh",
    padding: 16,
    background: "#0A4174",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 12,
    boxSizing: "border-box",
    overflowY: "auto",
    overflowX: "hidden",
  },
  brand: {
    fontWeight: 900,
    fontSize: 18,
    marginBottom: 14,
  },
  nav: {
    display: "grid",
    gap: 8,
    width: "100%",
  },
  bottom: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8,
    alignItems: "stretch",
  },
  supportBtn: {
    border: "1px solid rgba(255,255,255,.20)",
    background: "rgba(255,255,255,.10)",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    width: "100%",
    boxSizing: "border-box",
  },
  logoutWrap: {
    display: "flex",
    width: "100%",
  },
  content: {
    height: "100vh",
    overflowY: "auto",
    padding: 18,
    background: "#F5F9FC",
    boxSizing: "border-box",
  },
  topbar: {
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
  },
  topTitle: {
    fontSize: 24,
    fontWeight: 950,
    color: "#0B1B2A",
    lineHeight: 1.1,
  },
  topSubtitle: {
    marginTop: 6,
    color: "rgba(11,27,42,.62)",
    fontWeight: 650,
  },
  topActions: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
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
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    borderRadius: 16,
    background: "rgba(11,27,42,.03)",
    border: "1px solid rgba(11,27,42,.06)",
  },
  avatar: {
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
  },
  userName: {
    fontWeight: 900,
    color: "#0B1B2A",
  },
  userRole: {
    fontSize: 12,
    color: "rgba(11,27,42,.58)",
    fontWeight: 700,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(520px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,.22)",
    padding: 18,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  modalTitle: {
    margin: 0,
    color: "#0B1B2A",
    fontSize: 22,
    fontWeight: 950,
  },
  modalText: {
    margin: "6px 0 0",
    color: "rgba(11,27,42,.65)",
    fontWeight: 650,
  },
  closeBtn: {
    border: "1px solid rgba(11,27,42,.12)",
    background: "#fff",
    borderRadius: 12,
    width: 38,
    height: 38,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  formGrid: {
    display: "grid",
    gap: 12,
    marginTop: 16,
  },
  label: {
    fontWeight: 900,
    color: "rgba(11,27,42,.75)",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  supportInfo: {
    padding: 12,
    borderRadius: 14,
    background: "rgba(10,65,116,.06)",
    border: "1px solid rgba(10,65,116,.12)",
    color: "rgba(11,27,42,.75)",
    fontWeight: 700,
    lineHeight: 1.5,
  },
  primaryBtn: {
    border: "none",
    padding: "11px 14px",
    borderRadius: 12,
    fontWeight: 950,
    cursor: "pointer",
    color: "#fff",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
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