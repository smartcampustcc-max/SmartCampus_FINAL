import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import http from "../../api/http";

const TIPOS = ["PDF", "Documento", "Imagem", "Video", "YouTube", "Link"];

export default function MateriaisProfessor() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [materiais, setMateriais] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  const [msg, setMsg] = useState({
    type: "",
    text: "",
  });

  const [visoesModal, setVisoesModal] = useState(null);
  const [loadingVisoes, setLoadingVisoes] = useState(false);

  const [ficheiro, setFicheiro] = useState(null);

  const [form, setForm] = useState({
    turma_id: "",
    disciplina_id: "",
    titulo: "",
    tipo: "PDF",
    url: "",
    descricao: "",
  });

  useEffect(() => {
    fetchTudo();
  }, []);

 
  useEffect(() => {
    if (searchParams.get("novo") === "1") {
      setOpen(true);

     
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  async function fetchTudo() {
    try {
      const [matRes, atrRes] = await Promise.all([
        http.get("/professor/materiais"),
        http.get("/professor/minhas-atribuicoes"),
      ]);

      setMateriais(matRes.data);
      setAtribuicoes(atrRes.data?.atribuicoes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const turmasUnicas = [
    ...new Map(
      atribuicoes.map((a) => [a.turma_id, a.turma])
    ).values(),
  ].filter(Boolean);

  const disciplinasDaTurma = atribuicoes
    .filter((a) => String(a.turma_id) === String(form.turma_id))
    .map((a) => a.disciplina)
    .filter(Boolean);

  const usaFicheiro = [
    "PDF",
    "Documento",
    "Imagem",
    "Video",
  ].includes(form.tipo);

  const usaUrl = ["Link", "YouTube"].includes(form.tipo);

  async function salvar() {
    setMsg({
      type: "",
      text: "",
    });

    if (
      !form.turma_id ||
      !form.disciplina_id ||
      !form.titulo ||
      !form.tipo
    ) {
      setMsg({
        type: "error",
        text: "Preenche todos os campos obrigatórios.",
      });

      return;
    }

    if (usaUrl && !form.url) {
      setMsg({
        type: "error",
        text: "Insere o URL.",
      });

      return;
    }

    if (usaFicheiro && !ficheiro) {
      setMsg({
        type: "error",
        text: "Seleciona um ficheiro.",
      });

      return;
    }

    try {
      const payload = new FormData();

      payload.append("turma_id", form.turma_id);
      payload.append("disciplina_id", form.disciplina_id);
      payload.append("titulo", form.titulo);
      payload.append("tipo", form.tipo);
      payload.append("descricao", form.descricao || "");

      if (usaUrl) {
        payload.append("url", form.url);
      }

      if (usaFicheiro && ficheiro) {
        payload.append("ficheiro", ficheiro);
      }

      await http.post("/professor/materiais", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMsg({
        type: "ok",
        text: "Material adicionado com sucesso.",
      });

      setOpen(false);

      setForm({
        turma_id: "",
        disciplina_id: "",
        titulo: "",
        tipo: "PDF",
        url: "",
        descricao: "",
      });

      setFicheiro(null);

      fetchTudo();
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Erro ao guardar.",
      });
    }
  }

  async function verVisualizacoes(m) {
    setLoadingVisoes(true);

    setVisoesModal({
      material: m,
      data: null,
    });

    try {
      const res = await http.get(
        `/professor/materiais/${m.id}/visualizacoes`
      );

      setVisoesModal({
        material: m,
        data: res.data,
      });
    } catch (err) {
      setVisoesModal({
        material: m,
        data: {
          erro: "Erro ao carregar.",
        },
      });
    } finally {
      setLoadingVisoes(false);
    }
  }

  async function remover(id) {
    if (!window.confirm("Tens a certeza?")) return;

    try {
      await http.delete(`/professor/materiais/${id}`);

      fetchTudo();
    } catch (err) {
      console.error(err);
    }
  }

  function urlMaterial(m) {
    if (m.ficheiro_path) {
      return `${
        process.env.REACT_APP_STORAGE_URL ||
        "http://127.0.0.1:8000/storage"
      }/${m.ficheiro_path}`;
    }

    return m.url;
  }

  return (
    <div>
      <div style={styles.card}>
        {loading ? (
          <p>A carregar...</p>
        ) : materiais.length === 0 ? (
          <div style={styles.empty}>
            Ainda não adicionaste materiais.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Título</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Turma</th>
                <th style={styles.th}>Disciplina</th>
                <th style={styles.th}>Visualizações</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {materiais.map((m) => (
                <tr key={m.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 900 }}>
                      {m.titulo}
                    </div>

                    {m.descricao && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(11,27,42,.6)",
                          marginTop: 4,
                        }}
                      >
                        {m.descricao}
                      </div>
                    )}
                  </td>

                  <td style={styles.td}>
                    <span style={styles.badge}>
                      {m.tipo}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {m.turma?.nome || "-"}
                  </td>

                  <td style={styles.td}>
                    {m.disciplina?.nome || "-"}
                  </td>

                  <td style={styles.td}>
                    <button
                      onClick={() =>
                        verVisualizacoes(m)
                      }
                      style={styles.btnVisoes}
                    >
                      Ver detalhes
                    </button>
                  </td>

                  <td style={styles.td}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <a
                        href={urlMaterial(m)}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.btnGhost}
                      >
                        Abrir
                      </a>

                      <button
                        onClick={() =>
                          remover(m.id)
                        }
                        style={styles.btnDanger}
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL NOVO MATERIAL */}

      {open && (
        <div
          style={styles.backdrop}
          onClick={() => setOpen(false)}
        >
          <div
            style={styles.modal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>
                Novo material
              </h3>

              <button
                style={styles.btnGhost}
                onClick={() =>
                  setOpen(false)
                }
              >
                Fechar
              </button>
            </div>

            <div style={styles.formGrid}>
              <div>
                <div style={styles.label}>
                  Turma *
                </div>

                <select
                  style={styles.input}
                  value={form.turma_id}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      turma_id: e.target.value,
                      disciplina_id: "",
                    }))
                  }
                >
                  <option value="">
                    Seleciona a turma
                  </option>

                  {turmasUnicas.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                    >
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={styles.label}>
                  Disciplina *
                </div>

                <select
                  style={styles.input}
                  value={form.disciplina_id}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      disciplina_id:
                        e.target.value,
                    }))
                  }
                >
                  <option value="">
                    Seleciona a disciplina
                  </option>

                  {disciplinasDaTurma.map((d) => (
                    <option
                      key={d.id}
                      value={d.id}
                    >
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={styles.label}>
                  Título *
                </div>

                <input
                  style={styles.input}
                  value={form.titulo}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      titulo:
                        e.target.value,
                    }))
                  }
                  placeholder="Ex: Álgebra Linear"
                />
              </div>

              <div>
                <div style={styles.label}>
                  Tipo *
                </div>

                <select
                  style={styles.input}
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      tipo: e.target.value,
                      url: "",
                    }))
                  }
                >
                  {TIPOS.map((t) => (
                    <option
                      key={t}
                      value={t}
                    >
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {usaUrl && (
                <div>
                  <div style={styles.label}>
                    URL *
                  </div>

                  <input
                    style={styles.input}
                    value={form.url}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        url: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
              )}

              {usaFicheiro && (
                <div>
                  <div style={styles.label}>
                    Ficheiro *
                  </div>

                  <input
                    type="file"
                    style={styles.input}
                    onChange={(e) =>
                      setFicheiro(
                        e.target.files[0] ||
                          null
                      )
                    }
                  />

                  {ficheiro && (
                    <div
                      style={{
                        fontSize: 12,
                        marginTop: 4,
                        color: "#166534",
                      }}
                    >
                      ✓ {ficheiro.name}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div style={styles.label}>
                  Descrição
                </div>

                <textarea
                  style={{
                    ...styles.input,
                    minHeight: 90,
                    resize: "vertical",
                  }}
                  value={form.descricao}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      descricao:
                        e.target.value,
                    }))
                  }
                  placeholder="Descrição do material..."
                />
              </div>

              {msg.text && (
                <div
                  style={{
                    color:
                      msg.type === "error"
                        ? "#B91C1C"
                        : "#166534",
                    fontWeight: 800,
                  }}
                >
                  {msg.text}
                </div>
              )}

              <button
                style={styles.btnPrimary}
                onClick={salvar}
              >
                Guardar material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISUALIZAÇÕES */}

      {visoesModal && (
        <div
          style={styles.backdrop}
          onClick={() =>
            setVisoesModal(null)
          }
        >
          <div
            style={styles.modal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>
                Visualizações •{" "}
                {
                  visoesModal.material
                    .titulo
                }
              </h3>

              <button
                style={styles.btnGhost}
                onClick={() =>
                  setVisoesModal(null)
                }
              >
                Fechar
              </button>
            </div>

            {loadingVisoes ? (
              <p>A carregar...</p>
            ) : visoesModal.data?.erro ? (
              <p style={{ color: "#B91C1C" }}>
                {visoesModal.data.erro}
              </p>
            ) : (
              <>
                <div style={styles.stats}>
                  <div style={styles.statBox}>
                    <div style={styles.statNum}>
                      {visoesModal.data
                        ?.total_visualizacoes ??
                        0}
                    </div>

                    <div style={styles.statLabel}>
                     Visualizaram
                    </div>
                  </div>

                  <div style={styles.statBox}>
                    <div style={styles.statNum}>
                      {(visoesModal.data
                        ?.total_alunos ??
                        0) -
                        (visoesModal.data
                          ?.total_visualizacoes ??
                          0)}
                    </div>

                    <div style={styles.statLabel}>
                      Não visualizaram
                    </div>
                  </div>

                  <div style={styles.statBox}>
                    <div style={styles.statNum}>
                      {visoesModal.data
                        ?.total_alunos ??
                        0}
                    </div>

                    <div style={styles.statLabel}>
                      Total alunos
                    </div>
                  </div>
                </div>

                {visoesModal.data
                  ?.visualizacoes
                  ?.length === 0 ? (
                  <div style={styles.empty}>
                    Nenhum aluno abriu
                    ainda.
                  </div>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>
                          Aluno
                        </th>

                        <th style={styles.th}>
                          Data
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {visoesModal.data?.visualizacoes?.map(
                        (v, i) => (
                          <tr key={i}>
                            <td style={styles.td}>
                              {v.aluno}
                            </td>

                            <td style={styles.td}>
                              {v.opened_at
                                ? new Date(
                                    v.opened_at
                                  ).toLocaleString(
                                    "pt-PT"
                                  )
                                : "-"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 18,
    border:
      "1px solid rgba(11,27,42,.08)",
    boxShadow:
      "0 10px 30px rgba(11,27,42,.06)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    fontSize: 12,
    textTransform: "uppercase",
    color: "rgba(11,27,42,.55)",
    padding: "12px 10px",
    borderBottom:
      "1px solid rgba(11,27,42,.08)",
  },

  td: {
    padding: "14px 10px",
    borderBottom:
      "1px solid rgba(11,27,42,.05)",
    color: "#0B1B2A",
    fontWeight: 650,
    verticalAlign: "top",
  },

  badge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 999,
    background:
      "rgba(10,65,116,.06)",
    border:
      "1px solid rgba(10,65,116,.10)",
    color: "#0A4174",
    fontWeight: 900,
    fontSize: 12,
  },

  btnGhost: {
    border:
      "1px solid rgba(11,27,42,.12)",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "#fff",
    color: "#0B1B2A",
    textDecoration: "none",
  },

  btnDanger: {
    border:
      "1px solid rgba(239,68,68,.18)",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background:
      "rgba(239,68,68,.08)",
    color: "#B91C1C",
  },

  btnVisoes: {
    border:
      "1px solid rgba(10,65,116,.18)",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background:
      "rgba(10,65,116,.05)",
    color: "#0A4174",
  },

  btnPrimary: {
    border: "none",
    padding: "12px 16px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
    background:
      "linear-gradient(135deg, #0A4174, #4E8EA2)",
    color: "#fff",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border:
      "1px solid rgba(11,27,42,.10)",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },

  label: {
    fontWeight: 900,
    marginBottom: 6,
    color: "#0B1B2A",
  },

  empty: {
    padding: 18,
    borderRadius: 16,
    background:
      "rgba(11,27,42,.03)",
    border:
      "1px dashed rgba(11,27,42,.12)",
    color: "rgba(11,27,42,.6)",
    fontWeight: 700,
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
    width: "min(650px, 100%)",
    background: "#fff",
    borderRadius: 22,
    padding: 22,
    boxShadow:
      "0 25px 60px rgba(0,0,0,.20)",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  formGrid: {
    display: "grid",
    gap: 14,
  },

  stats: {
    display: "flex",
    gap: 14,
    marginBottom: 18,
  },

  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    background:
      "rgba(11,27,42,.03)",
    border:
      "1px solid rgba(11,27,42,.08)",
    textAlign: "center",
  },

  statNum: {
    fontSize: 28,
    fontWeight: 950,
    color: "#0A4174",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(11,27,42,.6)",
    fontWeight: 700,
  },
};