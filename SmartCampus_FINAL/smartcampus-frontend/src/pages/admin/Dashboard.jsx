import { useEffect, useMemo, useState } from "react";
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  BookMarked,
  Bell,
  Send,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    alunos: 0,
    professores: 0,
    turmas: 0,
    disciplinas: 0,
    cursos: 0,
    avisos: 0,
    alunos_sem_turma: 0,
    turmas_lotadas: 0,
    turmas_com_vagas: 0,
    total_vagas: 0,
    vagas_ocupadas: 0,
    vagas_disponiveis: 0,
  });

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [tituloAviso, setTituloAviso] = useState("");
  const [textoAviso, setTextoAviso] = useState("");
  const [openAvisoSuccess, setOpenAvisoSuccess] = useState(false);
  const [salvandoAviso, setSalvandoAviso] = useState(false);
  const [msgAviso, setMsgAviso] = useState({ type: "", text: "" });
  const [destinoAviso, setDestinoAviso] = useState("Todos");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    setErro("");

    try {
      const res = await http.get("/admin/dashboard");
      const data = res?.data || {};

      setStats({
        alunos: Number(data.alunos || 0),
        professores: Number(data.professores || 0),
        turmas: Number(data.turmas || 0),
        disciplinas: Number(data.disciplinas || 0),
        cursos: Number(data.cursos || 0),
        avisos: Number(data.avisos || 0),
        alunos_sem_turma: Number(data.alunos_sem_turma || 0),
        turmas_lotadas: Number(data.turmas_lotadas || 0),
        turmas_com_vagas: Number(data.turmas_com_vagas || 0),
        total_vagas: Number(data.total_vagas || 0),
        vagas_ocupadas: Number(data.vagas_ocupadas || 0),
        vagas_disponiveis: Number(data.vagas_disponiveis || 0),
      });
    } catch (e) {
      setErro(e?.response?.data?.message || "Erro ao carregar painel.");
    } finally {
      setLoading(false);
    }
  }

  async function publicarAviso() {
    const titulo = tituloAviso.trim();
    const texto = textoAviso.trim();

    if (!texto) {
      setMsgAviso({ type: "error", text: "Escreve a mensagem do aviso." });
      return;
    }

    if (texto.length < 5) {
      setMsgAviso({ type: "error", text: "A mensagem está demasiado curta." });
      return;
    }

    setSalvandoAviso(true);
    setMsgAviso({ type: "", text: "" });

    try {
      await http.post("/admin/avisos", {
        titulo: titulo || "Aviso",
        mensagem: texto,
        destino: destinoAviso,
      });

      setTituloAviso("");
      setTextoAviso("");
      setDestinoAviso("Todos");
      setMsgAviso({ type: "", text: "" });
      setOpenAvisoSuccess(true);

      setStats((prev) => ({
        ...prev,
        avisos: Number(prev.avisos || 0) + 1,
      }));
    } catch (e) {
      setMsgAviso({
        type: "error",
        text: e?.response?.data?.message || "Não foi possível publicar o aviso.",
      });
    } finally {
      setSalvandoAviso(false);
    }
  }

  const cards = useMemo(() => {
    return [
      {
        label: "Alunos",
        kpi: stats.alunos,
        meta: "Cadastrados",
        icon: <Users size={18} />,
        bg: "linear-gradient(135deg, rgba(99,102,241,.14), rgba(129,140,248,.08))",
      },
      {
        label: "Professores",
        kpi: stats.professores,
        meta: "Ativos",
        icon: <GraduationCap size={18} />,
        bg: "linear-gradient(135deg, rgba(34,197,94,.14), rgba(74,222,128,.08))",
      },
      {
        label: "Turmas",
        kpi: stats.turmas,
        meta: "Registadas",
        icon: <School size={18} />,
        bg: "linear-gradient(135deg, rgba(245,158,11,.14), rgba(251,191,36,.08))",
      },
      {
        label: "Disciplinas",
        kpi: stats.disciplinas,
        meta: "Cadastradas",
        icon: <BookOpen size={18} />,
        bg: "linear-gradient(135deg, rgba(236,72,153,.14), rgba(244,114,182,.08))",
      },
      {
        label: "Cursos",
        kpi: stats.cursos,
        meta: "Disponíveis",
        icon: <BookMarked size={18} />,
        bg: "linear-gradient(135deg, rgba(56,189,248,.14), rgba(125,211,252,.08))",
      },
    ];
  }, [stats]);

  const escolaVazia =
    stats.alunos === 0 &&
    stats.professores === 0 &&
    stats.turmas === 0 &&
    stats.disciplinas === 0 &&
    stats.cursos === 0;

  const alertas = useMemo(() => {
    const lista = [];

    if (stats.alunos_sem_turma > 0) {
      lista.push({
        type: "warn",
        title: "Alunos sem turma",
        text: `${stats.alunos_sem_turma} aluno(s) ainda não foram enturmados.`,
      });
    }

    if (stats.turmas_lotadas > 0) {
      lista.push({
        type: "danger",
        title: "Turmas lotadas",
        text: `${stats.turmas_lotadas} turma(s) já atingiram a capacidade máxima.`,
      });
    }

    if (stats.turmas_com_vagas > 0) {
      lista.push({
        type: "ok",
        title: "Turmas com vagas",
        text: `${stats.turmas_com_vagas} turma(s) ainda têm vagas disponíveis.`,
      });
    }

    if (lista.length === 0) {
      lista.push({
        type: "ok",
        title: "Sem alertas críticos",
        text: "A escola não tem pendências principais neste momento.",
      });
    }

    return lista;
  }, [stats]);

  if (loading) {
    return (
      <div style={card}>
        <div style={cardTitle}>A carregar painel...</div>
        <div style={cardMuted}>A buscar os dados da escola.</div>
      </div>
    );
  }

  if (escolaVazia) {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        {erro && <div style={alertError}>{erro}</div>}

        <div style={onboardingCard}>
          <div>
            <div style={onboardingTitle}>Bem-vindo ao SmartCampus 👋</div>
            <div style={onboardingText}>
              Esta escola ainda não tem dados cadastrados. Começa pela configuração inicial
              para preparar o painel administrativo.
            </div>
          </div>

          <div style={onboardingSteps}>
            <button style={onboardingStep} onClick={() => navigate("/admin/cursos")}>
              1. Criar curso
            </button>

            <button style={onboardingStep} onClick={() => navigate("/admin/disciplinas")}>
              2. Criar disciplinas
            </button>

            <button style={onboardingStep} onClick={() => navigate("/admin/turmas")}>
              3. Criar turma
            </button>

            <button style={onboardingStep} onClick={() => navigate("/admin/professores")}>
              4. Criar professor
            </button>

            <button style={onboardingStep} onClick={() => navigate("/admin/alunos")}>
              5. Criar alunos
            </button>
          </div>
        </div>
      </div>
    );
  }

  {openAvisoSuccess && (
  <div style={modalBackdrop} onClick={() => setOpenAvisoSuccess(false)}>
    <div style={successModal} onClick={(e) => e.stopPropagation()}>
      <div style={successIcon}>✓</div>

      <h3 style={{ margin: "0 0 8px", color: "#166534" }}>
        Aviso publicado com sucesso.
      </h3>

      <p style={{ margin: 0, color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
        A mensagem foi enviada para {destinoAviso.toLowerCase()}.
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
        <button style={primaryBtn} onClick={() => setOpenAvisoSuccess(false)}>
          Fechar
        </button>
      </div>
    </div>
  </div>
)}

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {erro && <div style={alertError}>{erro}</div>}

      <div style={topCardsGrid}>
        {cards.map((s) => (
          <div key={s.label} style={{ ...statCard, background: s.bg }}>
            <div style={statCardContent}>
              <div>
                <div style={statLabel}>{s.label}</div>
                <div style={statValue}>{s.kpi}</div>
                <div style={statMeta}>{s.meta}</div>
              </div>

              <div style={iconBubble}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={mainGrid}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={card}>
            <div style={sectionHeader}>
              <div>
                <div style={cardTitle}>Alertas da escola</div>
                <div style={cardMuted}>Pontos importantes para acompanhar.</div>
              </div>

              <div style={iconBubble}>
                <AlertTriangle size={18} />
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {alertas.map((a, i) => (
                <div
                  key={i}
                  style={{
                    ...alertItem,
                    borderLeft:
                      a.type === "danger"
                        ? "5px solid #ef4444"
                        : a.type === "warn"
                        ? "5px solid #f59e0b"
                        : "5px solid #16a34a",
                  }}
                >
                  <div style={{ fontWeight: 950, color: "#0B1B2A" }}>{a.title}</div>
                  <div style={{ marginTop: 4, color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
                    {a.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={cardTitle}>Ações rápidas</div>
            <div style={cardMuted}>Acessos diretos para os cadastros principais.</div>

            <div style={actionsGrid}>
              <button style={actionCard} onClick={() => navigate("/admin/alunos")}>
                <Plus size={16} />
                Novo aluno
              </button>

              <button style={actionCard} onClick={() => navigate("/admin/professores")}>
                <Plus size={16} />
                Novo professor
              </button>

              <button style={actionCard} onClick={() => navigate("/admin/turmas")}>
                <Plus size={16} />
                Nova turma
              </button>

              <button style={actionCard} onClick={() => navigate("/admin/disciplinas")}>
                <Plus size={16} />
                Nova disciplina
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div style={card}>
            <div style={cardTitle}>Resumo da escola</div>
            <div style={cardMuted}>Indicadores operacionais reais.</div>

            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              <div style={statusRow}>
                <span style={statusLabel}>Alunos sem turma</span>
                <span style={stats.alunos_sem_turma > 0 ? badgeWarning : badgeSuccess}>
                  {stats.alunos_sem_turma}
                </span>
              </div>

              <div style={statusRow}>
                <span style={statusLabel}>Turmas lotadas</span>
                <span style={stats.turmas_lotadas > 0 ? badgeWarning : badgeSuccess}>
                  {stats.turmas_lotadas}
                </span>
              </div>

              <div style={statusRow}>
                <span style={statusLabel}>Turmas com vagas</span>
                <span style={badgeInfo}>{stats.turmas_com_vagas}</span>
              </div>

              <div style={statusRow}>
                <span style={statusLabel}>Avisos publicados</span>
                <span style={badgeInfo}>{stats.avisos}</span>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={sectionHeader}>
              <div>
                <div style={cardTitle}>Publicar aviso</div>
                <div style={cardMuted}>Mensagem administrativa para a escola.</div>
              </div>

              <div style={iconBubble}>
                <Bell size={18} />
              </div>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              <div>
                <div style={fieldLabel}>Título</div>
                <input
                  value={tituloAviso}
                  onChange={(e) => setTituloAviso(e.target.value)}
                  placeholder="Ex: Alteração de horário"
                  style={input}
                  maxLength={150}
                />
              </div>

              <div>
                <div style={fieldLabel}>Destinatário</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Todos", "Alunos", "Professores"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDestinoAviso(d)}
                      style={{
                        padding: "7px 16px",
                        borderRadius: 999,
                        border:
                          destinoAviso === d
                            ? "2px solid #0A4174"
                            : "1px solid rgba(11,27,42,.12)",
                        background: destinoAviso === d ? "rgba(10,65,116,.10)" : "#fff",
                        color: destinoAviso === d ? "#0A4174" : "#0B1B2A",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={fieldLabel}>Mensagem</div>
                <textarea
                  value={textoAviso}
                  onChange={(e) => setTextoAviso(e.target.value)}
                  placeholder="Escreve o aviso..."
                  style={textarea}
                  maxLength={500}
                />
              </div>

             {msgAviso.text && msgAviso.type === "error" && (
  <div style={alertError}>{msgAviso.text}</div>
)}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={publicarAviso} style={primaryBtn} disabled={salvandoAviso}>
                  <span style={btnInline}>
                    {!salvandoAviso && <Send size={16} />}
                    <span>{salvandoAviso ? "A publicar..." : "Publicar aviso"}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const topCardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
};

const statCard = {
  borderRadius: 22,
  padding: 14,
  border: "1px solid rgba(11,27,42,.08)",
  boxShadow: "0 12px 30px rgba(11,27,42,.06)",
};

const statCardContent = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
};

const statLabel = {
  fontSize: 13,
  color: "rgba(11,27,42,.62)",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".3px",
};

const statValue = {
  fontSize: 26,
  fontWeight: 950,
  color: "#0B1B2A",
  lineHeight: 1.1,
  marginTop: 10,
};

const statMeta = {
  marginTop: 8,
  fontWeight: 700,
  color: "rgba(11,27,42,.60)",
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "1.55fr 1fr",
  gap: 16,
  alignItems: "start",
};

const card = {
  background: "#fff",
  border: "1px solid rgba(11,27,42,.08)",
  borderRadius: 22,
  boxShadow: "0 10px 30px rgba(11,27,42,.06)",
  padding: 18,
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const cardTitle = {
  fontSize: 20,
  fontWeight: 950,
  color: "#0B1B2A",
};

const cardMuted = {
  marginTop: 6,
  color: "rgba(11,27,42,.60)",
  fontWeight: 650,
};

const iconBubble = {
  width: 38,
  height: 38,
  borderRadius: 16,
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 20px rgba(11,27,42,.08)",
};

const alertItem = {
  padding: 14,
  borderRadius: 16,
  background: "rgba(11,27,42,.03)",
  border: "1px solid rgba(11,27,42,.08)",
};

const actionsGrid = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const actionCard = {
  border: "1px solid rgba(11,27,42,.08)",
  background: "rgba(255,255,255,.9)",
  borderRadius: 16,
  padding: "14px 16px",
  textAlign: "left",
  fontWeight: 900,
  color: "#0B1B2A",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const statusRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: 12,
  borderRadius: 14,
  background: "rgba(11,27,42,.03)",
  border: "1px solid rgba(11,27,42,.06)",
};

const statusLabel = {
  fontWeight: 900,
  color: "rgba(11,27,42,.70)",
};

const badgeSuccess = {
  display: "inline-block",
  padding: "7px 12px",
  borderRadius: 999,
  background: "rgba(34,197,94,.10)",
  color: "#166534",
  border: "1px solid rgba(34,197,94,.22)",
  fontWeight: 900,
  fontSize: 12,
};

const badgeInfo = {
  display: "inline-block",
  padding: "7px 12px",
  borderRadius: 999,
  background: "rgba(59,130,246,.10)",
  color: "#1D4ED8",
  border: "1px solid rgba(59,130,246,.22)",
  fontWeight: 900,
  fontSize: 12,
};

const badgeWarning = {
  display: "inline-block",
  padding: "7px 12px",
  borderRadius: 999,
  background: "rgba(245,158,11,.10)",
  color: "#92400E",
  border: "1px solid rgba(245,158,11,.22)",
  fontWeight: 900,
  fontSize: 12,
};

const alertError = {
  padding: 14,
  borderRadius: 16,
  background: "rgba(239,68,68,.10)",
  border: "1px solid rgba(239,68,68,.22)",
  color: "#B91C1C",
  fontWeight: 900,
};

const alertSuccess = {
  padding: 14,
  borderRadius: 16,
  background: "rgba(34,197,94,.10)",
  border: "1px solid rgba(34,197,94,.22)",
  color: "#166534",
  fontWeight: 900,
};

const fieldLabel = {
  marginBottom: 6,
  fontWeight: 800,
  color: "rgba(11,27,42,.75)",
  fontSize: 13,
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(11,27,42,.14)",
  background: "#fff",
  outline: "none",
  color: "#0B1B2A",
  fontWeight: 650,
  boxSizing: "border-box",
};

const textarea = {
  ...input,
  minHeight: 110,
  resize: "vertical",
};

const primaryBtn = {
  border: "none",
  padding: "10px 14px",
  borderRadius: 14,
  fontWeight: 950,
  color: "#fff",
  cursor: "pointer",
  background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
  boxShadow: "0 10px 22px rgba(10,65,116,.22)",
};

const btnInline = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const onboardingCard = {
  background: "linear-gradient(135deg, rgba(10,65,116,.10), rgba(78,142,162,.06))",
  border: "1px solid rgba(10,65,116,.18)",
  borderRadius: 22,
  padding: 24,
  display: "grid",
  gap: 18,
  boxShadow: "0 10px 30px rgba(11,27,42,.06)",
};

const onboardingTitle = {
  fontSize: 28,
  fontWeight: 950,
  color: "#0B1B2A",
};

const onboardingText = {
  marginTop: 6,
  color: "rgba(11,27,42,.68)",
  fontWeight: 650,
  lineHeight: 1.5,
};

const onboardingSteps = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 10,
};

const onboardingStep = {
  border: "1px solid rgba(10,65,116,.18)",
  background: "#fff",
  color: "#0A4174",
  borderRadius: 14,
  padding: "12px 14px",
  fontWeight: 950,
  cursor: "pointer",
  textAlign: "left",
};
const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 9999,
};

const successModal = {
  width: "min(420px, 100%)",
  background: "#fff",
  borderRadius: 18,
  border: "1px solid rgba(34,197,94,.20)",
  boxShadow: "0 20px 60px rgba(0,0,0,.20)",
  padding: 24,
  textAlign: "center",
};

const successIcon = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  margin: "0 auto 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(34,197,94,.12)",
  color: "#16A34A",
  fontSize: 34,
  fontWeight: 950,
  border: "1px solid rgba(34,197,94,.20)",
};