import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, MessageCircle } from "lucide-react";
import http from "../../api/http";
import { getUser } from "../../api/auth";

export default function MensagensAluno() {
  const user = getUser();
  const [searchParams] = useSearchParams();
const materialIdUrl = searchParams.get("material_id");
  const [disciplinas, setDisciplinas] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [materialRelacionado, setMaterialRelacionado] = useState(null);
  const [sending, setSending] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  useEffect(() => {
    if (selecionada) {
      carregarMensagens(selecionada);
    }
  }, [selecionada]);

  async function carregarDisciplinas() {
    try {
      setErro("");

      const res = await http.get("/estudante/disciplinas");
      const lista = Array.isArray(res.data) ? res.data : [];
      if (materialIdUrl) {
  try {
    const resMaterial = await http.get(`/estudante/materiais`);

    const material = resMaterial.data.find(
      (m) => String(m.id) === String(materialIdUrl)
    );

    setMaterialRelacionado(material || null);
  } catch {
    setMaterialRelacionado(null);
  }
}

      setDisciplinas(lista);

      const turmaIdUrl = searchParams.get("turma_id");
      const disciplinaIdUrl = searchParams.get("disciplina_id");

      const porUrl = lista.find(
        (item) =>
          String(item.turma?.id) === String(turmaIdUrl) &&
          String(item.disciplina?.id) === String(disciplinaIdUrl)
      );

      setSelecionada(porUrl || lista[0] || null);
    } catch (e) {
      setErro("Erro ao carregar disciplinas.");
      setDisciplinas([]);
    }
  }

  async function carregarMensagens(item) {
    if (!item?.turma?.id || !item?.disciplina?.id) return;

    try {
      setLoading(true);
      setErro("");

      const res = await http.get("/estudante/chat/mensagens", {
        params: {
          turma_id: item.turma.id,
          disciplina_id: item.disciplina.id,
        },
      });

      setMensagens(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErro("Erro ao carregar mensagens.");
      setMensagens([]);
    } finally {
      setLoading(false);
    }
  }

  async function enviarMensagem(e) {
    e.preventDefault();

    if (!texto.trim()) return;

    if (!selecionada?.turma?.id || !selecionada?.disciplina?.id) {
      setErro("Seleciona uma disciplina antes de enviar.");
      return;
    }

    try {
      setSending(true);
      setErro("");

  const res = await http.post("/estudante/chat/mensagens", {
  turma_id: selecionada.turma.id,
  disciplina_id: selecionada.disciplina.id,
  material_id: materialRelacionado?.id || null,
  mensagem: texto.trim(),
});

setMensagens((prev) => [...prev, res.data.mensagem]);
setTexto("");
setMaterialRelacionado(null);
    } catch (e) {
      setErro(e?.response?.data?.message || "Erro ao enviar mensagem.");
    } finally {
      setSending(false);
    }
  }

  const tituloChat = useMemo(() => {
    if (!selecionada) return "Seleciona uma disciplina";

    return `${selecionada.disciplina?.nome || "Disciplina"} • ${
      selecionada.professor?.name || "Professor"
    }`;
  }, [selecionada]);

  return (
    <div>
      <div style={styles.header}>
       
      </div>

      {erro && <div style={styles.error}>{erro}</div>}

      <div style={styles.layout}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>Disciplinas</div>

          {disciplinas.length === 0 ? (
            <div style={styles.empty}>Nenhuma disciplina encontrada.</div>
          ) : (
            disciplinas.map((item) => {
              const ativo =
                selecionada?.disciplina?.id === item.disciplina?.id &&
                selecionada?.turma?.id === item.turma?.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelecionada(item)}
                  style={{
                    ...styles.contact,
                    ...(ativo ? styles.contactActive : {}),
                  }}
                >
                  <div
  style={{
    fontWeight: 900,
    fontSize: 15,
  }}
>
  {item.disciplina?.nome}
</div>

<div
  style={{
    fontSize: 12,
    color: "rgba(11,27,42,.60)",
    fontWeight: 700,
  }}
>
  {item.professor?.name}
</div>
                </button>
              );
            })
          )}
        </div>

        <div style={styles.chat}>
          <div style={styles.chatHeader}>
            <div>
              <strong>{tituloChat}</strong>
              <div style={styles.chatSub}>
                {selecionada?.turma?.nome || "Turma"} 
              </div>
   
            </div>
          </div>

          <div style={styles.chatBody}>
            {loading ? (
              <div style={styles.empty}>A carregar mensagens...</div>
            ) : mensagens.length === 0 ? (
              <div style={styles.empty}>
                Ainda não há mensagens nesta disciplina.
              </div>
            ) : (
              mensagens.map((m) => {
                const minha = Number(m.remetente_id) === Number(user?.id);

                return (
                  <div
                    key={m.id}
                    style={{
                      ...styles.msg,
                      alignSelf: minha ? "flex-end" : "flex-start",
                      background: minha
                        ? "linear-gradient(135deg, #0A4174, #4E8EA2)"
                        : "#F1F5F9",
                      color: minha ? "#fff" : "#0B1B2A",
                    }}
                  >
                    <div style={styles.msgAuthor}>
                      {minha ? "Tu" : m.remetente?.name || "Utilizador"}
                    </div>
{m.material && (
  <div style={styles.materialAnexo}>
    <div style={styles.materialPreview}>
      <div style={styles.materialIcon}>
        {m.material.tipo === "PDF" ? "PDF" : "DOC"}
      </div>

      <div>
        <div style={styles.materialAnexoTitulo}>
          {m.material.titulo}
        </div>
        <div style={styles.materialAnexoMeta}>
          {m.material.tipo || "Material"} • {m.material.disciplina?.nome || ""}
        </div>
      </div>
    </div>
  </div>
)}
                    <div>{m.mensagem}</div>

                    <div style={styles.time}>
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString("pt-PT")
                        : ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>

         <form onSubmit={enviarMensagem} style={styles.chatForm}>
{materialRelacionado && (
  <div style={styles.anexoInput}>
    <div style={styles.anexoIcon}>
      {materialRelacionado.tipo === "PDF" ? "PDF" : "MAT"}
    </div>

    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={styles.anexoTitulo}>
        {materialRelacionado.titulo}
      </div>

      <div style={styles.anexoMeta}>
        {materialRelacionado.tipo} • {materialRelacionado.disciplina?.nome}
      </div>
    </div>

    <button
      type="button"
      style={styles.anexoRemove}
      onClick={() => setMaterialRelacionado(null)}
      title="Remover anexo"
    >
      ×
    </button>
  </div>
)}

 <div style={styles.inputRow}>
  <input
    value={texto}
    onChange={(e) => setTexto(e.target.value)}
    placeholder="Escreve a tua mensagem..."
    style={styles.input}
  />

  <button
    type="submit"
    style={styles.btnPrimary}
    disabled={sending || !selecionada}
  >
    <Send size={16} />
    {sending ? "A enviar..." : "Enviar"}
  </button>
</div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: 14,
  },
  title: {
    margin: 0,
    color: "#0B1B2A",
    fontWeight: 950,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "rgba(11,27,42,.65)",
    fontWeight: 650,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 12,
  },
  sidebar: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 12,
    display: "flex",
    flexDirection:"columm",
    gap: 6,
    height: 500,
    overflowY: "auto",
  },
 sidebar: {
  background: "#FFFFFF",
  border: "1px solid rgba(11,27,42,.10)",
  borderRadius: 18,
  boxShadow: "0 10px 30px rgba(11,27,42,.08)",
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  height: 500,
  overflowY: "auto",
  overflowX: "hidden",
},
  contact: {
  border: "1px solid rgba(11,27,42,.08)",
  background: "#fff",
  padding: "10px 12px",
  borderRadius: 12,
  cursor: "pointer",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 2,
  color: "#0B1B2A",
  minHeight: 58,
},
  contactActive: {
    background: "rgba(10,65,116,.08)",
    border: "1px solid rgba(10,65,116,.18)",
    boxShadow:"none",
  },
  chat: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    display: "flex",
    flexDirection: "column",
    height: 500,
  },
  chatHeader: {
    padding: 14,
    borderBottom: "1px solid rgba(11,27,42,.10)",
    color: "#0B1B2A",
  },
  chatSub: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(11,27,42,.6)",
    fontWeight: 700,
  },
  chatBody: {
    flex: 1,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },
  msg: {
    maxWidth: "72%",
    padding: "10px 14px",
    borderRadius: 16,
    fontWeight: 700,
  },
  msgAuthor: {
    fontSize: 11,
    opacity: 0.75,
    fontWeight: 900,
    marginBottom: 4,
  },
  time: {
    fontSize: 10,
    marginTop: 5,
    opacity: 0.7,
    textAlign: "right",
  },
chatForm: {
  display: "grid",
  gap: 8,
  padding: 12,
  borderTop: "1px solid rgba(11,27,42,.10)",
},
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    outline: "none",
  },
  anexoRemove: {
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "1px solid rgba(11,27,42,.12)",
  background: "#fff",
  color: "#0B1B2A",
  cursor: "pointer",
  fontWeight: 950,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
},
  btnPrimary: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 950,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  empty: {
    padding: 12,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.68)",
    fontWeight: 750,
  },
  disciplinaNome: {
  fontWeight: 900,
  fontSize: 14,
  color: "#0B1B2A",
},

professorNome: {
  fontSize: 12,
  color: "rgba(11,27,42,.58)",
  fontWeight: 700,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
},
  error: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(239,68,68,.10)",
    border: "1px solid rgba(239,68,68,.25)",
    color: "#B91C1C",
    fontWeight: 850,
  },
  materialBox: {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: "rgba(10,65,116,.06)",
  border: "1px solid rgba(10,65,116,.12)",
},

materialTag: {
  fontSize: 11,
  fontWeight: 900,
  color: "#0A4174",
  textTransform: "uppercase",
},

materialTitulo: {
  marginTop: 4,
  fontWeight: 900,
  color: "#0B1B2A",
},

materialDisciplina: {
  marginTop: 2,
  fontSize: 12,
  color: "rgba(11,27,42,.60)",
  fontWeight: 700,
},
materialAnexo: {
  marginBottom: 8,
  padding: 10,
  borderRadius: 12,
  background: "rgba(255,255,255,.22)",
  border: "1px solid rgba(255,255,255,.25)",
},

materialPreview: {
  display: "flex",
  alignItems: "center",
  gap: 10,
},

materialIcon: {
  width: 42,
  height: 42,
  borderRadius: 10,
  background: "#DC2626",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontSize: 11,
  fontWeight: 950,
},

materialAnexoTitulo: {
  fontWeight: 950,
  fontSize: 13,
},

materialAnexoMeta: {
  marginTop: 2,
  fontSize: 11,
  opacity: 0.75,
  fontWeight: 700,
},
inputRow: {
  display: "flex",
  gap: 8,
},

anexoInput: {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 10,
  borderRadius: 12,
  background: "rgba(10,65,116,.06)",
  border: "1px solid rgba(10,65,116,.14)",
},

anexoIcon: {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "#DC2626",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontSize: 10,
  fontWeight: 950,
  flexShrink: 0,
},

anexoTitulo: {
  fontWeight: 900,
  color: "#0B1B2A",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
},

anexoMeta: {
  marginTop: 2,
  fontSize: 11,
  color: "rgba(11,27,42,.60)",
  fontWeight: 700,
},
};