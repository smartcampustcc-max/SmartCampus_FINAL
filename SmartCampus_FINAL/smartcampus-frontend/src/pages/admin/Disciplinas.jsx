import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import http from "../../api/http";

export default function Disciplinas() {
  const [q, setQ] = useState("");
  const [cursoFiltro, setCursoFiltro] = useState("Todos");
  const [classeFiltro, setClasseFiltro] = useState("Todas");

  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disciplinaToDelete, setDisciplinaToDelete] = useState(null);

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [successText, setSuccessText] = useState("");

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    nome: "",
    codigo: "",
    carga_horaria: 1,
    codigoAuto: true,
  });

  const nomesSugeridos = [
    "Língua Portuguesa",
    "Inglês",
    "Matemática",
    "Educação Física",
    "Empreendedorismo",
    "Geografia",
    "Economia",
    "Direito",
    "História",
    "D.E.S",
    "Filosofia",
    "Sociologia",
    "Física",
    "Química",
    "Geologia",
    "Biologia",
    "Geometria Descritiva",
    "Psicologia",
  ];

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  useEffect(() => {
    if (!form.codigoAuto) return;

    setForm((p) => ({
      ...p,
      codigo: gerarCodigoDisciplina(p.nome),
    }));
  }, [form.nome, form.codigoAuto]);

  async function fetchDisciplinas() {
    setLoading(true);

    try {
      const res = await http.get("/admin/disciplinas");
      const raw = res.data;

      const list =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.disciplinas) ? raw.disciplinas :
        [];

      const mapped = list.map((d) => ({
        id: d.id,
        nome: d.nome || "",
        codigo: d.codigo || "",
        carga_horaria: d.carga_horaria || 1,
        status: d.status || "Ativa",

      }));

      setDisciplinas(mapped);
    } catch (e) {
      setDisciplinas([]);
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao carregar disciplinas.",
      });
    } finally {
      setLoading(false);
    }
  }

  function normalizarTexto(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();
  }

  function capitalizarDisciplina(valor) {
    const minusculas = ["de", "da", "do", "das", "dos", "e"];

    const texto = String(valor || "")
      .replace(/\s+/g, " ")
      .trim();

    const especiais = {
      "d.e.s": "D.E.S",
      "des": "D.E.S",
      "ed fisica": "Educação Física",
      "educacao fisica": "Educação Física",
      "educação fisica": "Educação Física",
      "educação física": "Educação Física",
      "lingua portuguesa": "Língua Portuguesa",
      "língua portuguesa": "Língua Portuguesa",
      "geometria descritiva": "Geometria Descritiva",
    };

    const chave = texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (especiais[chave]) return especiais[chave];

    return texto
      .toLowerCase()
      .split(" ")
      .map((p, index) => {
        if (index !== 0 && minusculas.includes(p)) return p;
        return p.charAt(0).toUpperCase() + p.slice(1);
      })
      .join(" ");
  }

  function gerarCodigoDisciplina(nome) {
    const texto = normalizarTexto(nome);

    if (!texto) return "";

    const mapa = {
      "LINGUA PORTUGUESA": "LP",
      PORTUGUES: "LP",
      INGLES: "ING",
      MATEMATICA: "MAT",
      "EDUCACAO FISICA": "EDF",
      EMPREENDEDORISMO: "EMP",
      GEOGRAFIA: "GEO",
      ECONOMIA: "ECO",
      DIREITO: "DIR",
      HISTORIA: "HIST",
      "D.E.S": "DES",
      DES: "DES",
      FILOSOFIA: "FIL",
      SOCIOLOGIA: "SOC",
      FISICA: "FIS",
      QUIMICA: "QUI",
      GEOLOGIA: "GEOLOG",
      BIOLOGIA: "BIO",
      "GEOMETRIA DESCRITIVA": "GD",
      PSICOLOGIA: "PSI",
    };

    if (mapa[texto]) return mapa[texto];

    return texto
      .replace(/[^A-Z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean)
      .map((p) => p.slice(0, 3))
      .join("")
      .slice(0, 10);
  }

  function resetForm() {
    setForm({
      nome: "",
      codigo: "",
      curso: "Geral",
      classe: "Todas",
      carga_horaria: 1,
      status: "Ativa",
      codigoAuto: true,
    });

    setErrors({});
    setEditingId(null);
  }

  function openNovaDisciplina() {
    resetForm();
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

  function openEditarDisciplina(disciplina) {
    setForm({
      nome: disciplina.nome || "",
      codigo: disciplina.codigo || "",
      carga_horaria: disciplina.carga_horaria || 1,
      codigoAuto: false,
    });

    setErrors({});
    setEditingId(disciplina.id);
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

  function validarFormulario() {
    const newErrors = {};

    const nome = form.nome.trim();
    const codigo = form.codigo.trim().toUpperCase();
    const carga = Number(form.carga_horaria);

    if (!nome) {
      newErrors.nome = "Nome obrigatório.";
    } else if (!/^[A-Za-zÀ-ÿ\s.]+$/.test(nome)) {
      newErrors.nome = "O nome deve conter apenas letras, espaços e ponto.";
    } else if (nome.length < 2) {
      newErrors.nome = "Nome demasiado curto.";
    } else if (/(.)\1{3,}/i.test(nome)) {
      newErrors.nome = "Nome inválido.";
    }

    if (!codigo) {
      newErrors.codigo = "Código obrigatório.";
    } else if (!/^[A-Z0-9]{2,10}$/.test(codigo)) {
      newErrors.codigo = "Use 2 a 10 caracteres, apenas letras maiúsculas e números.";
    }

    if (!String(form.carga_horaria).trim()) {
      newErrors.carga_horaria = "Carga horária obrigatória.";
    } else if (!/^\d+$/.test(String(form.carga_horaria))) {
      newErrors.carga_horaria = "Carga horária deve ser numérica.";
    } else if (carga < 1 || carga > 3) {
      newErrors.carga_horaria = "A carga horária deve estar entre 1 e 3.";
    }

    if (!["Ativa", "Inativa"].includes(form.status)) {
      newErrors.status = "Status inválido.";
    }

    const disciplinaRepetida = disciplinas.some((d) => {
      return (
        d.id !== editingId &&
        normalizarTexto(d.nome) === normalizarTexto(nome) 
      );
    });

    if (disciplinaRepetida) {
      newErrors.nome = "Esta disciplina já existe.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function salvarDisciplina() {
    setMsg({ type: "", text: "" });

    if (!validarFormulario()) return;

    const payload = {
      nome: capitalizarDisciplina(form.nome),
      codigo: form.codigo.trim().toUpperCase(),
      carga_horaria: Number(form.carga_horaria),
      status: "Ativa",
    };

    setLoading(true);

    try {
      if (editingId) {
        await http.put(`/admin/disciplinas/${editingId}`, payload);
        setSuccessText("Disciplina atualizada com sucesso.");
      } else {
        await http.post("/admin/disciplinas", payload);
        setSuccessText("Disciplina criada com sucesso.");
      }

      await fetchDisciplinas();
      setOpen(false);
      resetForm();
      setOpenSuccessModal(true);
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

      setErrorText(e?.response?.data?.message || "Erro ao guardar disciplina.");
      setOpenErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  function apagarDisciplina(id) {
    const disciplina = disciplinas.find((d) => d.id === id);
    if (!disciplina) return;

    setDisciplinaToDelete(disciplina);
    setConfirmOpen(true);
  }

  async function confirmarApagarDisciplina() {
    if (!disciplinaToDelete) return;

    try {
      await http.delete(`/admin/disciplinas/${disciplinaToDelete.id}`);
      await fetchDisciplinas();

      setConfirmOpen(false);
      setDisciplinaToDelete(null);

      setSuccessText("Disciplina apagada com sucesso.");
      setOpenSuccessModal(true);
    } catch (e) {
      setConfirmOpen(false);
      setErrorText(e?.response?.data?.message || "Não foi possível apagar esta disciplina.");
      setOpenErrorModal(true);
    }
  }

  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();

    return disciplinas.filter((d) => {
      return(
        !s ||
        String(d.nome || "").toLowerCase().includes(s) ||
        String(d.codigo || "").toLowerCase().includes(s)
    );
    });
  }, [disciplinas, q]);

  return (
    <div>
      {openSuccessModal && (
        <div style={styles.modalBackdrop} onClick={() => setOpenSuccessModal(false)}>
          <div style={styles.successModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successIcon}>
              <CheckCircle2 size={34} />
            </div>

            <h3 style={{ margin: "0 0 8px", color: "#166534" }}>
              {successText}
            </h3>

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

      {openErrorModal && (
        <div style={styles.modalBackdrop} onClick={() => setOpenErrorModal(false)}>
          <div style={styles.errorModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.errorIcon}>
              <XCircle size={34} />
            </div>

            <h3 style={{ margin: "0 0 8px", color: "#B91C1C" }}>Erro</h3>

            <p style={{ margin: 0, color: "rgba(11,27,42,.75)", fontWeight: 650 }}>
              {errorText}
            </p>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button style={styles.btnDanger} onClick={() => setOpenErrorModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div style={styles.modalBackdrop} onClick={() => setConfirmOpen(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.deleteIconWrap}>
              <AlertTriangle size={34} />
            </div>

            <h3 style={{ margin: "0 0 10px", color: "#0B1B2A", fontSize: 18 }}>
              Apagar disciplina
            </h3>

            <p style={{ color: "rgba(11,27,42,.75)", fontWeight: 650, lineHeight: 1.5 }}>
              Tens certeza que queres apagar a disciplina
              <br />
              <strong>{disciplinaToDelete?.nome}</strong>?
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 18 }}>
              <button
                style={styles.btnSecondaryLarge}
                onClick={() => {
                  setConfirmOpen(false);
                  setDisciplinaToDelete(null);
                }}
              >
                Cancelar
              </button>

              <button style={styles.btnDangerLarge} onClick={confirmarApagarDisciplina}>
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}

      {msg.text && (
        <div
          style={{
            ...styles.alertCard,
            borderLeft:
              msg.type === "ok" ? "6px solid #16a34a" : "6px solid #ef4444",
          }}
        >
          <b style={{ display: "block", marginBottom: 6 }}>
            {msg.type === "ok" ? "✅" : "❌"} Mensagem
          </b>
          <div>{msg.text}</div>
        </div>
      )}

      <div style={styles.mainCard}>
        <div style={styles.mainCardTop}>
          <div>
            <h3 style={{ margin: 0, color: "#0B1B2A", fontSize: 20, fontWeight: 950 }}>
              Gestão das disciplinas gerais e específicas por curso.
            </h3>
          </div>

          <div style={styles.topActions}>
            <div style={styles.pill}>{filtradas.length} disciplinas</div>

            <button onClick={openNovaDisciplina} style={styles.btnPrimary}>
              <Plus size={16} />
              <span>Nova disciplina</span>
            </button>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span>Total</span>
            <strong>{disciplinas.length}</strong>
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
                placeholder="nome ou  código"
                style={styles.searchInput}
              />
            </div>
          </div>

        
        </div>

        <div style={{ marginTop: 14, overflowX: "auto" }}>
          <table style={{ ...styles.table, minWidth: 980 }}>
            <thead>
              <tr>
                <th style={styles.th}>Disciplina</th>
                <th style={styles.th}>Código</th>
                <th style={styles.th}>Tempos</th>
                <th style={{ ...styles.th, width: 220 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map((d) => (
                <tr key={d.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 950 }}>{d.nome}</div>
                    <div style={{ fontSize: 12, color: "rgba(11,27,42,.6)", fontWeight: 650 }}>
                      ID: {d.id}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.badge}>{d.codigo || "—"}</span>
                  </td>

                  <td style={styles.td}>{d.carga_horaria} tempos</td>

                  <td style={styles.td}>
                    {d.status === "Ativa" ? (
                      <span style={styles.badgeOk}>Ativa</span>
                    ) : (
                      <span style={styles.badgeWarn}>Inativa</span>
                    )}
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actionRow}>
                      <button onClick={() => openEditarDisciplina(d)} style={styles.actionEdit}>
                        <Pencil size={14} />
                        <span>Editar</span>
                      </button>

                      <button onClick={() => apagarDisciplina(d.id)} style={styles.actionDelete}>
                        <Trash2 size={14} />
                        <span>Apagar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 16 }}>
                    <div style={styles.empty}>
                      {loading ? "A carregar..." : "Nenhuma disciplina encontrada."}
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
                {editingId ? "Editar disciplina" : "Nova disciplina"}
              </h3>

              <button style={styles.btnGhost} onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <div>
                <div style={styles.label}>Nome da disciplina</div>

                <input
                  list="disciplinas-sugeridas"
                  style={{
                    ...styles.input,
                    border: errors.nome ? "1px solid #ef4444" : "1px solid rgba(11,27,42,.12)",
                  }}
                  value={form.nome}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      nome: e.target.value,
                      codigoAuto: true,
                    }))
                  }
                  onBlur={(e) =>
                    setForm((p) => ({
                      ...p,
                      nome: capitalizarDisciplina(e.target.value),
                    }))
                  }
                  placeholder="Ex: Matemática"
                />

                <datalist id="disciplinas-sugeridas">
                  {nomesSugeridos.map((nome) => (
                    <option key={nome} value={nome} />
                  ))}
                </datalist>

                {errors.nome && <div style={styles.fieldError}>{errors.nome}</div>}
              </div>

              <div style={styles.formGrid}>
                <div>
                  <div style={styles.label}>Código</div>

                  <input
                    style={{
                      ...styles.input,
                      border: errors.codigo ? "1px solid #ef4444" : "1px solid rgba(11,27,42,.12)",
                    }}
                    value={form.codigo}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        codigo: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
                        codigoAuto: false,
                      }))
                    }
                    placeholder="Ex: MAT"
                  />

                  {errors.codigo && <div style={styles.fieldError}>{errors.codigo}</div>}
                </div>

                <div>
                  <div style={styles.label}>Carga horária semanal</div>

                  <input
                    type="number"
                    min="1"
                    max="12"
                    style={{
                      ...styles.input,
                      border:
                        errors.carga_horaria
                          ? "1px solid #ef4444"
                          : "1px solid rgba(11,27,42,.12)",
                    }}
                    value={form.carga_horaria}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        carga_horaria: e.target.value.replace(/\D/g, "").slice(0, 2),
                      }))
                    }
                    placeholder="Ex: 3"
                  />

                  {errors.carga_horaria && (
                    <div style={styles.fieldError}>{errors.carga_horaria}</div>
                  )}
                </div>
              </div>

              <div style={styles.formGrid}>
      

              
              </div>

            

              

              <button style={styles.btnPrimary} onClick={salvarDisciplina} disabled={loading}>
                {loading ? "A guardar..." : editingId ? "Guardar alterações" : "Criar disciplina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
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
    flexWrap: "wrap",
    alignItems: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(130px, 1fr))",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 14,
    background: "rgba(11,27,42,.03)",
    padding: 12,
    display: "grid",
    gap: 4,
  },
  alertCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
    marginBottom: 14,
  },
  filters: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "end",
    marginBottom: 12,
  },
  label: {
    fontWeight: 900,
    color: "rgba(11,27,42,.75)",
    marginBottom: 6,
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
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  pill: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  badgeGeral: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(37,99,235,.22)",
    background: "rgba(37,99,235,.08)",
    color: "#1D4ED8",
    fontWeight: 900,
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
    whiteSpace: "nowrap",
  },
  badgeWarn: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(245,158,11,.30)",
    background: "rgba(245,158,11,.12)",
    color: "#7C4A03",
    fontWeight: 900,
    whiteSpace: "nowrap",
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
  btnDanger: {
    border: "1px solid rgba(239,68,68,.25)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
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
  },
  empty: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
  },
  infoBox: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(37,99,235,.18)",
    background: "rgba(37,99,235,.06)",
    color: "rgba(11,27,42,.75)",
    fontWeight: 700,
    lineHeight: 1.5,
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
    width: "min(760px, 100%)",
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
  errorModal: {
    width: "min(420px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(239,68,68,.20)",
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
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(239,68,68,.12)",
    color: "#DC2626",
    border: "1px solid rgba(239,68,68,.20)",
  },
};