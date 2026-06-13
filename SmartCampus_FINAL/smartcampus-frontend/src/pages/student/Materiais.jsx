import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";

export default function MateriaisAluno() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [modalMaterial, setModalMaterial] = useState(null);
  const [loadingAbrir, setLoadingAbrir] = useState(false);
 

  useEffect(() => {
    async function fetchMateriais() {
      try {
        const res = await http.get("/estudante/materiais");
        setMateriais(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMateriais();
  }, []);

  const filtrados = materiais.filter((m) =>
    m.titulo.toLowerCase().includes(q.toLowerCase()) ||
    (m.disciplina?.nome || "").toLowerCase().includes(q.toLowerCase())
  );

  async function abrirMaterial(m) {
    setLoadingAbrir(true);
    try {
      const res = await http.post(`/estudante/materiais/${m.id}/abrir`);
      setMateriais((prev) =>
        prev.map((item) => item.id === m.id ? { ...item, visto: true } : item)
      );
      setModalMaterial({ ...m, url_aberta: res.data?.url });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAbrir(false);
    }
  }

  function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }

  function renderConteudo(m) {
    if (!m?.url_aberta) return null;

    if (m.tipo === "YouTube") {
      const ytId = getYouTubeId(m.url_aberta || m.url);
      if (ytId) return (
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={m.titulo}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12, border: "none" }}
            allowFullScreen
          />
        </div>
      );
    }

    if (m.tipo === "Imagem") return (
      <img src={m.url_aberta} alt={m.titulo}
        style={{ width: "100%", borderRadius: 12, objectFit: "contain", maxHeight: 480 }} />
    );

    if (m.tipo === "PDF") return (
      <iframe src={m.url_aberta} title={m.titulo}
        style={{ width: "100%", height: 500, borderRadius: 12, border: "none" }} />
    );

    if (m.tipo === "Video") return (
      <video controls style={{ width: "100%", borderRadius: 12 }}>
        <source src={m.url_aberta} />
      </video>
    );

    return (
      <div style={{ textAlign: "center", padding: 24 }}>
        <p style={{ color: "rgba(11,27,42,.65)", marginBottom: 16 }}>
          Este ficheiro será aberto numa nova aba.
        </p>
        <a href={m.url_aberta} target="_blank" rel="noreferrer" style={styles.btnPrimary}>
          Abrir {m.tipo}
        </a>
      </div>
    );
  }
function getTurmaId(m) {
  return m.turma_id || m.sala_de_aula_id || m.turma?.id || m.disciplina?.turma_id;
}

function abrirChatMaterial(m) {
  const turmaId = getTurmaId(m);

  if (!turmaId || !m.disciplina_id) {
    alert("Não foi possível abrir o chat deste material.");
    return;
  }

  navigate(
    `/aluno/mensagens?turma_id=${turmaId}&disciplina_id=${m.disciplina_id}&material_id=${m.id}`
  );
}


  return (
    <div>
     

      <div style={styles.card}>
        <input style={styles.input} value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar por título ou disciplina..." />
      </div>

      <div style={{ ...styles.card, marginTop: 14 }}>
        {loading ? <p>A carregar...</p> : filtrados.length === 0 ? (
          <div style={styles.empty}>Nenhum material disponível.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Título</th>
                <th style={styles.th}>Disciplina</th>
                <th style={styles.th}>Professor</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m) => (
                <tr key={m.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 900 }}>{m.titulo}</div>
                    {m.descricao && <div style={{ fontSize: 12, color: "rgba(11,27,42,.6)" }}>{m.descricao}</div>}
                  </td>
                  <td style={styles.td}>{m.disciplina?.nome || "-"}</td>
                  <td style={styles.td}>{m.professor?.name || "-"}</td>
                  <td style={styles.td}><span style={styles.badge}>{m.tipo}</span></td>
                  <td style={styles.td}>
                    {m.visto
                      ? <span style={styles.badgeVisto}>✓ Visto</span>
                      : <span style={styles.badgeNovo}>Novo</span>}
                  </td>
                  <td style={styles.td}>
                   <div style={styles.actions}>
  <button onClick={() => abrirMaterial(m)} style={styles.btnPrimary} disabled={loadingAbrir}>
    Abrir
  </button>

  <button onClick={() => abrirChatMaterial(m)} style={styles.btnGhost}>
    Tirar dúvida
  </button>
</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalMaterial && (
        <div style={styles.backdrop} onClick={() => setModalMaterial(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>{modalMaterial.titulo}</h3>
                {modalMaterial.descricao && (
                  <p style={{ margin: "4px 0 0", color: "rgba(11,27,42,.6)", fontSize: 13 }}>
                    {modalMaterial.descricao}
                  </p>
                )}
              </div>
              <button style={styles.btnGhost} onClick={() => setModalMaterial(null)}>Fechar</button>
            </div>
            {renderConteudo(modalMaterial)}
          </div>
        </div>
      )}

    
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 },
  card: { background: "#fff", borderRadius: 18, padding: 16, border: "1px solid rgba(11,27,42,.10)", boxShadow: "0 10px 30px rgba(11,27,42,.08)" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(11,27,42,.12)", outline: "none", background: "#fff", boxSizing: "border-box" },
  pill: { padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(11,27,42,.12)", background: "rgba(11,27,42,.03)", fontWeight: 900, color: "#0B1B2A" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 12, textTransform: "uppercase", color: "rgba(11,27,42,.65)", borderBottom: "1px solid rgba(11,27,42,.10)", padding: "12px 10px" },
  td: { borderBottom: "1px solid rgba(11,27,42,.06)", padding: "12px 10px", color: "#0B1B2A", fontWeight: 650, verticalAlign: "top" },
  badge: { display: "inline-block", padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(11,27,42,.12)", background: "rgba(11,27,42,.03)", fontWeight: 900, fontSize: 12 },
  badgeVisto: { display: "inline-block", padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(34,197,94,.3)", background: "rgba(34,197,94,.1)", fontWeight: 900, fontSize: 12, color: "#166534" },
  badgeNovo: { display: "inline-block", padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(59,130,246,.3)", background: "rgba(59,130,246,.1)", fontWeight: 900, fontSize: 12, color: "#1d4ed8" },
  btnPrimary: { border: "none", padding: "8px 12px", borderRadius: 12, fontWeight: 900, cursor: "pointer", background: "linear-gradient(135deg, #0A4174, #4E8EA2)", color: "#fff", textDecoration: "none", display: "inline-block" },
  btnGhost: { border: "1px solid rgba(11,27,42,.14)", padding: "8px 12px", borderRadius: 12, fontWeight: 900, cursor: "pointer", background: "#fff", color: "#0B1B2A" },
  empty: { padding: 14, borderRadius: 14, border: "1px dashed rgba(11,27,42,.18)", background: "rgba(11,27,42,.03)", color: "rgba(11,27,42,.7)", fontWeight: 750 },
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 9999 },
  modal: { width: "min(780px, 100%)", background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 20px 60px rgba(0,0,0,.25)", maxHeight: "90vh", overflowY: "auto" },
  actions: {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
},

chatBox: {
  display: "grid",
  gap: 10,
  maxHeight: 360,
  overflowY: "auto",
  padding: 10,
  borderRadius: 14,
  border: "1px solid rgba(11,27,42,.10)",
  background: "rgba(11,27,42,.03)",
},

messageItem: {
  padding: 12,
  borderRadius: 14,
  background: "#fff",
  border: "1px solid rgba(11,27,42,.08)",
  fontWeight: 650,
},

chatInputRow: {
  display: "flex",
  gap: 10,
  marginTop: 12,
},

};