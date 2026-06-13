import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  Power,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import http from "../../api/http";

export default function Cursos() {
  const [q, setQ] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  const [open, setOpen] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openDisciplinasModal, setOpenDisciplinasModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openDeleteErrorModal, setOpenDeleteErrorModal] = useState(false);

  const [successText, setSuccessText] = useState("");
  const [deleteErrorText, setDeleteErrorText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [cursoDelete, setCursoDelete] = useState(null);

  const [cursos, setCursos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);
  const [buscaDisciplina, setBuscaDisciplina] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    nome: "",
    duracao: "3 anos",
    nivel_classe: "10ª - 12ª",
    status: "Ativo",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCursos();
    fetchDisciplinas();
  }, []);

  async function fetchCursos() {
    setLoading(true);

    try {
      const res = await http.get("/admin/cursos");
      const raw = res.data;

      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.cursos)
        ? raw.cursos
        : [];

      const mapped = list.map((c) => ({
        id: c.id,
        nome: c.nome || "",
        codigo: c.codigo || "",
        descricao: c.descricao || "",
        duracao: c.duracao || "3 anos",
        nivel_classe: c.nivel_classe || "10ª - 12ª",
        status: c.status || "Ativo",
      }));

      setCursos(mapped);
    } catch (e) {
      setCursos([]);
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao carregar cursos.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchDisciplinas() {
    try {
      const res = await http.get("/admin/disciplinas");
      const raw = res.data;

      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.disciplinas)
        ? raw.disciplinas
        : [];

      setDisciplinas(list);
    } catch {
      setDisciplinas([]);
    }
  }

  async function fetchDisciplinasDoCurso(cursoId) {
    try {
      const res = await http.get(`/admin/cursos/${cursoId}/disciplinas`);
      const lista = Array.isArray(res.data) ? res.data : [];
      setDisciplinasSelecionadas(lista.map((d) => d.id));
    } catch {
      setDisciplinasSelecionadas([]);
    }
  }

  async function abrirDisciplinasCurso(curso) {
    setCursoSelecionado(curso);
    await fetchDisciplinasDoCurso(curso.id);
    setBuscaDisciplina("");
    setOpenDisciplinasModal(true);
  }

 function gerarCodigoCurso(nome) {
  const texto = String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

  if (texto.includes("ECONOMICAS") || texto.includes("JURIDICAS")) return "CEJ";
  if (texto.includes("FISICAS") || texto.includes("BIOLOGICAS")) return "CFB";

  return texto
    .replace(/[^A-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 6);
}

  function gerarDescricaoAutomatica(nome) {
    const n = String(nome || "").trim();
    return n ? `Curso ${n} do Colégio Henriques do Kinaxixi.` : "";
  }

  function resetForm() {
    setForm({
      nome: "",
      duracao: "3 anos",
      nivel_classe: "10ª - 12ª",
      status: "Ativo",
    });
    setErrors({});
    setEditingId(null);
    setDisciplinasSelecionadas([]);
    setBuscaDisciplina("");
  }

  function openNovoCurso() {
    resetForm();
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

  function openEditarCurso(curso) {
    setForm({
      nome: curso.nome || "",
      duracao: curso.duracao || "3 anos",
      nivel_classe: curso.nivel_classe || "10ª - 12ª",
      status: curso.status || "Ativo",
    });
    setErrors({});
    setEditingId(curso.id);
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

  function toggleDisciplina(id) {
    setDisciplinasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function validarFormulario() {
    const newErrors = {};
    const nome = form.nome.trim();
    const codigo = gerarCodigoCurso(form.nome);
    const duracao = form.duracao.trim();
    const nivelClasse = form.nivel_classe.trim();

    if (!nome) {
      newErrors.nome = "Nome obrigatório";
    } else if (!/^[A-Za-zÀ-ÿ0-9\s-]+$/.test(nome)) {
      newErrors.nome = "O nome do curso só pode conter letras, números, espaços e hífen.";
    } else if (nome.length < 3) {
      newErrors.nome = "Nome do curso demasiado curto.";
    } else if (/(.)\1{3,}/i.test(nome)) {
      newErrors.nome = "Nome inválido.";
    }

    if (!codigo) {
      newErrors.nome = "Nome inválido para gerar o código.";
    }

    if (!duracao) {
      newErrors.duracao = "Duração obrigatória";
    } else if (!["3 anos", "4 anos"].includes(duracao)) {
      newErrors.duracao = "Duração inválida.";
    }

    if (!nivelClasse) {
      newErrors.nivel_classe = "Nível / Classe obrigatório";
    }

    if (!["Ativo", "Inativo"].includes(form.status)) {
      newErrors.status = "Status inválido.";
    }

    const existeCodigo = cursos.some(
      (c) => String(c.codigo || "").toUpperCase() === codigo && c.id !== editingId
    );

    if (existeCodigo) {
      newErrors.nome = "Já existe um curso com este nome.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function salvarCurso() {
    setMsg({ type: "", text: "" });

    if (!validarFormulario()) return;

    const payload = {
      nome: form.nome.trim(),
      codigo: gerarCodigoCurso(form.nome),
      descricao: gerarDescricaoAutomatica(form.nome),
      duracao: form.duracao.trim(),
      nivel_classe: form.nivel_classe.trim(),
      status: form.status,
    };

    setLoading(true);

    try {
      let cursoCriado = null;

      if (editingId) {
        const res = await http.put(`/admin/cursos/${editingId}`, payload);
        cursoCriado = res?.data?.curso || { id: editingId, ...payload };
      } else {
        const res = await http.post("/admin/cursos", payload);
        cursoCriado = res?.data?.curso || null;
      }

      await fetchCursos();
      setOpen(false);

      if (cursoCriado?.id) {
        await abrirDisciplinasCurso(cursoCriado);
      } else {
        setSuccessText(editingId ? "Curso atualizado com sucesso." : "Curso criado com sucesso.");
        setOpenSuccessModal(true);
      }
    } catch (e) {
      const backendErrors = e?.response?.data?.errors;

      if (backendErrors) {
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });
        setErrors(newErrors);

        return;
      }

      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao guardar curso.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function guardarDisciplinasDoCurso() {
    if (!cursoSelecionado?.id) return;

    try {
      await http.post(`/admin/cursos/${cursoSelecionado.id}/disciplinas`, {
        disciplinas: disciplinasSelecionadas,
      });

      setOpenDisciplinasModal(false);
      setCursoSelecionado(null);
      setDisciplinasSelecionadas([]);
      resetForm();

      setSuccessText("Curso e disciplinas guardados com sucesso.");
      setOpenSuccessModal(true);

      await fetchCursos();
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao guardar disciplinas do curso.",
      });
    }
  }

  async function alternarStatus(id) {
    const curso = cursos.find((c) => c.id === id);
    if (!curso) return;

    const novoStatus = curso.status === "Ativo" ? "Inativo" : "Ativo";

    try {
      await http.put(`/admin/cursos/${id}`, {
        nome: curso.nome,
        codigo: curso.codigo,
        descricao: curso.descricao || gerarDescricaoAutomatica(curso.nome),
        duracao: curso.duracao,
        nivel_classe: curso.nivel_classe,
        status: novoStatus,
      });

      await fetchCursos();
      setSuccessText("Status do curso atualizado.");
      setOpenSuccessModal(true);
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao atualizar status.",
      });
    }
  }

  function apagarCurso(id) {
    const curso = cursos.find((c) => c.id === id);
    if (!curso) return;

    setCursoDelete(curso);
    setConfirmDelete(true);
  }

  async function confirmarApagar() {
    if (!cursoDelete) return;

    try {
      await http.delete(`/admin/cursos/${cursoDelete.id}`);
      await fetchCursos();

      setConfirmDelete(false);
      setCursoDelete(null);

      setSuccessText("Curso apagado com sucesso.");
      setOpenSuccessModal(true);
    } catch (e) {
      setConfirmDelete(false);
      setDeleteErrorText(
        e?.response?.data?.message || "Não foi possível apagar este curso."
      );
      setOpenDeleteErrorModal(true);
    }
  }

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();

    return cursos.filter((c) => {
      const okStatus = statusFiltro === "Todos" ? true : c.status === statusFiltro;
      const okQ =
        !s ||
        (c.nome || "").toLowerCase().includes(s) ||
        (c.codigo || "").toLowerCase().includes(s) ||
        (c.duracao || "").toLowerCase().includes(s) ||
        (c.nivel_classe || "").toLowerCase().includes(s);

      return okStatus && okQ;
    });
  }, [cursos, q, statusFiltro]);

  const disciplinasFiltradas = useMemo(() => {
    const s = buscaDisciplina.trim().toLowerCase();

    return disciplinas.filter((d) => {
      return (
        !s ||
        (d.nome || "").toLowerCase().includes(s) ||
        (d.codigo || "").toLowerCase().includes(s)
      );
    });
  }, [disciplinas, buscaDisciplina]);

  function abreviarCurso(nome, codigo) {
  const texto = String(nome || codigo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

  if (texto.includes("ECONOMICAS") || texto.includes("JURIDICAS")) return "CEJ";
  if (texto.includes("FISICAS") || texto.includes("BIOLOGICAS")) return "CFB";

  return String(codigo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .slice(0, 6);
}

  return (
    <div>
      {msg.text && (
        <div
          style={{
            ...styles.alertCard,
            borderLeft:
              msg.type === "error" ? "6px solid #ef4444" : "6px solid #16a34a",
          }}
        >
          <div style={{ fontWeight: 800 }}>{msg.text}</div>
        </div>
      )}

      {openDisciplinasModal && (
        <div style={styles.modalBackdrop} onClick={() => setOpenDisciplinasModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: "#0B1B2A" }}>Disciplinas do curso</h3>
                <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
                  Curso: {cursoSelecionado?.nome}
                </p>
              </div>

              <button style={styles.btnGhost} onClick={() => setOpenDisciplinasModal(false)}>
                Fechar
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={styles.label}>Pesquisar disciplina</div>
              <div style={styles.searchInputWrap}>
                <Search size={16} color="rgba(11,27,42,.45)" />
                <input
                  style={styles.searchInput}
                  value={buscaDisciplina}
                  onChange={(e) => setBuscaDisciplina(e.target.value)}
                  placeholder="nome ou código da disciplina..."
                />
              </div>
            </div>

            <div style={styles.checkboxPanel}>
              {disciplinasFiltradas.length === 0 ? (
                <div style={{ color: "rgba(11,27,42,.6)", fontWeight: 650 }}>
                  Nenhuma disciplina encontrada.
                </div>
              ) : (
                disciplinasFiltradas.map((d) => (
                  <label key={d.id} style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={disciplinasSelecionadas.includes(d.id)}
                      onChange={() => toggleDisciplina(d.id)}
                    />
                    <span>
                      {d.nome} ({d.codigo}) - carga: {d.carga_horaria}
                    </span>
                  </label>
                ))
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button style={styles.btnGhost} onClick={() => setOpenDisciplinasModal(false)}>
                Cancelar
              </button>

              <button style={styles.btnPrimary} onClick={guardarDisciplinasDoCurso}>
                Guardar disciplinas
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={styles.modalBackdrop} onClick={() => setConfirmDelete(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.deleteIconWrap}>
              <AlertTriangle size={34} />
            </div>

            <h3 style={{ margin: "0 0 10px", color: "#0B1B2A", fontSize: 18 }}>
              Apagar curso
            </h3>

            <p style={{ color: "rgba(11,27,42,.75)", fontWeight: 650, lineHeight: 1.5 }}>
              Tens certeza que queres apagar o curso
              <br />
              <strong>{cursoDelete?.nome}</strong>?
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
              <button
                style={styles.btnSecondaryLarge}
                onClick={() => {
                  setConfirmDelete(false);
                  setCursoDelete(null);
                }}
              >
                Cancelar
              </button>

              <button style={styles.btnDangerLarge} onClick={confirmarApagar}>
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}

      {openDeleteErrorModal && (
        <div style={styles.modalBackdrop} onClick={() => setOpenDeleteErrorModal(false)}>
          <div style={styles.successModal} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                ...styles.successIcon,
                background: "rgba(239,68,68,.12)",
                color: "#DC2626",
                border: "1px solid rgba(239,68,68,.20)",
              }}
            >
              !
            </div>

            <h3 style={{ margin: "0 0 8px", color: "#B91C1C" }}>Não foi possível apagar</h3>

            <p style={{ margin: 0, color: "rgba(11,27,42,.7)", fontWeight: 650 }}>
              {deleteErrorText}
            </p>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button style={styles.btnPrimary} onClick={() => setOpenDeleteErrorModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {openSuccessModal && (
        <div style={styles.modalBackdrop} onClick={() => setOpenSuccessModal(false)}>
          <div style={styles.successModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successIcon}>
              <CheckCircle2 size={34} />
            </div>
            <h3 style={{ margin: "0 0 8px", color: "#166534" }}>{successText}</h3>
            <p style={{ margin: 0, color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
              A operação foi concluída com sucesso.
            </p>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button style={styles.btnPrimary} onClick={() => setOpenSuccessModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.mainCard}>
        <div style={styles.mainCardTop}>
          <div>
            <h3 style={{ margin: 0, color: "#0B1B2A", fontSize: 30, fontWeight: 950 }}>
              Lista de cursos
            </h3>
            <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.62)", fontWeight: 650 }}>
              Cursos disponíveis no sistema.
            </p>
          </div>

          <div style={styles.topActions}>
            <div style={styles.pill}>{filtrados.length} cursos</div>
            <button onClick={openNovoCurso} style={styles.btnPrimary}>
              <Plus size={16} />
              <span>Novo curso</span>
            </button>
          </div>
        </div>

        <div style={styles.filters}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={styles.label}>Pesquisar</div>
            <div style={styles.searchInputWrap}>
              <Search size={16} color="rgba(11,27,42,.45)" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="nome, código, duração..."
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={{ width: 220, minWidth: 220 }}>
            <div style={styles.label}>Status</div>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={styles.input}
            >
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14, overflowX: "auto" }}>
          <table style={{ ...styles.table, minWidth: 950 }}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Código</th>
                <th style={styles.th}>Duração</th>
                <th style={styles.th}>Nível / Classe</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, width: 360 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((c) => (
                <tr key={c.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 950 }}>{c.nome}</div>
                  </td>

                  <td style={styles.td}>
                  <span style={styles.badge}>{abreviarCurso(c.nome, c.codigo)}</span>
                  </td>

                  <td style={styles.td}>{c.duracao}</td>
                  <td style={styles.td}>{c.nivel_classe}</td>

                  <td style={styles.td}>
                    <span style={c.status === "Ativo" ? styles.badgeOk : styles.badgeWarn}>
                      {c.status}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actionRow}>
                      <button onClick={() => openEditarCurso(c)} style={styles.actionEdit}>
                        <Pencil size={14} />
                        <span>Editar</span>
                      </button>

                      <button onClick={() => abrirDisciplinasCurso(c)} style={styles.actionGhost}>
                        <BookOpen size={14} />
                        <span>Disciplinas</span>
                      </button>

                      <button onClick={() => alternarStatus(c.id)} style={styles.actionGhost}>
                        <Power size={14} />
                        <span>{c.status === "Ativo" ? "Desativar" : "Ativar"}</span>
                      </button>

                      <button onClick={() => apagarCurso(c.id)} style={styles.actionDelete}>
                        <Trash2 size={14} />
                        <span>Apagar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 16 }}>
                    <div style={styles.empty}>
                      {loading ? "A carregar..." : "Nenhum curso encontrado."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div style={styles.modalBackdrop} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: "#0B1B2A" }}>
                {editingId ? "Editar curso" : "Novo curso"}
              </h3>

              <button style={styles.btnGhost} onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <div>
                <div style={styles.label}>Nome</div>
                <input
                  style={{
                    ...styles.input,
                    border: errors.nome ? "1px solid #ef4444" : "1px solid rgba(11,27,42,.12)",
                  }}
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Ciências Económicas e Jurídicas"
                />
                {errors.nome && <div style={styles.fieldError}>{errors.nome}</div>}
              </div>

              <div>
                <div style={styles.label}>Código</div>
                <input
                  style={{
                    ...styles.input,
                    background: "rgba(11,27,42,.04)",
                    color: "rgba(11,27,42,.65)",
                  }}
                  value={gerarCodigoCurso(form.nome)}
                  readOnly
                  placeholder="Código gerado automaticamente"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr  1fr", gap: 12 }}>
                

                <div>
                  <div style={styles.label}>Nível / Classe</div>
                  <input
                    style={{
                      ...styles.input,
                      background: "rgba(11,27,42,.04)",
                      color: "rgba(11,27,42,.65)",
                    }}
                    value={form.nivel_classe}
                    readOnly
                  />
                  {errors.nivel_classe && <div style={styles.fieldError}>{errors.nivel_classe}</div>}
                </div>

                
              </div>

              <button style={styles.btnPrimary} onClick={salvarCurso} disabled={loading}>
                {loading ? "A guardar..." : "Guardar e escolher disciplinas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  alertCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
    marginBottom: 14,
  },
  mainCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
  },
  mainCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 16,
  },
  topActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  filters: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "end",
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
  searchInputWrap: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "#fff",
    boxSizing: "border-box",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#0B1B2A",
  },
  pill: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
  },
  codigoBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(37,99,235,.20)",
    background: "rgba(37,99,235,.08)",
    color: "#1D4ED8",
    fontWeight: 950,
    whiteSpace: "nowrap",
  },
  badgeOk: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,.25)",
    background: "rgba(34,197,94,.10)",
    color: "#166534",
    fontWeight: 900,
  },
  badgeWarn: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(245,158,11,.30)",
    background: "rgba(245,158,11,.12)",
    color: "#7C4A03",
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
  btnPrimary: {
    border: "1px solid rgba(37,99,235,.25)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(37,99,235,.12)",
    color: "#1D4ED8",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  btnSecondaryLarge: {
    minWidth: 150,
    border: "1px solid rgba(11,27,42,.10)",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "#F3F4F6",
    color: "#0B1B2A",
  },
  btnDangerLarge: {
    minWidth: 150,
    border: "1px solid rgba(239,68,68,.25)",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "#EF4444",
    color: "#fff",
  },
  actionRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  actionEdit: {
    border: "none",
    background: "transparent",
    color: "#2563EB",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
  },
  actionGhost: {
    border: "none",
    background: "transparent",
    color: "#0B1B2A",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
  },
  actionDelete: {
    border: "none",
    background: "transparent",
    color: "#EF4444",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
  },
  checkboxPanel: {
    marginTop: 16,
    border: "1px solid rgba(11,27,42,.12)",
    borderRadius: 12,
    padding: 12,
    maxHeight: 260,
    overflowY: "auto",
    display: "grid",
    gap: 10,
    background: "#fff",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
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
    whiteSpace: "nowrap",
  },
  td: {
    borderBottom: "1px solid rgba(11,27,42,.06)",
    padding: "16px 10px",
    color: "#0B1B2A",
    fontWeight: 650,
    verticalAlign: "top",
    whiteSpace: "nowrap",
  },
  empty: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, .30)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(840px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    padding: 16,
    maxHeight: "92vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  fieldError: {
    marginTop: 6,
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: 800,
  },
  successModal: {
    width: "min(420px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(34,197,94,.20)",
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    padding: 24,
    textAlign: "center",
  },
  confirmModal: {
    width: "min(500px, 100%)",
    background: "#fff",
    borderRadius: 24,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 30px 70px rgba(0,0,0,.25)",
    padding: 28,
    textAlign: "center",
  },
  deleteIconWrap: {
    width: 74,
    height: 74,
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(239,68,68,.10)",
    color: "#EF4444",
    border: "1px solid rgba(239,68,68,.20)",
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,.12)",
    color: "#16A34A",
    border: "1px solid rgba(34,197,94,.20)",
  },
};