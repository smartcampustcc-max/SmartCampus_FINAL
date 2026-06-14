import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function NotasAluno() {
  const [notas, setNotas] = useState([]);
  const [loadingNotas, setLoadingNotas] = useState(true);

  useEffect(() => {
    async function carregarNotas() {
      try {
        const res = await http.get("/estudante/notas");
        setNotas(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingNotas(false);
      }
    }

    carregarNotas();
  }, []);

  const media = useMemo(() => {
    if (notas.length === 0) return "0.0";
    const soma = notas.reduce((acc, n) => acc + Number(n.nota || 0), 0);
    return (soma / notas.length).toFixed(1);
  }, [notas]);

  function corNota(n) {
    const nota = Number(n);
    if (nota >= 14) return "#15803D";
    if (nota >= 10) return "#A16207";
    return "#B91C1C";
  }

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>

      <div style={styles.duasColunas}>
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
            
              <div style={styles.muted}>As tuas avaliações lançadas pelos professores.</div>
            </div>

            <div style={styles.mediaPill}>Média {media}</div>
          </div>

          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={styles.tableNotas}>
              <thead>
                <tr>
                  <th style={styles.th}>Disciplina</th>
                  <th style={styles.th}>Professor</th>
                  <th style={styles.th}>Trimestre</th>
                  <th style={styles.th}>Avaliação</th>
                  <th style={styles.th}>Nota</th>
                  <th style={styles.th}>Estado</th>
                </tr>
              </thead>

              <tbody>
                {loadingNotas ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 16 }}>
                      <div style={styles.empty}>A carregar notas...</div>
                    </td>
                  </tr>
                ) : notas.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 16 }}>
                      <div style={styles.empty}>Sem notas disponíveis.</div>
                    </td>
                  </tr>
                ) : (
                  notas.map((n) => (
                    <tr key={n.id}>
                      <td style={styles.td}>
                        <strong>{n.disciplina}</strong>
                      </td>

                      <td style={styles.td}>{n.professor}</td>
                      <td style={styles.td}>{n.trimestre}</td>
                      <td style={styles.td}>{n.tipo_avaliacao}</td>

                      <td style={styles.td}>
                        <span style={{ ...styles.badge, color: corNota(n.nota) }}>
                          {Number(n.nota).toFixed(1)}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {Number(n.nota) >= 10 ? (
                          <span style={styles.aprovado}>Aprovado</span>
                        ) : (
                          <span style={styles.reprovado}>Reprovado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  duasColunas: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
    alignItems: "start",
    width:"100%",
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
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
  mediaPill: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,.20)",
    background: "rgba(34,197,94,.08)",
    color: "#15803D",
    fontWeight: 950,
    fontSize: 12,
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
  tableNotas: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8,
    minWidth: 900,
  },
  tableFaltas: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8,
    minWidth: 560,
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
  badge: {
    padding: "5px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 950,
  },
  aprovado: {
    color: "#15803D",
    fontWeight: 900,
  },
  reprovado: {
    color: "#B91C1C",
    fontWeight: 900,
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
  hint: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: 650,
    color: "rgba(11,27,42,.6)",
  },
};