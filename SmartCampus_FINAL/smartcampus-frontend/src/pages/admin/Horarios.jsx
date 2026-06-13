import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

const diasSemana = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

const tempos = [
  { tempo: "1º Tempo", inicio: "07:30", fim: "08:15" },
  { tempo: "2º Tempo", inicio: "08:20", fim: "09:05" },
  { tempo: "3º Tempo", inicio: "09:10", fim: "09:55" },
  { tempo: "4º Tempo", inicio: "10:05", fim: "10:50" },
  { tempo: "5º Tempo", inicio: "10:55", fim: "11:40" },
  { tempo: "6º Tempo", inicio: "11:45", fim: "12:30" },
];

const formInicial = {
  turma_id: "",
  disciplina_id: "",
  professor_id: "",
  dia_semana: "",
  tempo: "",
  quantidade_tempos:"1",
  hora_inicio: "",
  hora_fim: "",
  sala: "",
};

export default function Horarios() {
  const [saving, setSaving] = useState(false);
  const [turmas, setTurmas] = useState([]);
  const [disciplinasDaTurma, setDisciplinasDaTurma] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [editingHorario, setEditingHorario] = useState(null);
  const [q, setQ] = useState("");
  const [turmaAtual, setTurmaAtual] = useState(0);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successText, setSuccessText] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [horarioParaRemover, setHorarioParaRemover] = useState(null);

const temposDisponiveis = useMemo(() => {
  if (String(form.quantidade_tempos) === "2") {
    return tempos.filter((t) => t.tempo !== "6º Tempo");
  }

  return tempos;
}, [form.quantidade_tempos]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [t, a, h] = await Promise.all([
        http.get("/admin/turmas"),
        http.get("/admin/atribuicoes"),
        http.get("/admin/horarios"),
      ]);

      setTurmas(Array.isArray(t.data) ? t.data : []);
      setAtribuicoes(Array.isArray(a.data) ? a.data : []);
      setHorarios(Array.isArray(h.data) ? h.data : []);
    } catch {
      abrirErro("Erro ao carregar dados.");
    }
  }

  function abrirSucesso(texto) {
    setSuccessText(texto);
    setSuccessOpen(true);
  }

  function abrirErro(texto) {
    setErrorText(texto);
    setErrorOpen(true);
  }

  async function carregarDisciplinasDaTurma(turmaId) {
    if (!turmaId) {
      setDisciplinasDaTurma([]);
      return;
    }

    try {
      const res = await http.get(`/admin/turmas/${turmaId}/disciplinas`);
      setDisciplinasDaTurma(Array.isArray(res.data) ? res.data : []);
    } catch {
      abrirErro("Erro ao carregar disciplinas da turma.");
    }
  }

  async function handleTurmaChange(e) {
    const turmaId = e.target.value;

    setForm((prev) => ({
      ...prev,
      turma_id: turmaId,
      disciplina_id: "",
      professor_id: "",
    }));

    await carregarDisciplinasDaTurma(turmaId);
  }

  function handleDisciplinaChange(e) {
    const disciplinaId = e.target.value;

    const atribuicao = atribuicoes.find(
      (a) =>
        String(a.turma_id) === String(form.turma_id) &&
        String(a.disciplina_id) === String(disciplinaId)
    );

    setForm((prev) => ({
      ...prev,
      disciplina_id: disciplinaId,
      professor_id: atribuicao?.professor_id ? String(atribuicao.professor_id) : "",
    }));
  }

  function handleTempoChange(e) {
    const tempoSelecionado = e.target.value;
    const encontrado = tempos.find((t) => t.tempo === tempoSelecionado);

    setForm((prev) => ({
      ...prev,
      tempo: tempoSelecionado,
      hora_inicio: encontrado?.inicio || "",
      hora_fim: encontrado?.fim || "",
    }));
  }

  const professorDaDisciplina = useMemo(() => {
    return atribuicoes.find(
      (a) =>
        String(a.turma_id) === String(form.turma_id) &&
        String(a.disciplina_id) === String(form.disciplina_id)
    );
  }, [atribuicoes, form.turma_id, form.disciplina_id]);

  const horariosFiltrados = useMemo(() => {
    const s = q.trim().toLowerCase();

    if (!s) return horarios;

    return horarios.filter((h) => {
      const turma = h?.turma?.codigo_turma || h?.turma?.nome || "";
      const disciplina = h?.disciplina?.nome || "";
      const professor = h?.professor?.name || "sem docente atribuído";
      const sala = h?.sala || "";
      const dia = h?.dia_semana || "";

      return `${turma} ${disciplina} ${professor} ${sala} ${dia}`.toLowerCase().includes(s);
    });
  }, [q, horarios]);

  const turmasComHorarios = useMemo(() => {
    const mapa = new Map();

    horariosFiltrados.forEach((h) => {
      const nome = h?.turma?.codigo_turma || h?.turma?.nome || `Turma #${h.turma_id}`;

      if (!mapa.has(nome)) mapa.set(nome, []);
      mapa.get(nome).push(h);
    });

    return Array.from(mapa.entries());
  }, [horariosFiltrados]);

  const turmaSelecionada = turmasComHorarios[turmaAtual];

  useEffect(() => {
    if (turmaAtual > turmasComHorarios.length - 1) {
      setTurmaAtual(0);
    }
  }, [turmasComHorarios.length, turmaAtual]);

  async function salvarHorario() {
    if (!form.turma_id) return abrirErro("Seleciona uma turma.");
    if (!form.disciplina_id) return abrirErro("Seleciona uma disciplina.");
    if (!form.dia_semana) return abrirErro("Seleciona o dia da semana.");
    if (!form.hora_inicio || !form.hora_fim) return abrirErro("Seleciona o horário.");
    if (!form.sala.trim()) return abrirErro("Informa a sala.");

    setSaving(true);

    try {
      const payload = {
        turma_id: Number(form.turma_id),
        disciplina_id: Number(form.disciplina_id),
        professor_id: form.professor_id ? Number(form.professor_id) : null,
        dia_semana: form.dia_semana,
        tempo: form.tempo || null,
        hora_inicio: form.hora_inicio,
        hora_fim: form.hora_fim,
        sala: form.sala.trim(),
        quantidade_tempos:Number(form.quantidade_tempos || 1),
      };

      if (editingHorario) {
        await http.put(`/admin/horarios/${editingHorario.id}`, payload);
        abrirSucesso("Horário atualizado com sucesso.");
      } else {
        await http.post("/admin/horarios", payload);
        abrirSucesso("Horário criado com sucesso.");
      }

      const res = await http.get("/admin/horarios");
      setHorarios(Array.isArray(res.data) ? res.data : []);
      resetForm();
    } catch (e) {
      abrirErro(e?.response?.data?.message || "Erro ao guardar horário.");
    } finally {
      setSaving(false);
    }
  }

  async function editarHorario(h) {
    setEditingHorario(h);
    await carregarDisciplinasDaTurma(h.turma_id);

    setForm({
      turma_id: String(h.turma_id),
      disciplina_id: String(h.disciplina_id),
      professor_id: h.professor_id ? String(h.professor_id) : "",
      dia_semana: h.dia_semana || "",
      tempo: h.tempo || "",
      hora_inicio: String(h.hora_inicio).slice(0, 5),
      hora_fim: String(h.hora_fim).slice(0, 5),
      sala: h.sala || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingHorario(null);
    setForm(formInicial);
    setDisciplinasDaTurma([]);
  }

  function pedirRemover(h) {
    setHorarioParaRemover(h);
    setConfirmOpen(true);
  }

  async function confirmarRemover() {
    if (!horarioParaRemover) return;

    setSaving(true);

    try {
      await http.delete(`/admin/horarios/${horarioParaRemover.id}`);
      setHorarios((prev) => prev.filter((h) => h.id !== horarioParaRemover.id));
      abrirSucesso("Horário removido com sucesso.");
    } catch {
      abrirErro("Erro ao remover horário.");
    } finally {
      setSaving(false);
      setConfirmOpen(false);
      setHorarioParaRemover(null);
    }
  }

  function proximaTurma() {
    if (turmasComHorarios.length === 0) return;
    setTurmaAtual((prev) => (prev + 1) % turmasComHorarios.length);
  }

  function turmaAnterior() {
    if (turmasComHorarios.length === 0) return;
    setTurmaAtual((prev) =>
      prev === 0 ? turmasComHorarios.length - 1 : prev - 1
    );
  }

  return (
    <div>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0, color: "#0B1B2A" }}>
          {editingHorario ? "Editar horário" : "Novo horário"}
        </h3>

        <div style={styles.formGrid}>
          <Campo label="Turma">
            <select value={form.turma_id} onChange={handleTurmaChange} style={styles.input}>
              <option value="">Seleciona a turma</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codigo_turma || t.nome || `Turma #${t.id}`}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Disciplina">
            <select
              value={form.disciplina_id}
              onChange={handleDisciplinaChange}
              style={styles.input}
              disabled={!form.turma_id}
            >
              <option value="">Seleciona a disciplina</option>
              {disciplinasDaTurma.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Professor">
            <div style={styles.professorBox}>
              {professorDaDisciplina?.professor?.name || "Sem docente atribuído"}
            </div>
          </Campo>

          <Campo label="Dia da semana">
            <select
              value={form.dia_semana}
              onChange={(e) => setForm((prev) => ({ ...prev, dia_semana: e.target.value }))}
              style={styles.input}
            >
              <option value="">Seleciona o dia</option>
              {diasSemana.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Campo>


          <Campo label="Quantidade">
  <select
    value={form.quantidade_tempos}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        quantidade_tempos: e.target.value,
      }))
    }
    style={styles.input}
  >
   <option value="1">1 Tempo</option>
<option value="2">2 Tempos</option>
  </select>
</Campo>

 <Campo label="Tempo">
            <select value={form.tempo} onChange={handleTempoChange} style={styles.input}>
              <option value="">Seleciona o tempo</option>
              {temposDisponiveis.map((t) => (
                <option key={t.tempo} value={t.tempo}>
                  {t.tempo} ({t.inicio} - {t.fim})
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Hora início">
            <input
              type="time"
              value={form.hora_inicio}
              onChange={(e) => setForm((prev) => ({ ...prev, hora_inicio: e.target.value }))}
              style={styles.input}
            />
          </Campo>

          <Campo label="Hora fim">
            <input
              type="time"
              value={form.hora_fim}
              onChange={(e) => setForm((prev) => ({ ...prev, hora_fim: e.target.value }))}
              style={styles.input}
            />
          </Campo>

          <Campo label="Sala">
            <input
              value={form.sala}
              onChange={(e) => setForm((prev) => ({ ...prev, sala: e.target.value }))}
              placeholder="Ex: Sala 102"
              style={styles.input}
            />
          </Campo>
        </div>
{form.tempo && (
  <div style={styles.previewBox}>
    <strong>Previsão:</strong>{" "}
    {form.quantidade_tempos === "2"
      ? `${form.tempo} + próximo tempo`
      : form.tempo}
    <br />
    <span>
      Duração total: {form.hora_inicio || "--:--"} - {form.hora_fim || "--:--"}
    </span>
  </div>
)}
        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button type="button" style={styles.btnPrimary} onClick={salvarHorario} disabled={saving}>
            {saving
              ? "A guardar..."
              : editingHorario
              ? "Atualizar horário"
              : "Guardar horário"}
          </button>

          {editingHorario && (
            <button type="button" style={styles.btnGhost} onClick={resetForm}>
              Cancelar edição
            </button>
          )}
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: 14 }}>
        <div style={styles.filters}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={styles.label}>Pesquisar</div>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setTurmaAtual(0);
              }}
              placeholder="turma, disciplina, professor, sala ou dia..."
              style={styles.input}
            />
          </div>
        </div>

        {turmasComHorarios.length === 0 ? (
          <div style={{ marginTop: 14 }}>
            <div style={styles.empty}>Nenhum horário encontrado.</div>
          </div>
        ) : (
          <div style={styles.carouselCard}>
            <div style={styles.carouselHeader}>
              <div>
                <h3 style={styles.tituloTurma}>
                  Horários da turma {turmaSelecionada?.[0]}
                </h3>
                <p style={styles.muted}>
                  Consulta e gestão dos tempos desta turma.
                </p>
              </div>

              <div style={styles.carouselActions}>
                <button style={styles.arrowBtn} onClick={turmaAnterior}>
                  ‹
                </button>

                <span style={styles.counter}>
                  {turmaAtual + 1} / {turmasComHorarios.length}
                </span>

                <button style={styles.arrowBtn} onClick={proximaTurma}>
                  ›
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Dia</th>
                    <th style={styles.th}>Tempo</th>
                    <th style={styles.th}>Horário</th>
                    <th style={styles.th}>Disciplina</th>
                    <th style={styles.th}>Professor</th>
                    <th style={styles.th}>Sala</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {turmaSelecionada?.[1]?.map((h) => (
                    <tr key={h.id}>
                      <td style={styles.td}>{h.dia_semana}</td>
                      <td style={styles.td}>{h.tempo || "-"}</td>
                      <td style={styles.td}>
                        {String(h.hora_inicio).slice(0, 5)} -{" "}
                        {String(h.hora_fim).slice(0, 5)}
                      </td>
                      <td style={styles.td}>{h?.disciplina?.nome || "-"}</td>
                      <td style={styles.td}>
                        {h?.professor?.name ? (
                          h.professor.name
                        ) : (
                          <span style={styles.badgeWarn}>Sem docente atribuído</span>
                        )}
                      </td>
                      <td style={styles.td}>{h.sala || "-"}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actions}>
                          <button type="button" style={styles.btnGhost} onClick={() => editarHorario(h)}>
                            Editar
                          </button>
                          <button type="button" style={styles.btnDanger} onClick={() => pedirRemover(h)}>
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {confirmOpen && (
        <div style={styles.backdrop}>
          <div style={styles.statusModal}>
            <div style={styles.errorIcon}>!</div>
            <h3 style={{ color: "#0B1B2A", margin: "0 0 8px" }}>
              Remover horário
            </h3>
            <p style={styles.confirmText}>
              Tens certeza que queres remover este horário?
            </p>
            <div style={styles.modalActions}>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setConfirmOpen(false);
                  setHorarioParaRemover(null);
                }}
              >
                Não
              </button>
              <button style={styles.btnDanger} onClick={confirmarRemover} disabled={saving}>
                {saving ? "A remover..." : "Sim, remover"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successOpen && (
        <div style={styles.backdrop} onClick={() => setSuccessOpen(false)}>
          <div style={styles.statusModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={{ color: "#166534", margin: "0 0 8px" }}>
              {successText}
            </h3>
            <button style={styles.btnPrimary} onClick={() => setSuccessOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {errorOpen && (
        <div style={styles.backdrop} onClick={() => setErrorOpen(false)}>
          <div style={styles.statusModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.errorIcon}>!</div>
            <h3 style={{ color: "#B91C1C", margin: "0 0 8px" }}>Erro</h3>
            <p style={styles.confirmText}>{errorText}</p>
            <button style={styles.btnDanger} onClick={() => setErrorOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      {children}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
    gap: 12,
  },
  filters: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "end",
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
    background: "#fff",
    boxSizing: "border-box",
  },
  professorBox: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    boxSizing: "border-box",
    fontWeight: 850,
    color: "rgba(11,27,42,.78)",
  },
  carouselCard: {
    marginTop: 14,
    borderRadius: 18,
    border: "1px solid rgba(11,27,42,.08)",
    background: "rgba(11,27,42,.015)",
    padding: 14,
  },
  carouselHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tituloTurma: {
    margin: 0,
    fontSize: 20,
    fontWeight: 950,
    color: "#0B1B2A",
  },
  muted: {
    margin: "4px 0 0",
    color: "rgba(11,27,42,.62)",
    fontWeight: 650,
  },
  carouselActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  arrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "#fff",
    color: "#0A4174",
    fontSize: 24,
    fontWeight: 950,
    cursor: "pointer",
  },
  counter: {
    fontWeight: 950,
    color: "#0B1B2A",
    padding: "0 6px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".3px",
    color: "rgba(11,27,42,.65)",
    borderBottom: "1px solid rgba(11,27,42,.10)",
    padding: "12px 10px",
    whiteSpace: "nowrap",
  },
  td: {
    borderBottom: "1px solid rgba(11,27,42,.06)",
    padding: "12px 10px",
    color: "#0B1B2A",
    fontWeight: 650,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
  badgeWarn: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(245,158,11,.30)",
    background: "rgba(245,158,11,.12)",
    color: "#7C4A03",
    fontWeight: 900,
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
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "#fff",
    color: "#0B1B2A",
  },
  btnDanger: {
    border: "1px solid rgba(239,68,68,.25)",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
  },
  empty: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  statusModal: {
    width: "min(390px, 100%)",
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    textAlign: "center",
  },
  confirmText: {
    color: "rgba(11,27,42,.72)",
    fontWeight: 650,
    lineHeight: 1.5,
  },
  modalActions: {
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    gap: 10,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    margin: "0 auto 14px",
    display: "grid",
    placeItems: "center",
    background: "rgba(34,197,94,.12)",
    color: "#166534",
    fontWeight: 950,
    fontSize: 30,
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    margin: "0 auto 14px",
    display: "grid",
    placeItems: "center",
    background: "rgba(239,68,68,.12)",
    color: "#B91C1C",
    fontWeight: 950,
    fontSize: 30,
  },
  previewBox: {
  marginTop: 14,
  padding: 12,
  borderRadius: 14,
  background: "rgba(10,65,116,.06)",
  border: "1px solid rgba(10,65,116,.12)",
  color: "#0B1B2A",
  fontWeight: 750,
},
};