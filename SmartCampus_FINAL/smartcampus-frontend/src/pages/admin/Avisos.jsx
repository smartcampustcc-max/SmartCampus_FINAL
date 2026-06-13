import { useEffect, useState } from "react";
import http from "../../api/http";

export default function Avisos() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [destino, setDestino] = useState("Todos");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => { fetchAvisos(); }, []);

  async function fetchAvisos() {
    try {
      const res = await http.get("/admin/avisos");
      setAvisos(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function publicar(e) {
    e.preventDefault();
    setErro("");
    setMsg({ type: "", text: "" });

    if (!titulo.trim()) { setErro("Título obrigatório."); return; }
    if (!mensagem.trim()) { setErro("Mensagem obrigatória."); return; }
    if (mensagem.trim().length < 5) { setErro("Mensagem demasiado curta."); return; }

    setEnviando(true);
    try {
      await http.post("/admin/avisos", { titulo, mensagem, destino });
      setMsg({ type: "ok", text: "Aviso publicado com sucesso." });
      setTitulo("");
      setMensagem("");
      setDestino("Todos");
      fetchAvisos();
    } catch (err) {
      setErro(err?.response?.data?.message || "Erro ao publicar aviso.");
    } finally {
      setEnviando(false);
    }
  }

  async function remover(id) {
    if (!window.confirm("Remover este aviso?")) return;
    try {
      await http.delete(`/admin/avisos/${id}`);
      setAvisos((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  function corDestino(destino) {
    if (destino === "Alunos") return { bg: "rgba(34,197,94,.10)", border: "rgba(34,197,94,.25)", color: "#166534" };
    if (destino === "Professores") return { bg: "rgba(37,99,235,.10)", border: "rgba(37,99,235,.25)", color: "#1D4ED8" };
    return { bg: "rgba(11,27,42,.04)", border: "rgba(11,27,42,.12)", color: "#0B1B2A" };
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "#0B1B2A" }}>Avisos</h2>
          <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
            Publica avisos para professores e alunos da escola.
          </p>
        </div>
        <div style={styles.pill}>{avisos.length} avisos</div>
      </div>

      {/* Formulário */}
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Novo aviso</h3>
        <form onSubmit={publicar} style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={styles.label}>Título *</div>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Alteração de horário"
              style={styles.input}
            />
          </div>

          <div>
            <div style={styles.label}>Destinatário *</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["Todos", "Alunos", "Professores"].map((d) => {
                const cor = corDestino(d);
                const sel = destino === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDestino(d)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 999,
                      border: sel ? `2px solid ${cor.border}` : "1px solid rgba(11,27,42,.12)",
                      background: sel ? cor.bg : "#fff",
                      color: sel ? cor.color : "#0B1B2A",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={styles.label}>Mensagem *</div>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={3}
              placeholder="Escreve o aviso..."
              style={{ ...styles.input, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {erro && <div style={styles.error}>{erro}</div>}
          {msg.text && <div style={styles.success}>{msg.text}</div>}

          <button type="submit" style={styles.btnPrimary} disabled={enviando}>
            {enviando ? "A publicar..." : "Publicar aviso"}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div style={{ ...styles.card, marginTop: 14 }}>
        {loading ? <p>A carregar...</p> : avisos.length === 0 ? (
          <div style={styles.empty}>Nenhum aviso publicado.</div>
        ) : (
          avisos.map((a) => {
            const cor = corDestino(a.destino);
            return (
              <div key={a.id} style={styles.notice}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 950, fontSize: 15 }}>{a.titulo}</div>
                  <div style={{ marginTop: 6, color: "rgba(11,27,42,.75)", lineHeight: 1.5 }}>
                    {a.mensagem}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: 999,
                      border: `1px solid ${cor.border}`,
                      background: cor.bg,
                      color: cor.color,
                      fontWeight: 800,
                      fontSize: 12,
                    }}>
                      {a.destino}
                    </span>
                    <span style={{ fontSize: 12, color: "rgba(11,27,42,.5)", fontWeight: 700 }}>
                      {new Date(a.created_at).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                </div>
                <button onClick={() => remover(a.id)} style={styles.btnDanger}>
                  Remover
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 },
  card: { background: "#fff", borderRadius: 18, padding: 16, border: "1px solid rgba(11,27,42,.10)", boxShadow: "0 10px 30px rgba(11,27,42,.08)" },
  label: { fontWeight: 900, color: "rgba(11,27,42,.75)", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(11,27,42,.12)", outline: "none", background: "#fff", boxSizing: "border-box" },
  pill: { padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(11,27,42,.12)", background: "rgba(11,27,42,.03)", fontWeight: 900, color: "#0B1B2A" },
  btnPrimary: { border: "none", padding: "10px 14px", borderRadius: 14, fontWeight: 950, color: "#fff", cursor: "pointer", background: "linear-gradient(135deg, #0A4174, #4E8EA2)", boxShadow: "0 10px 22px rgba(10,65,116,.22)" },
  btnDanger: { border: "1px solid rgba(239,68,68,.25)", padding: "8px 12px", borderRadius: 12, fontWeight: 900, cursor: "pointer", background: "rgba(239,68,68,.10)", color: "#B91C1C", height: "fit-content" },
  notice: { display: "flex", gap: 14, alignItems: "start", padding: 14, borderRadius: 16, border: "1px solid rgba(11,27,42,.10)", background: "rgba(11,27,42,.02)", marginBottom: 10 },
  error: { padding: 12, borderRadius: 14, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.10)", color: "#B91C1C", fontWeight: 850 },
  success: { padding: 12, borderRadius: 14, border: "1px solid rgba(34,197,94,.25)", background: "rgba(34,197,94,.10)", color: "#166534", fontWeight: 850 },
  empty: { padding: 14, borderRadius: 14, border: "1px dashed rgba(11,27,42,.18)", background: "rgba(11,27,42,.03)", color: "rgba(11,27,42,.7)", fontWeight: 750 },
};