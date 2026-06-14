import { useEffect, useMemo, useState } from "react";
import {
  Users,
  BookOpen,
  BadgeCheck,
  Hash,
  CalendarDays,
  Clock,
  MapPin,
  GraduationCap,
  X,
  ClipboardList,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { getUser } from "../../api/auth";

export default function DashboardAluno() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [horarios, setHorarios] = useState([]);
const [horarioOpen, setHorarioOpen] = useState(false);
const [avisos,setAvisos] = useState ([]);

  const user = getUser();

  useEffect(() => {
    async function fetchPerfil() {
      setErro("");

      try {
        const res = await http.get("/estudante/perfil");
        setPerfil(res.data);
        const horariosRes = await http.get("/estudante/horarios");
      setHorarios(Array.isArray(horariosRes.data) ? horariosRes.data : []);
      const avisosRes = await http.get("/estudante/avisos");
setAvisos(Array.isArray(avisosRes.data) ? avisosRes.data : []);
      } catch (err) {
        setErro(
          err?.response?.data?.message ||
            "Não foi possível carregar o teu painel."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPerfil();
  }, []);

  const nome = user?.name || perfil?.nome_completo || "Aluno";
  const turma = perfil?.turma?.nome || "Sem turma atribuída";
  const curso = perfil?.curso?.nome || "Sem curso";
  const matricula = perfil?.numero_aluno || "-";
  const estado = perfil?.status || "Ativo";
  const [notas, setNotas] = useState([]);
  const [faltas, setFaltas] = useState([]);
  const [avisosAdmin, setAvisosAdmin] = useState([]);
  const numeroTurma = perfil?.numero_turma || "-";

  const cards = useMemo(
    () => [
      {
        label: "Turma",
        value: loading ? "..." : turma,
        icon: <Users size={16} />,
      },
      {
        label: "Curso",
        value: loading ? "..." : curso,
        icon: <GraduationCap size={16} />,
      },
     {
  label: "Nº",
  value: loading ? "..." : numeroTurma,
  icon: <Hash size={16} />,
},
      {
        label: "Estado",
        value: loading ? "..." : estado,
        icon: <BadgeCheck size={16} />,
      },
    ],
   [loading, turma, curso, numeroTurma, estado]
  );
const proximasAulas = useMemo(() => {
  return horarios.slice(0, 4);
}, [horarios]);

  const materiaisRecentes = [
    {
      titulo: "Introdução à Programação",
      disciplina: "Programação",
      tipo: "PDF",
    },
    {
      titulo: "Camadas do Modelo OSI",
      disciplina: "Redes",
      tipo: "Documento",
    },
    {
      titulo: "Exercícios de Física",
      disciplina: "Física",
      tipo: "PDF",
    },
  ];



  return (
    <div style={{ display: "grid", gap: 16 }}>
      {erro && <div style={styles.alertError}>{erro}</div>}

      

      <div style={styles.grid4}>
        {cards.map((c) => (
          <div key={c.label} style={{ ...styles.statCard, background: c.bg }}>
            <div style={styles.statContent}>
              <div>
                <div style={styles.statLabel}>{c.label}</div>
                <div style={styles.statValue}>{c.value}</div>
              </div>

              <div style={styles.iconBubble}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {!loading && !perfil && (
        <div style={styles.card}>
          Os teus dados académicos ainda não estão disponíveis. Contacta o
          administrador da escola.
        </div>
      )}

      <div style={styles.mainGrid}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div>
                <div style={styles.cardTitle}>Próximas aulas</div>
                <div style={styles.muted}>
                  Consulta as próximas atividades da tua turma.
                </div>
              </div>

              <button
  type="button"
  style={styles.iconButton}
  onClick={() => setHorarioOpen(true)}
  title="Ver horário completo"
>
  <CalendarDays size={18} />
</button>
            </div>

            <div style={{ marginTop: 14, overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Dia</th>
                    <th style={styles.th}>Hora</th>
                    <th style={styles.th}>Disciplina</th>
                    <th style={styles.th}>Sala</th>
                  </tr>
                </thead>

               <tbody>
  {proximasAulas.length === 0 ? (
    <tr>
      <td colSpan={4} style={{ padding: 16 }}>
        <div style={styles.empty}>Ainda não há aulas no horário da tua turma.</div>
      </td>
    </tr>
  ) : (
    proximasAulas.map((a, idx) => (
      <tr key={a.id || idx}>
        <td style={styles.td}>
          <span style={styles.badge}>{a.dia}</span>
        </td>
        <td style={styles.td}>
          <span style={styles.inlineIcon}>
            <Clock size={14} />
            {a.hora_inicio} - {a.hora_fim}
          </span>
        </td>
        <td style={styles.td}>{a.disciplina || "-"}</td>
        <td style={styles.td}>
          <span style={styles.inlineIcon}>
            <MapPin size={14} />
            {a.sala || "-"}
          </span>
        </td>
      </tr>
    ))
  )}
</tbody>
              </table>
            </div>
          </div>

          <div style={styles.resumoGrid}>
  <div style={styles.card}>
    <div style={styles.cardTitle}>Resumo académico</div>
    <div style={styles.muted}>Acompanhamento rápido do teu desempenho.</div>

    <div style={styles.resumoItems}>
      <button style={styles.resumoItem} onClick={() => navigate("/aluno/notas")}>
        <strong>Notas</strong>
        <span>Consultar avaliações lançadas</span>
      </button>

      <button style={styles.resumoItem} onClick={() => navigate("/aluno/faltas")}>
        <strong>Faltas</strong>
        <span>Ver histórico de presenças</span>
      </button>

      <button style={styles.resumoItem} onClick={() => navigate("/aluno/materiais")}>
        <strong>Materiais</strong>
        <span>Abrir conteúdos da turma</span>
      </button>

      <button style={styles.resumoItem} onClick={() => navigate("/aluno/mensagens")}>
        <strong>Mensagens</strong>
        <span>Tirar dúvidas com professores</span>
      </button>
    </div>
  </div>
</div>
        </div>

       <div style={{ display: "grid", gap: 16 }}>
  <div style={styles.card}>
    <div style={styles.cardTitle}>Avisos do Admin</div>

    <div style={{ marginTop: 14 }}>
      {avisos.length === 0 ? (
        <div style={styles.empty}>
          Ainda não existem avisos da administração.
        </div>
      ) : (
        avisos.slice(0, 5).map((aviso) => (
          <div key={aviso.id} style={styles.noticeItem}>
            <div style={styles.noticeDot}></div>

            <div>
              <strong>{aviso.titulo}</strong>

              <div style={styles.smallMuted}>
                {aviso.mensagem}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</div>

      </div>
      {horarioOpen && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalCard}>
      <div style={styles.modalHeader}>
        <div>
          <h3 style={{ margin: 0, color: "#0B1B2A" }}>
            Horário completo da turma {horarios[0]?.turma || turma}
          </h3>
          <div style={styles.muted}>
            Consulta semanal das aulas da tua turma.
          </div>
        </div>

        <button style={styles.closeBtn} onClick={() => setHorarioOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <HorarioTabela horarios={horarios} styles={styles} />
    </div>
  </div>
)}
    </div>
  );
}
function HorarioTabela({ horarios, styles }) {
  const dias = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
  ];

  const tempos = [
    { tempo: "1º Tempo", hora: "07:30 - 08:15" },
    { tempo: "2º Tempo", hora: "08:20 - 09:05" },
    { tempo: "3º Tempo", hora: "09:10 - 09:55" },
    { tempo: "4º Tempo", hora: "10:05 - 10:50" },
    { tempo: "5º Tempo", hora: "10:55 - 11:40" },
    { tempo: "6º Tempo", hora: "11:45 - 12:30" },
  ];

  function encontrarAula(tempo, dia) {
    return horarios.find((h) => h.tempo === tempo && h.dia === dia);
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.fullTable}>
        <thead>
          <tr>
            <th style={styles.fullTh}>Tempo</th>
            <th style={styles.fullTh}>Hora</th>

            {dias.map((dia) => (
              <th key={dia} style={styles.fullTh}>
                {dia.replace("-feira", "")}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {tempos.map((t) => (
            <tr key={t.tempo}>
              <td style={styles.fullTdStrong}>{t.tempo}</td>
              <td style={styles.fullTdStrong}>{t.hora}</td>

              {dias.map((dia) => {
                const aula = encontrarAula(t.tempo, dia);

                return (
                  <td key={`${t.tempo}-${dia}`} style={styles.fullTd}>
                    {aula ? (
                      <div>
                        <strong>{aula.disciplina}</strong>
                        <div style={styles.smallMuted}>
                          {aula.professor || "Sem docente atribuído"}
                        </div>
                      </div>
                    ) : (
                      <span style={styles.emptyCell}>---</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  muted: {
    margin: "6px 0 0",
    color: "rgba(11,27,42,.65)",
    fontWeight: 650,
  },
  smallMuted: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(11,27,42,.58)",
    fontWeight: 700,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  statCard: {
    borderRadius: 16,
    border: "1px solid rgba(11,27,42,.08)",
    boxShadow: "0 10px 30px rgba(11,27,42,.06)",
    padding: 14,
    minHeight: 105,
  },
  statContent: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  statLabel: {
    color: "rgba(11,27,42,.62)",
    fontWeight: 900,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".3px",
  },
  statValue: {
    fontSize: 15,
    fontWeight: 950,
    marginTop: 10,
    color: "#0A4174",
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(11,27,42,.08)",
    color: "#0A4174",
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 18,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.55fr 1fr",
    gap: 16,
    alignItems: "start",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 950,
    color: "#0B1B2A",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 620,
  },
  th: {
    textAlign: "left",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".3px",
    color: "rgba(11,27,42,.62)",
    borderBottom: "1px solid rgba(11,27,42,.10)",
    padding: "12px 10px",
  },
  td: {
    borderBottom: "1px solid rgba(11,27,42,.06)",
    padding: "12px 10px",
    color: "#0B1B2A",
    fontWeight: 700,
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(59,130,246,.22)",
    background: "rgba(59,130,246,.08)",
    color: "#1D4ED8",
    fontWeight: 900,
  },
  inlineIcon: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: "rgba(11,27,42,.75)",
    fontWeight: 800,
  },
  materialItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    background: "rgba(11,27,42,.03)",
    border: "1px solid rgba(11,27,42,.06)",
  },
  iconSoft: {
    width: 38,
    height: 38,
    borderRadius: 14,
    background: "rgba(59,130,246,.10)",
    color: "#1D4ED8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeItem: {
    display: "grid",
    gridTemplateColumns: "12px 1fr",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    background: "rgba(11,27,42,.03)",
    border: "1px solid rgba(11,27,42,.06)",
    color: "rgba(11,27,42,.72)",
    fontWeight: 700,
    lineHeight: 1.45,
  },
  noticeDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#2563EB",
    marginTop: 7,
  },
  primaryBtn: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 950,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
    boxShadow: "0 10px 22px rgba(10,65,116,.22)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  ghostBtn: {
    border: "1px solid rgba(11,27,42,.12)",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "#fff",
    color: "#0B1B2A",
  },
  actionBtn: {
    border: "1px solid rgba(11,27,42,.08)",
    background: "#fff",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 900,
    color: "#0B1B2A",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  alertError: {
    padding: 14,
    borderRadius: 16,
    background: "rgba(239,68,68,.10)",
    border: "1px solid rgba(239,68,68,.22)",
    color: "#B91C1C",
    fontWeight: 900,
  },
  iconButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 20px rgba(11,27,42,.08)",
  color: "#0A4174",
  border: "none",
  cursor: "pointer",
},
empty: {
  padding: 12,
  borderRadius: 14,
  border: "1px dashed rgba(11,27,42,.18)",
  background: "rgba(11,27,42,.03)",
  color: "rgba(11,27,42,.7)",
  fontWeight: 750,
},
modalOverlay: {
  position: "fixed",
  inset: 0,
  background: "rgba(11,27,42,.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 1000,
},
modalCard: {
  width: "min(1050px, 100%)",
  maxHeight: "85vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 20px 50px rgba(11,27,42,.18)",
  padding: 18,
},
modalHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
},
closeBtn: {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid rgba(11,27,42,.12)",
  background: "#fff",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  color: "#0B1B2A",
},
fullTable: {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 900,
},
fullTh: {
  textAlign: "center",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: ".3px",
  color: "rgba(11,27,42,.68)",
  border: "1px solid rgba(11,27,42,.10)",
  padding: "12px 10px",
  background: "rgba(10,65,116,.06)",
},
fullTd: {
  border: "1px solid rgba(11,27,42,.10)",
  padding: "12px 10px",
  color: "#0B1B2A",
  fontWeight: 700,
  textAlign: "center",
  verticalAlign: "middle",
  minWidth: 140,
},
fullTdStrong: {
  border: "1px solid rgba(11,27,42,.10)",
  padding: "12px 10px",
  color: "#0A4174",
  fontWeight: 950,
  background: "rgba(11,27,42,.03)",
  whiteSpace: "nowrap",
},
emptyCell: {
  color: "rgba(11,27,42,.35)",
  fontWeight: 800,
},
resumoGrid: {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 16,
},

resumoItems: {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 10,
  marginTop: 12,
},

resumoItem: {
  border: "1px solid rgba(11,27,42,.10)",
  background: "rgba(11,27,42,.02)",
  borderRadius: 16,
  padding: 14,
  textAlign: "left",
  cursor: "pointer",
  display: "grid",
  gap: 6,
  color: "#0B1B2A",
},

resumoItem: {
  border: "1px solid rgba(11,27,42,.10)",
  background: "rgba(11,27,42,.02)",
  borderRadius: 16,
  padding: 14,
  textAlign: "left",
  cursor: "pointer",
  display: "grid",
  gap: 6,
  color: "#0B1B2A",
  fontWeight: 700,
},
};