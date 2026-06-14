import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function FaltasAluno() {
  const [faltas, setFaltas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [disciplinaFiltro, setDisciplinaFiltro] = useState("");
  const [trimestreFiltro, setTrimestreFiltro] = useState("");

  useEffect(() => {
    async function carregarFaltas() {
      try {
        const res = await http.get("/estudante/faltas");
        setFaltas(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    carregarFaltas();
  }, []);

  const disciplinasDasFaltas = useMemo(() => {
    return [...new Set(faltas.map((f) => f.disciplina).filter(Boolean))];
  }, [faltas]);

  function getTrimestre(data) {
    if (!data) return "";

    const mes = new Date(data).getMonth() + 1;

    if ([9, 10, 11, 12].includes(mes)) return "I Trimestre";
    if ([1, 2, 3].includes(mes)) return "II Trimestre";
    if ([4, 5, 6, 7].includes(mes)) return "III Trimestre";

    return "Sem trimestre";
  }

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const faltasFiltradas = useMemo(() => {
    return faltas.filter((f) => {
      const mesmaDisciplina =
        !disciplinaFiltro || f.disciplina === disciplinaFiltro;

      const mesmoTrimestre =
        !trimestreFiltro || getTrimestre(f.data) === trimestreFiltro;

      return mesmaDisciplina && mesmoTrimestre;
    });
  }, [faltas, disciplinaFiltro, trimestreFiltro]);

  const totalFaltas = faltasFiltradas.length;

  const alertaFaltas = useMemo(() => {
    const contador = {};

    faltas.forEach((f) => {
      if (!f.disciplina) return;
      contador[f.disciplina] = (contador[f.disciplina] || 0) + 1;
    });

    return Object.entries(contador).filter(([, total]) => total >= 3);
  }, [faltas]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {alertaFaltas.length > 0 && (
        <div style={styles.alertBox}>
          {alertaFaltas.map(([disciplina, total]) => (
            <div key={disciplina}>
              Atenção: tens {total} faltas em <strong>{disciplina}</strong>.
            </div>
          ))}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
           
            <div style={styles.muted}>
              Faltas marcadas pelos professores.
            </div>
          </div>

          <div style={styles.faltasPill}>{totalFaltas} faltas</div>
        </div>

        <div style={styles.filters}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={styles.label}>Disciplina</div>

            <select
              style={styles.input}
              value={disciplinaFiltro}
              onChange={(e) => setDisciplinaFiltro(e.target.value)}
            >
              <option value="">Todas</option>

              {disciplinasDasFaltas.map((disciplina) => (
                <option key={disciplina} value={disciplina}>
                  {disciplina}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={styles.label}>Trimestre</div>

            <select
              style={styles.input}
              value={trimestreFiltro}
              onChange={(e) => setTrimestreFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="I Trimestre">I Trimestre</option>
              <option value="II Trimestre">II Trimestre</option>
              <option value="III Trimestre">III Trimestre</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nº</th>
                <th style={styles.th}>Disciplina</th>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Trimestre</th>
                <th style={styles.th}>Tempo</th>
                <th style={styles.th}>Professor</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 16 }}>
                    <div style={styles.empty}>A carregar faltas...</div>
                  </td>
                </tr>
              ) : faltasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 16 }}>
                    <div style={styles.empty}>Nenhuma falta encontrada.</div>
                  </td>
                </tr>
              ) : (
                faltasFiltradas.map((f, index) => (
                  <tr key={f.id || index}>
                    <td style={styles.td}>{index + 1}</td>

                    <td style={styles.td}>
                      <strong>{f.disciplina || "-"}</strong>
                    </td>

                    <td style={styles.td}>{formatarData(f.data)}</td>

                    <td style={styles.td}>{getTrimestre(f.data)}</td>

                    <td style={styles.td}>{f.tempo_aula || "-"}</td>

                    <td style={styles.td}>{f.professor || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.hint}>
          A partir de 3 faltas na mesma disciplina, o sistema mostra alerta.
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 14,
    minWidth: 0,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 950,
    color: "#0B1B2A",
  },

  muted: {
    margin: "4px 0 0",
    color: "rgba(11,27,42,.65)",
    fontWeight: 650,
    fontSize: 13,
  },

  faltasPill: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,.20)",
    background: "rgba(239,68,68,.08)",
    color: "#B91C1C",
    fontWeight: 950,
    fontSize: 12,
  },

  filters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  },

  label: {
    fontWeight: 900,
    color: "rgba(11,27,42,.75)",
    marginBottom: 5,
    fontSize: 12,
  },

  input: {
    width: "100%",
    padding: "9px 10px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
    fontSize: 13,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8,
    minWidth: 680,
  },

  th: {
    textAlign: "left",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: ".3px",
    color: "rgba(11,27,42,.65)",
    borderBottom: "1px solid rgba(11,27,42,.10)",
    padding: "10px 8px",
    whiteSpace: "nowrap",
  },

  td: {
    borderBottom: "1px solid rgba(11,27,42,.06)",
    padding: "10px 8px",
    color: "#0B1B2A",
    fontWeight: 650,
    verticalAlign: "top",
    whiteSpace: "nowrap",
    fontSize: 13,
  },

  empty: {
    padding: 12,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
    fontSize: 13,
  },

  alertBox: {
    padding: 12,
    borderRadius: 16,
    background: "rgba(245,158,11,.12)",
    border: "1px solid rgba(245,158,11,.25)",
    color: "#92400E",
    fontWeight: 850,
    lineHeight: 1.5,
    fontSize: 13,
  },

  hint: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: 650,
    color: "rgba(11,27,42,.6)",
  },
};