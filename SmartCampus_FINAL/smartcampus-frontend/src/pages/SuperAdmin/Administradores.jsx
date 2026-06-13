import { useEffect, useState } from "react";
import { Mail, RefreshCw, User, School } from "lucide-react";
import http from "../../api/http";

export default function Administradores() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [avisoOpen, setAvisoOpen] = useState(false);
  const [avisoTexto, setAvisoTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function fetchAdmins() {
    try {
      const res = await http.get("/superadmin/administradores");
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMsg({ type: "error", text: "Erro ao carregar administradores." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAdmins(); }, []);

  async function reenviarCredenciais(id, nome) {
    try {
      await http.post(`/superadmin/administradores/${id}/reenviar`);
      setMsg({ type: "ok", text: `Credenciais reenviadas para ${nome}.` });
    } catch (err) {
      setMsg({ type: "error", text: "Erro ao reenviar credenciais." });
    }
  }

  async function enviarAviso() {
    if (!avisoTexto.trim()) return;
    setEnviando(true);
    try {
      await http.post("/superadmin/avisos", { mensagem: avisoTexto });
      setMsg({ type: "ok", text: "Aviso enviado a todos os administradores." });
      setAvisoOpen(false);
      setAvisoTexto("");
    } catch (err) {
      setMsg({ type: "error", text: "Erro ao enviar aviso." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>

      {/* Header */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>Administradores das Escolas</h2>
            <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.6)" }}>
              Lista de todos os administradores registados na plataforma.
            </p>
          </div>
          <button style={styles.btnAviso} onClick={() => setAvisoOpen(true)}>
            <Mail size={16} />
            Enviar aviso a todos
          </button>
        </div>
      </div>

      {/* Mensagem */}
      {msg.text && (
        <div style={{
          ...styles.card,
          borderLeft: msg.type === "error" ? "6px solid #ef4444" : "6px solid #16a34a",
        }}>
          <div style={{ fontWeight: 800 }}>{msg.text}</div>
        </div>
      )}

      {/* Tabela */}
      <div style={styles.card}>
        {loading ? (
          <p>A carregar...</p>
        ) : admins.length === 0 ? (
          <div style={styles.empty}>Nenhum administrador encontrado.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  <div style={styles.thInner}><User size={14} /> Nome</div>
                </th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>
                  <div style={styles.thInner}><School size={14} /> Escola</div>
                </th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 900 }}>{a.name}</div>
                  </td>
                  <td style={styles.td}>{a.email}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{a.escola?.nome || "-"}</span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.btnReenviar}
                      onClick={() => reenviarCredenciais(a.id, a.name)}
                    >
                      <RefreshCw size={13} />
                      Reenviar credenciais
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Aviso */}
      {avisoOpen && (
        <div style={styles.backdrop} onClick={() => setAvisoOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Enviar aviso a todos os admins</h3>
              <button style={styles.btnGhost} onClick={() => setAvisoOpen(false)}>Fechar</button>
            </div>

            <p style={{ color: "rgba(11,27,42,.6)", marginTop: 0 }}>
              Esta mensagem será enviada por email a todos os administradores das escolas registadas.
            </p>

            <div style={styles.label}>Mensagem *</div>
            <textarea
              value={avisoTexto}
              onChange={(e) => setAvisoTexto(e.target.value)}
              placeholder="Ex: O sistema estará em manutenção no dia 30 de Abril das 22h às 23h."
              style={{
                ...styles.input,
                height: 120,
                resize: "vertical",
              }}
            />

            <button
              style={{ ...styles.btnAviso, marginTop: 16, width: "100%", justifyContent: "center" }}
              onClick={enviarAviso}
              disabled={enviando || !avisoTexto.trim()}
            >
              <Mail size={16} />
              {enviando ? "A enviar..." : "Enviar aviso"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 20,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".3px",
    color: "rgba(11,27,42,.65)",
    borderBottom: "1px solid rgba(11,27,42,.10)",
    padding: "12px 10px",
  },
  thInner: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  td: {
    borderBottom: "1px solid rgba(11,27,42,.06)",
    padding: "12px 10px",
    color: "#0B1B2A",
    fontWeight: 650,
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 800,
    fontSize: 13,
  },
  btnReenviar: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(37,99,235,.25)",
    background: "rgba(37,99,235,.08)",
    color: "#1D4ED8",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 13,
  },
  btnAviso: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
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
  label: { fontWeight: 900, color: "rgba(11,27,42,.75)", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "inherit",
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
    background: "rgba(0,0,0,.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(560px, 100%)",
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
  },
};