import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import http from "../../api/http";

export default function GerirAlunosTurma() {
  const { turmaId } = useParams();
  const navigate = useNavigate();

  const [turma, setTurma] = useState(null);
  const [elegiveis, setElegiveis] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchTurma();
    fetchElegiveis();
  }, [turmaId]);

  async function fetchTurma() {
    try {
      const res = await http.get(`/admin/turmas/${turmaId}`);
      setTurma(res.data);
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao carregar dados da turma.",
      });
    }
  }

  async function fetchElegiveis() {
    setLoading(true);
    try {
      const res = await http.get(`/admin/turmas/${turmaId}/alunos-elegiveis`);
      setElegiveis(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setElegiveis([]);
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao carregar alunos elegíveis.",
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleAluno(id) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleTodos() {
    const idsVisiveis = filtrados.map((a) => a.id);
    const todosSelecionados = idsVisiveis.every((id) => selecionados.includes(id));

    if (todosSelecionados) {
      setSelecionados((prev) => prev.filter((id) => !idsVisiveis.includes(id)));
    } else {
      setSelecionados((prev) => Array.from(new Set([...prev, ...idsVisiveis])));
    }
  }

  async function adicionarSelecionados() {
    if (selecionados.length === 0) {
      setMsg({ type: "error", text: "Selecione pelo menos um aluno." });
      return;
    }

    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await http.post(`/admin/turmas/${turmaId}/adicionar-alunos`, {
        alunos_ids: selecionados,
      });

      setMsg({
        type: "ok",
        text: res?.data?.message || "Alunos adicionados com sucesso.",
      });

      setSelecionados([]);
      await fetchTurma();
      await fetchElegiveis();
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao adicionar alunos à turma.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function removerAluno(alunoId) {
    if (!window.confirm("Remover este aluno da turma?")) return;

    try {
      await http.delete(`/admin/turmas/${turmaId}/alunos/${alunoId}`);
      await fetchTurma();
      await fetchElegiveis();
      setMsg({ type: "ok", text: "Aluno removido da turma com sucesso." });
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao remover aluno da turma.",
      });
    }
  }

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();

    return elegiveis.filter((a) => {
      const nome = (a.nome_completo || "").toLowerCase();
      const matricula = (a.numero_aluno || "").toLowerCase();
      return !s || nome.includes(s) || matricula.includes(s);
    });
  }, [elegiveis, q]);

  const alunosNaTurma = useMemo(() => {
    return Array.isArray(turma?.estudantes) ? turma.estudantes : [];
  }, [turma]);

  const todosVisiveisSelecionados =
    filtrados.length > 0 && filtrados.every((a) => selecionados.includes(a.id));

  return (
    <div>
      <div style={styles.header}>
        <div>
          <button style={styles.btnGhost} onClick={() => navigate("/admin/turmas")}>
            Voltar
          </button>
          <h3 style={{ margin: "10px 0 0", color: "#0B1B2A" }}>
            Gerir alunos da turma
          </h3>
        </div>
      </div>

      {turma && (
        <div style={styles.card}>
          <div style={styles.infoGrid}>
            <div><b>Turma:</b> {turma.nome}</div>
            <div><b>Código:</b> {turma.codigo_turma || "-"}</div>
            <div><b>Curso:</b> {turma?.curso?.nome || "-"}</div>
            <div><b>Classe:</b> {turma.classe || "-"}</div>
            <div><b>Turno:</b> {turma.turno || "-"}</div>
            <div><b>Limite:</b> {turma.limite_alunos ?? 15}</div>
          </div>
        </div>
      )}

      {msg.text && (
        <div
          style={{
            ...styles.card,
            borderLeft: msg.type === "ok" ? "6px solid #16a34a" : "6px solid #ef4444",
            marginTop: 14,
          }}
        >
          <b style={{ display: "block", marginBottom: 6 }}>
            {msg.type === "ok" ? "✅" : "❌"} Mensagem
          </b>
          <div>{msg.text}</div>
        </div>
      )}

      <div style={{ ...styles.card, marginTop: 14 }}>
        <div style={styles.toolbar}>
          <div style={{ flex: 1 }}>
            <div style={styles.label}>Pesquisar alunos elegíveis</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar por nome ou matrícula..."
              style={styles.input}
            />
          </div>

          <div>
            <div style={styles.label}>Ações</div>
            <button style={styles.btnPrimary} onClick={adicionarSelecionados} disabled={loading}>
              {loading ? "A processar..." : "Adicionar selecionados"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: 14 }}>
        <h4 style={styles.sectionTitle}>Alunos elegíveis do curso</h4>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                <input
                  type="checkbox"
                  checked={todosVisiveisSelecionados}
                  onChange={toggleTodos}
                />
              </th>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Matrícula</th>
              <th style={styles.th}>Telefone</th>
              <th style={styles.th}>Conta</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((a) => (
              <tr key={a.id}>
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={selecionados.includes(a.id)}
                    onChange={() => toggleAluno(a.id)}
                  />
                </td>
                <td style={styles.td}>{a.nome_completo}</td>
                <td style={styles.td}>{a.numero_aluno}</td>
                <td style={styles.td}>{a.telefone || "-"}</td>
                <td style={styles.td}>{a.user_id ? "Já criada" : "Será criada"}</td>
              </tr>
            ))}

            {filtrados.length === 0 && (
              <tr>
                <td colSpan={5} style={styles.td}>
                  {loading ? "A carregar..." : "Nenhum aluno elegível encontrado."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ ...styles.card, marginTop: 14 }}>
        <h4 style={styles.sectionTitle}>Alunos já na turma</h4>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Matrícula</th>
              <th style={styles.th}>Utilizador</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {alunosNaTurma.map((a) => (
              <tr key={a.id}>
                <td style={styles.td}>{a.nome_completo}</td>
                <td style={styles.td}>{a.numero_aluno}</td>
                <td style={styles.td}>{a?.user?.username || "-"}</td>
                <td style={styles.td}>
                  <button style={styles.btnDanger} onClick={() => removerAluno(a.id)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}

            {alunosNaTurma.length === 0 && (
              <tr>
                <td colSpan={4} style={styles.td}>
                  Nenhum aluno associado a esta turma.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    color: "#0B1B2A",
    fontWeight: 700,
  },
  toolbar: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "end",
  },
  sectionTitle: {
    margin: "0 0 12px",
    color: "#0B1B2A",
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
  btnPrimary: {
    border: "1px solid rgba(37,99,235,.25)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(37,99,235,.12)",
    color: "#1D4ED8",
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
  },
  td: {
    borderBottom: "1px solid rgba(11,27,42,.06)",
    padding: "12px 10px",
    color: "#0B1B2A",
    fontWeight: 650,
    verticalAlign: "top",
  },
};