import { useEffect, useState } from "react";
import http from "../../api/http";

export default function Chats() {
  const [conversas, setConversas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [loadingMensagens, setLoadingMensagens] = useState(false);

  async function carregarConversas() {
    try {
      const res = await http.get("/admin/chats");
      console.log(res.data)
      setConversas(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarConversas();
  }, []);

  async function abrirChat(conversa) {
    setModalOpen(true);
    setLoadingMensagens(true);

    try {
      const res = await http.get(
        `/admin/chats/${conversa.turma_id}/${conversa.disciplina_id}`
      );

      setMensagens(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMensagens(false);
    }
  }

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleString("pt-PT");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={styles.header}>
        

        
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.empty}>A carregar conversas...</div>
        ) : conversas.length === 0 ? (
          <div style={styles.empty}>
            Nenhuma conversa encontrada.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Turma</th>
                  <th style={styles.th}>Disciplina</th>
                  <th style={styles.th}>Professor</th>
                  <th style={styles.th}>Mensagens</th>
                  <th style={styles.th}>Última atividade</th>
                  <th style={styles.th}>Ação</th>
                </tr>
              </thead>

              <tbody>
                {conversas.map((c, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{c.turma}</td>

                    <td style={styles.td}>
                      <strong>{c.disciplina}</strong>
                    </td>

                    <td style={styles.td}>{c.professor}</td>

                    <td style={styles.td}>
                      <span style={styles.badge}>
                        {c.total_mensagens}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {formatarData(c.ultima_mensagem)}
                    </td>

                    <td style={styles.td}>
                      <button
                        style={styles.btn}
                        onClick={() => abrirChat(c)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          style={styles.backdrop}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>
                  Conversa supervisionada
                </h3>

                <p style={styles.subtitle}>
                  Histórico de mensagens.
                </p>
              </div>

              <button
                style={styles.btnGhost}
                onClick={() => setModalOpen(false)}
              >
                Fechar
              </button>
            </div>

            <div style={styles.chatArea}>
              {loadingMensagens ? (
                <div style={styles.empty}>
                  A carregar mensagens...
                </div>
              ) : mensagens.length === 0 ? (
                <div style={styles.empty}>
                  Nenhuma mensagem encontrada.
                </div>
              ) : (
                mensagens.map((m) => (
                  <div key={m.id} style={styles.msg}>
                    <div style={styles.msgTop}>
                      <strong>{m.utilizador}</strong>

                      <span style={styles.role}>
                        {m.role}
                      </span>
                    </div>

                    <div style={styles.msgText}>
                      {m.mensagem}
                    </div>

                    <div style={styles.msgDate}>
                      {formatarData(m.created_at)}
                    </div>
                  </div>
                ))
              )}
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
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "rgba(11,27,42,.65)",
    fontWeight: 650,
  },

  pill: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(11,27,42,.04)",
    border: "1px solid rgba(11,27,42,.10)",
    fontWeight: 900,
  },

  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 780,
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid rgba(11,27,42,.10)",
    fontSize: 12,
    textTransform: "uppercase",
    color: "rgba(11,27,42,.65)",
  },

  td: {
    padding: "12px 10px",
    borderBottom: "1px solid rgba(11,27,42,.06)",
    fontWeight: 650,
    color: "#0B1B2A",
  },

  badge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(59,130,246,.10)",
    color: "#1D4ED8",
    fontWeight: 900,
  },

  btn: {
    border: "none",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    color: "#fff",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
  },

  btnGhost: {
    border: "1px solid rgba(11,27,42,.12)",
    background: "#fff",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  empty: {
    padding: 14,
    borderRadius: 14,
    background: "rgba(11,27,42,.03)",
    border: "1px dashed rgba(11,27,42,.16)",
    fontWeight: 700,
    color: "rgba(11,27,42,.65)",
  },

  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.40)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },

  modal: {
    width: "min(900px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 20,
    padding: 20,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  chatArea: {
    display: "grid",
    gap: 12,
  },

  msg: {
    padding: 14,
    borderRadius: 16,
    background: "rgba(11,27,42,.03)",
    border: "1px solid rgba(11,27,42,.06)",
  },

  msgTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },

  role: {
    fontSize: 12,
    fontWeight: 900,
    color: "#1D4ED8",
    textTransform: "uppercase",
  },

  msgText: {
    marginTop: 10,
    color: "#0B1B2A",
    lineHeight: 1.5,
    fontWeight: 650,
  },

  msgDate: {
    marginTop: 10,
    fontSize: 12,
    color: "rgba(11,27,42,.55)",
    fontWeight: 700,
  },
};