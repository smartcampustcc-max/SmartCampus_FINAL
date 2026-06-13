import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function DisciplinasAluno() {
  const [q, setQ] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalDisciplina, setModalDisciplina] = useState(null);

  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        const res = await http.get("/estudante/disciplinas");
        setDisciplinas(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchDisciplinas();
  }, []);

  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();

    if (!s) return disciplinas;

    return disciplinas.filter((item) => {
      const disciplina = item?.disciplina?.nome || "";
      const professor = item?.professor?.name || "";
      const turma = item?.turma?.nome || "";

      return `${disciplina} ${professor} ${turma}`.toLowerCase().includes(s);
    });
  }, [q, disciplinas]);

  return (
    <div>
      <div style={styles.header}>
        

     
      </div>

      <div style={styles.card}>
        <div style={styles.label}>Pesquisar</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="disciplina, professor ou turma..."
          style={styles.input}
        />
      </div>

      <div style={{ ...styles.card, marginTop: 14 }}>
        {loading ? (
          <div style={styles.empty}>A carregar disciplinas...</div>
        ) : filtradas.length === 0 ? (
          <div style={styles.empty}>Nenhuma disciplina encontrada.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Disciplina</th>
                <th style={styles.th}>Professor</th>
                <th style={styles.th}>Turma</th>
                <th style={styles.th}>Aulas/Semana</th>
                <th style={{ ...styles.th, width: 160 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>
                    <strong>{item?.disciplina?.nome || "-"}</strong>
                  </td>

                  <td style={styles.td}>{item?.professor?.name || "-"}</td>

                  <td style={styles.td}>
                    <span style={styles.badge}>
                      {item?.turma?.nome || "-"}
                    </span>
                  </td>

                  <td style={styles.td}>{item?.aulas_semana || "-"}</td>

                  <td style={styles.td}>
                    <button
                      onClick={() => setModalDisciplina(item)}
                      style={styles.btnGhost}
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalDisciplina && (
        <div style={styles.backdrop} onClick={() => setModalDisciplina(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>Detalhes da disciplina</h3>
                <p style={styles.subtitle}>
                  Informação académica da disciplina selecionada.
                </p>
              </div>

              <button
                style={styles.btnGhost}
                onClick={() => setModalDisciplina(null)}
              >
                Fechar
              </button>
            </div>

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span>Disciplina</span>
                <strong>{modalDisciplina?.disciplina?.nome || "-"}</strong>
              </div>

              <div style={styles.detailItem}>
                <span>Professor</span>
                <strong>{modalDisciplina?.professor?.name || "-"}</strong>
              </div>

              <div style={styles.detailItem}>
                <span>Turma</span>
                <strong>{modalDisciplina?.turma?.nome || "-"}</strong>
              </div>

              <div style={styles.detailItem}>
                <span>Aulas por semana</span>
                <strong>{modalDisciplina?.aulas_semana || "-"}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
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

  subtitle: {
    margin: "6px 0 0",
    color: "rgba(11,27,42,.65)",
    fontWeight: 650,
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
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

  pill: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
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
    background: "rgba(0,0,0,.35)",
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
    padding: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  detailGrid: {
    display: "grid",
    gap: 12,
  },

  detailItem: {
    padding: 12,
    borderRadius: 14,
    background: "rgba(11,27,42,.03)",
    border: "1px solid rgba(11,27,42,.08)",
    display: "grid",
    gap: 4,
  },
};