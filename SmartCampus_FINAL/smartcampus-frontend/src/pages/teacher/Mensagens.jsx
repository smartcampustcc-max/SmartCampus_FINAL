import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import http from "../../api/http";
import { getUser } from "../../api/auth";

export default function MensagensProfessor() {
  const user = getUser();

  const [conversas, setConversas] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarConversas();
  }, []);

  useEffect(() => {
    if (selecionada) {
      carregarMensagens(selecionada);
    }
  }, [selecionada]);

  async function carregarConversas() {
    try {
      setErro("");

      const res = await http.get("/professor/minhas-atribuicoes");
      const lista = Array.isArray(res.data?.atribuicoes)
        ? res.data.atribuicoes
        : [];

      setConversas(lista);
      setSelecionada(lista[0] || null);
    } catch (e) {
      setErro("Erro ao carregar turmas e disciplinas.");
      setConversas([]);
    }
  }

  async function carregarMensagens(item) {
    if (!item?.turma_id || !item?.disciplina_id) return;

    try {
      setLoading(true);
      setErro("");

      const res = await http.get("/professor/chat/mensagens", {
        params: {
          turma_id: item.turma_id,
          disciplina_id: item.disciplina_id,
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

    if (!selecionada?.turma_id || !selecionada?.disciplina_id) {
      setErro("Seleciona uma turma/disciplina antes de enviar.");
      return;
    }

    try {
      setSending(true);
      setErro("");

      const res = await http.post("/professor/chat/mensagens", {
        turma_id: selecionada.turma_id,
        disciplina_id: selecionada.disciplina_id,
        mensagem: texto.trim(),
      });

      setMensagens((prev) => [...prev, res.data.mensagem]);
      setTexto("");
    } catch (e) {
      setErro(e?.response?.data?.message || "Erro ao enviar mensagem.");
    } finally {
      setSending(false);
    }
  }

  const tituloChat = useMemo(() => {
    if (!selecionada) return "Seleciona uma conversa";

    return `${selecionada.disciplina?.nome || "Disciplina"} • ${
      selecionada.turma?.nome || "Turma"
    }`;
  }, [selecionada]);

  return (
    <div>
      {erro && <div style={styles.error}>{erro}</div>}

      <div style={styles.layout}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>Turmas e disciplinas</div>

          {conversas.length === 0 ? (
            <div style={styles.empty}>Nenhuma conversa encontrada.</div>
          ) : (
            conversas.map((item) => {
              const ativo =
                selecionada?.disciplina_id === item.disciplina_id &&
                selecionada?.turma_id === item.turma_id;

              return (
                <button
                  key={`${item.turma_id}-${item.disciplina_id}`}
                  type="button"
                  onClick={() => setSelecionada(item)}
                  style={{
                    ...styles.contact,
                    ...(ativo ? styles.contactActive : {}),
                  }}
                >
                  <div style={styles.disciplinaNome}>
                    {item.disciplina?.nome || "Disciplina"}
                  </div>

                  <div style={styles.professorNome}>
                    {item.turma?.nome || "Turma"}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div style={styles.chat}>
          <div style={styles.chatHeader}>
            <strong>{tituloChat}</strong>

            <div style={styles.chatSub}>
              Professor: {user?.name || "Professor"}
            </div>
          </div>

          <div style={styles.chatBody}>
            {loading ? (
              <div style={styles.empty}>A carregar mensagens...</div>
            ) : mensagens.length === 0 ? (
              <div style={styles.empty}>
                Ainda não há mensagens nesta turma/disciplina.
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
                      {minha ? "Tu" : m.remetente?.name || "Aluno"}
                    </div>

                    {m.material && (
                      <div style={styles.materialAnexo}>
                        <div style={styles.materialPreview}>
                          <div style={styles.materialIcon}>
                            {m.material.tipo === "PDF" ? "PDF" : "MAT"}
                          </div>

                          <div>
                            <div style={styles.materialAnexoTitulo}>
                              {m.material.titulo}
                            </div>

                            <div style={styles.materialAnexoMeta}>
                              {m.material.tipo || "Material"} •{" "}
                              {m.material.disciplina?.nome || ""}
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
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escreve uma resposta..."
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
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: 12,
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

  sidebarTitle: {
    fontWeight: 950,
    color: "#0B1B2A",
    marginBottom: 4,
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
    display: "flex",
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

  error: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(239,68,68,.10)",
    border: "1px solid rgba(239,68,68,.25)",
    color: "#B91C1C",
    fontWeight: 850,
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
};