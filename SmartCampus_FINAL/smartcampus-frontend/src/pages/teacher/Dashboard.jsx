import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import {
  BookOpen,
  BookMarked,
  FolderOpen,
  CalendarDays,
  Bell,
  Plus,
  StickyNote,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function DashboardProfessor() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [professor, setProfessor] = useState(null);
  const [novoLembrete, setNovoLembrete] = useState("");
  const [salvandoLembrete, setSalvandoLembrete] = useState(false);
  const [apagandoId, setApagandoId] = useState(null);
  const [horarioOpen, setHorarioOpen] = useState(false);

  const hoje = new Date();
  const [calendarDate, setCalendarDate] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(hoje);

  const [resumo, setResumo] = useState([
    { label: "Turmas", value: "0", icon: BookOpen },
    { label: "Disciplinas", value: "0", icon: BookMarked },
    { label: "Materiais", value: "0", icon: FolderOpen },
    { label: "Lembretes", value: "0", icon: StickyNote },
  ]);

  const [avisosAdmin, setAvisosAdmin] = useState([]);
  const [meusLembretes, setMeusLembretes] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [modalEventoOpen, setModalEventoOpen] = useState(false);
  const [salvandoEvento, setSalvandoEvento] = useState(false);

  const [eventoForm, setEventoForm] = useState({
    titulo: "",
    tipo: "prova",
    data: "",
    hora_inicio: "",
    hora_fim: "",
    turma_id: "",
    disciplina_id: "",
    descricao: "",
  });

  const  [proximasAulas,setProximasAulas]= useState([]);

  async function carregarDashboard() {
    try {
      const res = await http.get("/professor/minhas-atribuicoes");
      const raw = res.data;

      setProfessor(raw?.professor || null);
      setAvisosAdmin(Array.isArray(raw?.avisos_admin) ? raw.avisos_admin : []);
      setMeusLembretes(Array.isArray(raw?.meus_lembretes) ? raw.meus_lembretes : []);
      setAtribuicoes(Array.isArray(raw?.atribuicoes) ? raw.atribuicoes : []);
      setEventos(Array.isArray(raw?.eventos) ? raw.eventos : []);
       setProximasAulas(Array.isArray(raw?.proximas_aulas) ? raw.proximas_aulas : []);

      setResumo([
        { label: "Turmas", value: String(raw?.total_turmas || 0), icon: BookOpen },
        { label: "Disciplinas", value: String(raw?.total_disciplinas || 0), icon: BookMarked },
        { label: "Materiais", value:String(raw?.total_materiais || 0), icon: FolderOpen },
        {
          label: "Lembretes",
          value: String(Array.isArray(raw?.meus_lembretes) ? raw.meus_lembretes.length : 0),
          icon: StickyNote,
        },
      ]);
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          "Não foi possível carregar os dados do professor."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function adicionarLembrete() {
    const texto = novoLembrete.trim();
    if (!texto) return;

    setSalvandoLembrete(true);
    setMsg("");

    try {
      const res = await http.post("/professor/meus-lembretes", { texto });
      const lembrete = res.data?.lembrete;

      if (lembrete) {
        const novos = [lembrete, ...meusLembretes];
        setMeusLembretes(novos);

        setResumo((prev) =>
          prev.map((item) =>
            item.label === "Lembretes"
              ? { ...item, value: String(novos.length) }
              : item
          )
        );
      }

      setNovoLembrete("");
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          "Não foi possível adicionar o lembrete."
      );
    } finally {
      setSalvandoLembrete(false);
    }
  }

  async function apagarLembrete(id) {
    setApagandoId(id);
    setMsg("");

    try {
      const novos = meusLembretes.filter((item) => item.id !== id);
      await http.delete(`/professor/meus-lembretes/${id}`);
      setMeusLembretes(novos);

      setResumo((prev) =>
        prev.map((item) =>
          item.label === "Lembretes"
            ? { ...item, value: String(novos.length) }
            : item
        )
      );
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          "Não foi possível apagar o lembrete."
      );
    } finally {
      setApagandoId(null);
    }
  }

  const monthLabel = useMemo(() => {
    return calendarDate.toLocaleDateString("pt-PT", {
      month: "long",
      year: "numeric",
    });
  }, [calendarDate]);

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstWeekDay = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result = [];

    for (let i = 0; i < firstWeekDay; i += 1) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push(new Date(year, month, day));
    }

    return result;
  }, [calendarDate]);

  function sameDay(a, b) {
    return (
      a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function abrirAgendaData(date) {
  setSelectedDate(date);

  const dataFormatada = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  setEventoForm({
    titulo: "",
    tipo: "prova",
    data: dataFormatada,
    hora_inicio: "",
    hora_fim: "",
    turma_id: "",
    disciplina_id: "",
    descricao: "",
  });

  setModalEventoOpen(true);
}

  function fecharModalEvento() {
    setModalEventoOpen(false);
  }

  function updateEventoForm(field, value) {
    setEventoForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function guardarEvento() {
    if (!eventoForm.titulo.trim() || !eventoForm.data) return;

    setSalvandoEvento(true);
    setMsg("");

    try {
      const res = await http.post("/professor/eventos", {
        ...eventoForm,
        turma_id: eventoForm.turma_id || null,
        disciplina_id: eventoForm.disciplina_id || null,
        descricao: eventoForm.descricao || null,
        hora_inicio: eventoForm.hora_inicio || null,
        hora_fim: eventoForm.hora_fim || null,
      });

      const novoEvento = res.data?.evento;
      if (novoEvento) {
        setEventos((prev) =>
          [...prev, novoEvento].sort((a, b) => {
            const d1 = `${a.data} ${a.hora_inicio || "00:00"}`;
            const d2 = `${b.data} ${b.hora_inicio || "00:00"}`;
            return d1.localeCompare(d2);
          })
        );
      }

      setModalEventoOpen(false);
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          "Não foi possível guardar o evento."
      );
    } finally {
      setSalvandoEvento(false);
    }
  }

  async function apagarEvento(id) {
    try {
      await http.delete(`/professor/eventos/${id}`);
      setEventos((prev) => prev.filter((ev) => ev.id !== id));
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          "Não foi possível apagar o evento."
      );
    }
  }

  const proximosEventos = useMemo(() => {
    return eventos.slice(0, 4);
  }, [eventos]);

  const turmasOptions = useMemo(() => {
    const map = new Map();
    atribuicoes.forEach((a) => {
      const id = a?.turma_id;
      const nome = a?.turma?.nome || a?.turma?.name || `Turma #${id}`;
      if (id && !map.has(String(id))) {
        map.set(String(id), { id: String(id), nome });
      }
    });
    return Array.from(map.values());
  }, [atribuicoes]);

  const disciplinasOptions = useMemo(() => {
    const map = new Map();
    atribuicoes.forEach((a) => {
      const id = a?.disciplina_id;
      const nome = a?.disciplina?.nome || a?.disciplina?.name || `Disciplina #${id}`;
      if (id && !map.has(String(id))) {
        map.set(String(id), { id: String(id), nome });
      }
    });
    return Array.from(map.values());
  }, [atribuicoes]);

  return (
    <div>
      <div style={styles.header}>
        <div>
          
          


          {!!msg && <div style={styles.error}>{msg}</div>}
        </div>

       
      </div>

      <div style={styles.grid4}>
        {resumo.map((r) => {
          const Icon = r.icon;

          return (
            <div key={r.label} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={{ color: "rgba(11,27,42,.65)", fontWeight: 900 }}>{r.label}</div>
                <div style={styles.iconWrap}>
                  <Icon size={18} strokeWidth={2.2} />
                </div>
              </div>

              <div style={styles.cardValue}>
                {loading && (r.label === "Turmas" || r.label === "Disciplinas")
                  ? "..."
                  : r.value}
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.leftColumn}>
      <div style={styles.card}>
  <div style={styles.sectionHeader}>
    <h3 style={styles.sectionTitle}>Próximas aulas</h3>

    <button
      type="button"
      style={styles.iconButton}
      onClick={() => setHorarioOpen(true)}
      title="Ver horário completo"
    >
      <CalendarDays size={18} strokeWidth={2.2} />
    </button>
  </div>

  <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Dia</th>
                  <th style={styles.th}>Hora</th>
                  <th style={styles.th}>Turma</th>
                  <th style={styles.th}>Disciplina</th>
                  <th style={styles.th}>Sala</th>
                </tr>
              </thead>

              <tbody>
  {proximasAulas.length === 0 ? (
    <tr>
      <td colSpan={5} style={{ padding: 16 }}>
        <div style={styles.empty}>Ainda não tens aulas no horário.</div>
      </td>
    </tr>
  ) : (
    proximasAulas.map((a, i) => (
      <tr key={a.id || i}>
        <td style={styles.td}>
          <span style={styles.badge}>{a.dia}</span>
        </td>
        <td style={styles.td}>
          {a.hora}
          {a.hora_fim ? ` - ${a.hora_fim}` : ""}
        </td>
        <td style={styles.td}>
          <span style={styles.badge}>{a.turma || "-"}</span>
        </td>
        <td style={styles.td}>{a.disciplina || "-"}</td>
        <td style={styles.td}>{a.sala || "-"}</td>
      </tr>
    ))
  )}
</tbody>
            </table>
          </div>

        

          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Avisos do Admin</h3>
              <Bell size={18} strokeWidth={2.2} color="#0B1B2A" />
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {avisosAdmin.length === 0 ? (
                <div style={styles.empty}>Ainda não tens avisos do administrador.</div>
              ) : (
                avisosAdmin.map((n) => (
                  <div key={n.id} style={styles.notice}>
                    <div style={{ fontWeight: 900 }}>{n.titulo || n.texto}</div>
                    {!!n.texto && !!n.titulo && (
                      <div style={{ marginTop: 6, color: "#0B1B2A", fontWeight: 650 }}>
                        {n.texto}
                      </div>
                    )}
                    <div style={styles.noticeDate}>
                      {n.created_at_formatado || n.data || n.created_at}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

 <div style={styles.card}>
  <div style={styles.sectionHeader}>
    <h3 style={styles.sectionTitle}>
      Minhas Turmas e Disciplinas
    </h3>
    <BookOpen size={18} />
  </div>

  <div style={{ display: "grid", gap: 10 }}>
    {atribuicoes.length === 0 ? (
      <div style={styles.empty}>
        Nenhuma atribuição encontrada.
      </div>
    ) : (
      atribuicoes.map((a, index) => (
        <div
          key={index}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(11,27,42,.08)",
            background: "rgba(11,27,42,.03)",
          }}
        >
          <div style={{ fontWeight: 900 }}>
            {a?.turma?.nome}
          </div>

          <div style={styles.noticeDate}>
            {a?.disciplina?.nome}
          </div>
        </div>
      ))
    )}
  </div>
</div>
      </div>

      {modalEventoOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: "#0B1B2A" }}>Agendar evento</h3>
                <div style={styles.noticeDate}>
                  {selectedDate.toLocaleDateString("pt-PT")}
                </div>
              </div>

              <button onClick={fecharModalEvento} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalGrid}>
              <div>
                <div style={styles.fieldLabel}>Título</div>
                <input
                  value={eventoForm.titulo}
                  onChange={(e) => updateEventoForm("titulo", e.target.value)}
                  style={styles.input}
                  placeholder="Ex: Prova de Física"
                />
              </div>

              <div>
                <div style={styles.fieldLabel}>Tipo</div>
                <select
                  value={eventoForm.tipo}
                  onChange={(e) => updateEventoForm("tipo", e.target.value)}
                  style={styles.input}
                >
                  <option value="prova">Prova</option>
                  <option value="avaliacao">Avaliação</option>
                  <option value="teste">Teste</option>
                  <option value="entrega">Entrega</option>
                  <option value="aula_extra">Aula extra</option>
                  <option value="reuniao">Reunião</option>
                </select>
              </div>

              <div>
                <div style={styles.fieldLabel}>Data</div>
                <input
                  type="date"
                  value={eventoForm.data}
                  onChange={(e) => updateEventoForm("data", e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <div style={styles.fieldLabel}>Hora início</div>
                <input
                  type="time"
                  value={eventoForm.hora_inicio}
                  onChange={(e) => updateEventoForm("hora_inicio", e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <div style={styles.fieldLabel}>Hora fim</div>
                <input
                  type="time"
                  value={eventoForm.hora_fim}
                  onChange={(e) => updateEventoForm("hora_fim", e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <div style={styles.fieldLabel}>Turma</div>
                <select
                  value={eventoForm.turma_id}
                  onChange={(e) => updateEventoForm("turma_id", e.target.value)}
                  style={styles.input}
                >
                  <option value="">Sem turma</option>
                  {turmasOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={styles.fieldLabel}>Disciplina</div>
                <select
                  value={eventoForm.disciplina_id}
                  onChange={(e) => updateEventoForm("disciplina_id", e.target.value)}
                  style={styles.input}
                >
                  <option value="">Sem disciplina</option>
                  {disciplinasOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={styles.fieldLabel}>Descrição</div>
                <textarea
                  value={eventoForm.descricao}
                  onChange={(e) => updateEventoForm("descricao", e.target.value)}
                  style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
                  placeholder="Informações adicionais..."
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={fecharModalEvento} style={styles.btnGhost}>
                Cancelar
              </button>

              <button onClick={guardarEvento} style={styles.btnPrimary} disabled={salvandoEvento}>
                <span style={styles.inlineIcon}>
                  <Plus size={16} strokeWidth={2.3} />
                  {salvandoEvento ? "A guardar..." : "Guardar evento"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      {horarioOpen && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalCard}>
      <div style={styles.modalHeader}>
        <div>
          <h3 style={{ margin: 0, color: "#0B1B2A" }}>
            Horário completo do professor
          </h3>
          <div style={styles.noticeDate}>
            Consulta semanal das tuas aulas.
          </div>
        </div>

        <button onClick={() => setHorarioOpen(false)} style={styles.closeBtn}>
          <X size={18} />
        </button>
      </div>

      <HorarioProfessorTabela horarios={proximasAulas} styles={styles} />
    </div>
  </div>
)}
    </div>
  );
}
function HorarioProfessorTabela({ horarios, styles }) {
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
                        <div style={styles.noticeDate}>{aula.turma}</div>
                        <div style={styles.noticeDate}>Sala {aula.sala}</div>
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
    marginBottom: 14,
  },
  title: {
    margin: 0,
    color: "#0B1B2A",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "rgba(11,27,42,.65)",
    fontWeight: 650,
  },
  subInfo: {
    marginTop: 8,
    color: "rgba(11,27,42,.55)",
    fontWeight: 700,
    fontSize: 13,
  },
  error: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,.25)",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
    fontWeight: 800,
    fontSize: 13,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.7fr 0.9fr",
    gap: 12,
    marginTop: 12,
  },
  leftColumn: {
    display: "grid",
    gap: 12,
  },
  rightColumn: {
    display: "grid",
    gap: 12,
    alignContent: "start",
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(10,65,116,.08)",
    color: "#0A4174",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 950,
    marginTop: 10,
    color: "#0B1B2A",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    margin: 0,
    color: "#0B1B2A",
  },
  calendarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarTitle: {
    fontWeight: 900,
    color: "#0B1B2A",
    textTransform: "capitalize",
    fontSize: 14,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: "1px solid rgba(11,27,42,.12)",
    background: "#fff",
    color: "#0B1B2A",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  weekDays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
    marginBottom: 8,
  },
  weekDay: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 800,
    color: "rgba(11,27,42,.55)",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
  },
  dayBtn: {
    height: 30,
    borderRadius: 10,
    border: "1px solid rgba(11,27,42,.08)",
    background: "#fff",
    color: "#0B1B2A",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 12,
  },
  dayToday: {
    border: "1px solid rgba(10,65,116,.25)",
    background: "rgba(10,65,116,.06)",
  },
  daySelected: {
    background: "#0A4174",
    color: "#fff",
    border: "1px solid #0A4174",
  },
  calendarHint: {
    marginTop: 12,
    fontSize: 13,
    color: "rgba(11,27,42,.7)",
    fontWeight: 700,
  },
  reminderForm: {
    display: "grid",
    gap: 10,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.14)",
    background: "#fff",
    outline: "none",
    color: "#0B1B2A",
    fontWeight: 650,
  },
  btnPrimary: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 950,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
    boxShadow: "0 10px 22px rgba(10,65,116,.22)",
  },
  btnGhost: {
    border: "1px solid rgba(11,27,42,.14)",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "#fff",
    color: "#0B1B2A",
    textAlign: "left",
  },
  iconBtn: {
    border: "1px solid rgba(11,27,42,.10)",
    background: "#fff",
    color: "#0B1B2A",
    borderRadius: 10,
    width: 34,
    height: 34,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  inlineIcon: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
  },
  th: {
    textAlign: "left",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".3px",
    color: "rgba(11,27,42,.65)",
    borderBottom: "1px solid rgba(11,27,42,.10)",
    padding: "12px 10px",
  },
  td: {
    borderBottom: "1px solid rgba(11,27,42,.06)",
    padding: "12px 10px",
    color: "#0B1B2A",
    fontWeight: 650,
    verticalAlign: "top",
  },
  notice: {
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(11,27,42,.10)",
    background: "rgba(11,27,42,.02)",
  },
  noticeRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  noticeDate: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(11,27,42,.6)",
    fontWeight: 800,
  },
  noticeMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(11,27,42,.7)",
    fontWeight: 700,
  },
  empty: {
    padding: 12,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
  },
  calendarDivider: {
    height: 1,
    background: "rgba(11,27,42,.08)",
    margin: "14px 0",
  },
  sectionTitleSmall: {
    margin: 0,
    color: "#0B1B2A",
    fontSize: 15,
  },
  reminderFormCompact: {
    display: "grid",
    gap: 8,
  },
  noticeCompact: {
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(11,27,42,.10)",
    background: "rgba(11,27,42,.02)",
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
    width: "100%",
    maxWidth: 760,
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
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  fieldLabel: {
    marginBottom: 6,
    fontWeight: 800,
    color: "rgba(11,27,42,.75)",
    fontSize: 13,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  iconButton: {
  width: 34,
  height: 34,
  borderRadius: 12,
  border: "1px solid rgba(11,27,42,.10)",
  background: "#fff",
  color: "#0A4174",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  boxShadow: "0 8px 20px rgba(11,27,42,.06)",
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
};