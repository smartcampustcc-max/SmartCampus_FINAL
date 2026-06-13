import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function Notas() {
  const [loading, setLoading] = useState(false);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [historico, setHistorico] = useState([]);

  const [turmaId, setTurmaId] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [trimestre, setTrimestre] = useState("1º Trimestre");
  const [tipoAvaliacao, setTipoAvaliacao] = useState("Avaliação");
  const [dataAvaliacao, setDataAvaliacao] = useState(
  new Date().toISOString().split("T")[0]
);
  const [notas, setNotas] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("info");
  const [modalText, setModalText] = useState("");
  const [modalNotas, setModalNotas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tituloModal, setTituloModal] = useState("");

  useEffect(() => {
    carregarAtribuicoes();
    carregarHistorico();
  }, []);

  const turmas = useMemo(() => {
    const mapa = new Map();

    atribuicoes.forEach((a) => {
      if (a.turma) mapa.set(a.turma.id, a.turma);
    });

    return Array.from(mapa.values());
  }, [atribuicoes]);

  const disciplinas = useMemo(() => {
    return atribuicoes.filter((a) => String(a.turma_id) === String(turmaId));
  }, [atribuicoes, turmaId]);

  useEffect(() => {
    if (!turmaId) {
      setAlunos([]);
      setNotas({});
      return;
    }

    carregarAlunos();
  }, [turmaId]);

  useEffect(() => {
    if (!turmaId || !disciplinaId) {
      setNotas({});
      return;
    }

    carregarNotas();
  }, [turmaId, disciplinaId, trimestre, tipoAvaliacao]);

  function abrirModal(texto, type = "info") {
    setModalText(texto);
    setModalType(type);
    setModalOpen(true);
  }

  async function carregarAtribuicoes() {
    try {
      const res = await http.get("/professor/minhas-atribuicoes");
      setAtribuicoes(res.data?.atribuicoes || []);
    } catch (e) {
      abrirModal("Erro ao carregar as turmas e disciplinas.", "error");
    }
  }

  async function carregarAlunos() {
    try {
      const res = await http.get(`/professor/turmas/${turmaId}/alunos`);
      setAlunos(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      abrirModal("Erro ao carregar os alunos da turma.", "error");
    }
  }

  async function carregarNotas() {
    try {
      const res = await http.get("/professor/notas", {
        params: {
          turma_id: turmaId,
          disciplina_id: disciplinaId,
          trimestre,
          tipo_avaliacao: tipoAvaliacao,

        },
      });

      const mapa = {};

      if (Array.isArray(res.data)) {
        res.data.forEach((n) => {
          mapa[n.estudante_id] = n.nota;
        });
      }

      setNotas(mapa);
    } catch (e) {
      abrirModal("Erro ao carregar notas já guardadas.", "error");
    }
  }

  async function carregarHistorico() {
    try {
      const res = await http.get("/professor/notas/historico");
      setHistorico(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setHistorico([]);
    }
  }

  function alterarNota(estudanteId, valor) {
    if (valor === "") {
      setNotas((prev) => ({
        ...prev,
        [estudanteId]: "",
      }));
      return;
    }

    const nota = Number(valor);

    if (Number.isNaN(nota) || nota < 0 || nota > 20) {
      abrirModal("A nota deve estar entre 0 e 20.", "error");
      return;
    }

    setNotas((prev) => ({
      ...prev,
      [estudanteId]: valor,
    }));
  }

  async function guardarNotas() {
    if (!turmaId || !disciplinaId) {
      abrirModal("Seleciona a turma e a disciplina antes de guardar.", "warning");
      return;
    }

    const payload = alunos
      .filter((a) => notas[a.id] !== undefined && notas[a.id] !== "")
      .map((a) => ({
        estudante_id: a.id,
        nota: Number(notas[a.id]),
      }));

    if (payload.length === 0) {
      abrirModal("Adiciona pelo menos uma nota a um aluno antes de guardar.", "warning");
      return;
    }

    const invalida = payload.find(
      (item) => Number.isNaN(item.nota) || item.nota < 0 || item.nota > 20
    );

    if (invalida) {
      abrirModal("As notas devem estar entre 0 e 20.", "error");
      return;
    }

    setLoading(true);

    try {
      await http.post("/professor/notas", {
        turma_id: Number(turmaId),
        disciplina_id: Number(disciplinaId),
        trimestre,
        tipo_avaliacao: tipoAvaliacao,
        data_avaliacao:dataAvaliacao,
        notas: payload,
      });

      await carregarNotas();
      await carregarHistorico();

      abrirModal("Notas guardadas com sucesso.", "success");
    } catch (e) {
      abrirModal(e?.response?.data?.message || "Erro ao guardar notas.", "error");
    } finally {
      setLoading(false);
    }
  }

  function verHistorico(item) {
    setTurmaId(String(item.turma_id));
    setDisciplinaId(String(item.disciplina_id));
    setTrimestre(item.trimestre);
    setTipoAvaliacao(item.tipo_avaliacao);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
const verNotas = async (item) => {
  try {
    const response = await http.get("/professor/notas/detalhes", {
      params: {
        turma_id: item.turma_id,
        disciplina_id: item.disciplina_id,
        trimestre: item.trimestre,
        tipo_avaliacao: item.tipo_avaliacao,
        data_avaliacao: item.data_avaliacao,
      },
    });

    setModalNotas(response.data);

   setTituloModal(
  `${item.disciplina} - ${item.trimestre} - ${item.tipo_avaliacao} - ${
    item.data_avaliacao
      ? new Date(item.data_avaliacao).toLocaleDateString("pt-PT")
      : "Sem data"
  }`
);

    setMostrarModal(true);
  } catch (e) {
  abrirModal(
    e?.response?.data?.message || "Erro ao carregar as notas desta avaliação.",
    "error"
  );
}
};
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.filters}>
          <div style={styles.field}>
            <div style={styles.label}>Turma</div>
            <select
              value={turmaId}
              onChange={(e) => {
                setTurmaId(e.target.value);
                setDisciplinaId("");
                setNotas({});
              }}
              style={styles.input}
            >
              <option value="">Seleciona a turma</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codigo_turma || t.nome}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>Disciplina</div>
            <select
              value={disciplinaId}
              onChange={(e) => setDisciplinaId(e.target.value)}
              style={styles.input}
            >
              <option value="">Seleciona a disciplina</option>
              {disciplinas.map((a) => (
                <option key={`${a.turma_id}-${a.disciplina_id}`} value={a.disciplina_id}>
                  {a.disciplina?.nome}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>Trimestre</div>
            <select
              value={trimestre}
              onChange={(e) => setTrimestre(e.target.value)}
              style={styles.input}
            >
              <option>1º Trimestre</option>
              <option>2º Trimestre</option>
              <option>3º Trimestre</option>
            </select>
          </div>
<div style={styles.field}>
  <div style={styles.label}>Data da avaliação</div>
  <input
    type="date"
    value={dataAvaliacao}
    onChange={(e) => setDataAvaliacao(e.target.value)}
    style={styles.input}
  />
</div>
          <div style={styles.field}>
            <div style={styles.label}>Tipo de Avaliação</div>
            <select
              value={tipoAvaliacao}
              onChange={(e) => setTipoAvaliacao(e.target.value)}
              style={styles.input}
            >
              <option>Avaliação</option>
              <option>Prova</option>
              <option>Trabalho</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Lançamento de notas</h3>
            <p style={styles.muted}>
              Preenche apenas os alunos que têm nota nesta avaliação.
            </p>
          </div>

          <button
            type="button"
            onClick={guardarNotas}
            style={styles.btnPrimary}
            disabled={loading}
          >
            {loading ? "A guardar..." : "Guardar notas"}
          </button>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Aluno</th>
                <th style={styles.th}>Número</th>
                <th style={styles.th}>Nota</th>
              </tr>
            </thead>

            <tbody>
              {alunos.map((a) => (
                <tr key={a.id}>
                  <td style={styles.tdAluno}>{a.nome_completo}</td>
                  <td style={styles.td}>{a.numero_aluno || "-"}</td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={notas[a.id] ?? ""}
                      onChange={(e) => alterarNota(a.id, e.target.value)}
                      style={styles.notaInput}
                      placeholder="-"
                    />
                  </td>
                </tr>
              ))}

              {alunos.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: 16 }}>
                    <div style={styles.empty}>
                      Seleciona uma turma para carregar os alunos.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Histórico de avaliações</h3>
            <p style={styles.muted}>
              Avaliações já guardadas por turma, disciplina e trimestre.
            </p>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Turma</th>
                <th style={styles.th}>Disciplina</th>
                <th style={styles.th}>Trimestre</th>
                 <th style={styles.th}>Data</th>
                <th style={styles.th}>Avaliação</th>
                <th style={styles.th}>Alunos avaliados</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {historico.map((h, index) => (
                <tr key={index}>
                  <td style={styles.td}>{h.turma || "-"}</td>
                  <td style={styles.td}>{h.disciplina || "-"}</td>
                  <td style={styles.td}>{h.trimestre}</td>
                  <td style={styles.td}>
  {h.data_avaliacao
    ? new Date(h.data_avaliacao).toLocaleDateString("pt-PT")
    : "-"}
</td>
                  <td style={styles.td}>{h.tipo_avaliacao}</td>
                  <td style={styles.td}>{h.total_alunos}</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <button onClick={() => verNotas(h)}>
                     Ver notas
                   </button>
                  </td>
                </tr>
              ))}

              {historico.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 16 }}>
                    <div style={styles.empty}>
                      Ainda não existem avaliações guardadas.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div style={styles.backdrop} onClick={() => setModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                ...styles.modalIcon,
                ...(modalType === "success"
                  ? styles.iconSuccess
                  : modalType === "error"
                  ? styles.iconError
                  : styles.iconWarning),
              }}
            >
              {modalType === "success" ? "✓" : "!"}
            </div>

            <h3 style={styles.modalTitle}>
              {modalType === "success"
                ? "Sucesso"
                : modalType === "error"
                ? "Erro"
                : "Atenção"}
            </h3>

            <p style={styles.modalText}>{modalText}</p>

            <button
              type="button"
              style={modalType === "error" ? styles.btnDanger : styles.btnPrimary}
              onClick={() => setModalOpen(false)}
            >
             Ok
            </button>
          </div>
        </div>
      )}
   {mostrarModal && (
  <div style={styles.backdrop} onClick={() => setMostrarModal(false)}>
    <div style={styles.modalGrande} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <div>
          <h3 style={{ margin: 0, color: "#0B1B2A" }}>{tituloModal}</h3>
          <p style={styles.muted}>Alunos avaliados nesta avaliação.</p>
        </div>

        <button style={styles.btnGhost} onClick={() => setMostrarModal(false)}>
          Fechar
        </button>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Aluno</th>
              <th style={styles.th}>Número</th>
              <th style={styles.th}>Nota</th>
            </tr>
          </thead>

          <tbody>
            {modalNotas.map((aluno, index) => (
              <tr key={index}>
                <td style={styles.tdAluno}>{aluno.nome}</td>
                <td style={styles.td}>{aluno.numero}</td>
                <td style={styles.td}>
                  <span style={styles.notaPill}>{Number(aluno.nota)}</span>
                </td>
              </tr>
            ))}

            {modalNotas.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: 16 }}>
                  <div style={styles.empty}>Nenhuma nota encontrada.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: 14,
  },

  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 10px 30px rgba(11,27,42,.06)",
  },

  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(160px, 1fr))",
    gap: 12,
  },

  field: {
    minWidth: 0,
  },

  label: {
    fontWeight: 900,
    color: "rgba(11,27,42,.75)",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 14,
    border: "1px solid rgba(11,27,42,.12)",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    fontWeight: 650,
    color: "#0B1B2A",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  sectionTitle: {
    margin: 0,
    color: "#0B1B2A",
    fontSize: 18,
    fontWeight: 950,
  },

  muted: {
    margin: "5px 0 0",
    color: "rgba(11,27,42,.62)",
    fontWeight: 650,
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid rgba(11,27,42,.10)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".3px",
    color: "rgba(11,27,42,.62)",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 10px",
    borderBottom: "1px solid rgba(11,27,42,.06)",
    color: "#0B1B2A",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  tdAluno: {
    padding: "13px 10px",
    borderBottom: "1px solid rgba(11,27,42,.06)",
    color: "#0B1B2A",
    fontWeight: 900,
    minWidth: 260,
  },

  notaInput: {
    width: 90,
    padding: "9px 10px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    outline: "none",
    textAlign: "center",
    fontWeight: 900,
    color: "#0B1B2A",
  },

  btnPrimary: {
    border: "none",
    padding: "10px 16px",
    borderRadius: 14,
    fontWeight: 950,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
    boxShadow: "0 10px 22px rgba(10,65,116,.20)",
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
    padding: "10px 16px",
    borderRadius: 14,
    fontWeight: 950,
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

  modal: {
    width: "min(390px, 100%)",
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    textAlign: "center",
  },

  modalIcon: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    margin: "0 auto 14px",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    fontSize: 30,
  },

  iconSuccess: {
    background: "rgba(34,197,94,.12)",
    color: "#166534",
  },

  iconError: {
    background: "rgba(239,68,68,.12)",
    color: "#B91C1C",
  },

  iconWarning: {
    background: "rgba(245,158,11,.14)",
    color: "#92400E",
  },

  modalTitle: {
    margin: "0 0 8px",
    color: "#0B1B2A",
    fontWeight: 950,
  },

  modalText: {
    color: "rgba(11,27,42,.70)",
    fontWeight: 650,
    lineHeight: 1.5,
    marginBottom: 18,
  },
  modalGrande: {
  width: "min(720px, 100%)",
  background: "#fff",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 20px 60px rgba(0,0,0,.20)",
},

modalHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
},

notaPill: {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 999,
  background: "rgba(10,65,116,.08)",
  border: "1px solid rgba(10,65,116,.14)",
  color: "#0A4174",
  fontWeight: 950,
},
};