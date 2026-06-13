import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function TurmasDisciplinas() {
  const [q, setQ] = useState("");
  const [turma, setTurma] = useState("Todas");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [itens, setItens] = useState([]);
  const [professor, setProfessor] = useState(null);

  async function fetchMinhasAtribuicoes() {
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await http.get("/professor/minhas-atribuicoes");
      const raw = res.data;

      setProfessor(raw?.professor || null);

      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.atribuicoes)
        ? raw.atribuicoes
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      const mapped = list.map((a) => ({
        id: a.id,
        turma: a?.turma?.name || a?.turma?.nome || `Turma #${a.turma_id}`,
        disciplina: a?.disciplina?.nome || a?.disciplina?.name || `Disciplina #${a.disciplina_id}`,
        sala: a?.turma?.sala || a?.turma?.room || "-",
        aulasSemana: a?.aulas_semana ?? "-",
        turma_id: a.turma_id,
        disciplina_id: a.disciplina_id,
      }));

      setItens(mapped);
    } catch (e) {
      setItens([]);
      setProfessor(null);
      setMsg({
        type: "error",
        text:
          e?.response?.data?.message ||
          "Erro ao carregar tuas turmas/disciplinas. Confirma o token, o login do professor e o backend.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMinhasAtribuicoes();
  }, []);

  const turmas = useMemo(() => {
    const set = new Set(itens.map((i) => i.turma));
    return ["Todas", ...Array.from(set)];
  }, [itens]);

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    return itens.filter((i) => {
      const okTurma = turma === "Todas" ? true : i.turma === turma;
      const okQ =
        !s ||
        i.turma.toLowerCase().includes(s) ||
        i.disciplina.toLowerCase().includes(s) ||
        String(i.sala).toLowerCase().includes(s);
      return okTurma && okQ;
    });
  }, [itens, q, turma]);

  function abrir(i) {
    window.location.href = `/professor/turma/${i.turma_id}/disciplina/${i.disciplina_id}`;
  }

  return (
    <div>
    

      <div style={styles.card}>
        <div style={styles.filters}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={styles.label}>Pesquisar</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="turma, disciplina, sala..."
              style={styles.input}
            />
          </div>

          <div style={{ width: 220, minWidth: 220 }}>
            <div style={styles.label}>Turma</div>
            <select value={turma} onChange={(e) => setTurma(e.target.value)} style={styles.input}>
              {turmas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: 14 }}>
        {loading ? (
          <div style={styles.empty}>A carregar tuas atribuições...</div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Turma</th>
                  <th style={styles.th}>Disciplina</th>
                  <th style={styles.th}>Sala</th>
                  <th style={styles.th}>Aulas/Semana</th>
                  <th style={{ ...styles.th, width: 180 }}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map((i) => (
                  <tr key={i.id}>
                    <td style={styles.td}>
                      <span style={styles.badge}>{i.turma}</span>
                    </td>
                    <td style={styles.td}>{i.disciplina}</td>
                    <td style={styles.td}>{i.sala}</td>
                    <td style={styles.td}>{i.aulasSemana}</td>
                    <td style={styles.td}>
                      <button onClick={() => abrir(i)} style={styles.btnGhost}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}

                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 16 }}>
                      <div style={styles.empty}>
                        Nenhuma turma/disciplina encontrada para este professor.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
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
  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
  },
  filters: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "end",
  },
  label: { fontWeight: 900, color: "rgba(11,27,42,.75)", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    outline: "none",
    background: "#fff",
  },
  pill: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
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
  table: { width: "100%", borderCollapse: "collapse", marginTop: 8 },
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
  empty: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
  },
  error: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(239,68,68,.25)",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
    fontWeight: 850,
  },
  success: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(34,197,94,.25)",
    background: "rgba(34,197,94,.10)",
    color: "#166534",
    fontWeight: 850,
  },
};