import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function Escolas() {
  const [q, setQ] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  const [open, setOpen] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [successText, setSuccessText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [escolaDelete, setEscolaDelete] = useState(null);

  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    localizacao: "",
    admin_nome: "",
    admin_email: "",
    status: "Ativo",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEscolas();
  }, []);

  async function fetchEscolas() {
    setLoading(true);
    try {
      const res = await http.get("/superadmin/escolas");

      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.escolas)
        ? raw.escolas
        : [];

      setEscolas(list);
    } catch (e) {
      setEscolas([]);
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao carregar escolas.",
      });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      nome: "",
      email: "",
      telefone: "",
      localizacao: "",
      admin_nome: "",
      admin_email: "",
      status: "Ativo",
    });
    setErrors({});
    setEditingId(null);
  }

  function openNovaEscola() {
    resetForm();
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

  function openEditarEscola(escola) {
    setForm({
      nome: escola.nome || "",
      email: escola.email || "",
      telefone: escola.telefone || "",
      localizacao: escola.localizacao || "",
      admin_nome: escola.admin_nome || "",
      admin_email: escola.admin_email || "",
      status: escola.status || "Ativo",
    });
    setErrors({});
    setEditingId(escola.id);
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

 function validarFormulario() {
  const newErrors = {};

  // Nome da escola - não pode ter números nem caracteres especiais
  if (!form.nome.trim()) {
  newErrors.nome = "Nome da escola é obrigatório.";
} else if (form.nome.trim().length < 3) {
  newErrors.nome = "O nome deve ter pelo menos 3 caracteres.";
} else if (/^[\d\s\-]+$/.test(form.nome.trim())) {
  newErrors.nome = "O nome da escola não pode ser apenas números ou símbolos.";
}

  // Email da escola - se preenchido deve ser válido
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    newErrors.email = "Email da escola inválido.";
  }

  // Telefone - só números, mínimo 9 dígitos
  if (form.telefone.trim()) {
    const tel = form.telefone.replace(/\s/g, "");
    if (!/^\d+$/.test(tel)) {
      newErrors.telefone = "O telefone deve conter apenas números.";
    } else if (tel.length < 9) {
      newErrors.telefone = "O telefone deve ter pelo menos 9 dígitos.";
      
    }
  }

  if (form.localizacao.trim() && form.localizacao.trim().length < 3) {
  newErrors.localizacao = "A localização deve ter pelo menos 3 caracteres.";
}

  // Nome do administrador - não pode ter números
  if (!form.admin_nome.trim()) {
    newErrors.admin_nome = "Nome do administrador é obrigatório.";
  } else if (/\d/.test(form.admin_nome)) {
    newErrors.admin_nome = "O nome do administrador não pode conter números.";
  }

  // Email do administrador - obrigatório e válido
  if (!form.admin_email.trim()) {
    newErrors.admin_email = "Email do administrador é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_email)) {
    newErrors.admin_email = "Email do administrador inválido.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}

  async function salvarEscola() {
    setMsg({ type: "", text: "" });

    if (!validarFormulario()) return;

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      localizacao: form.localizacao.trim(),
      admin_nome: form.admin_nome.trim(),
      admin_email: form.admin_email.trim(),
      status: form.status,
    };

    setLoading(true);

    try {
      if (editingId) {
        await http.put(`/superadmin/escolas/${editingId}`, payload);
        setSuccessText("Escola atualizada com sucesso.");
      } else {
        await http.post("/superadmin/escolas", payload);
        setSuccessText("Escola criada com sucesso.");
      }

      await fetchEscolas();
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

      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao guardar escola.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function alternarStatus(id) {
    const escola = escolas.find((x) => x.id === id);
    if (!escola) return;

    const novoStatus = escola.status === "Ativo" ? "Inativo" : "Ativo";

    try {
      await http.put(`/superadmin/escolas/${id}`, {
        nome: escola.nome,
        email: escola.email || "",
        telefone: escola.telefone || "",
        localizacao: escola.localizacao || "",
        admin_nome: escola.admin_nome || "",
        admin_email: escola.admin_email || "",
        status: novoStatus,
      });

      await fetchEscolas();
      setSuccessText("Status da escola atualizado.");
      setOpenSuccessModal(true);
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao atualizar status.",
      });
    }
  }

  function apagarEscola(id) {
    const escola = escolas.find((x) => x.id === id);
    setEscolaDelete(escola);
    setConfirmDelete(true);
  }

  async function confirmarApagar() {
    if (!escolaDelete) return;

    try {
      await http.delete(`/superadmin/escolas/${escolaDelete.id}`);
      await fetchEscolas();

      setConfirmDelete(false);
      setEscolaDelete(null);

      setSuccessText("Escola apagada com sucesso.");
      setOpenSuccessModal(true);
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao apagar escola.",
      });
    }
  }

async function enviarCredenciais(id) {
  try {
    const res = await http.post(`/superadmin/escolas/${id}/enviar-credenciais`);

    setSuccessText(res?.data?.message || "Credenciais enviadas com sucesso.");
    setOpenSuccessModal(true);
  } catch (e) {
    setMsg({
      type: "error",
      text: e?.response?.data?.message || "Erro ao enviar credenciais.",
    });
  }
}

  function formatarData(data) {
    if (!data) return "-";

    const dt = new Date(data);
    if (Number.isNaN(dt.getTime())) return data;

    return dt.toLocaleDateString("pt-PT");
  }

  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();

    return escolas.filter((e) => {
      const okStatus = statusFiltro === "Todos" ? true : e.status === statusFiltro;
      const okQ =
        !s ||
        (e.nome || "").toLowerCase().includes(s) ||
        (e.email || "").toLowerCase().includes(s) ||
        (e.telefone || "").toLowerCase().includes(s) ||
        (e.localizacao || "").toLowerCase().includes(s) ||
        (e.admin_nome || "").toLowerCase().includes(s) ||
        (e.admin_email || "").toLowerCase().includes(s);

      return okStatus && okQ;
    });
  }, [escolas, q, statusFiltro]);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "#0B1B2A" }}>Escolas</h2>
          <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
            Gestão das escolas cadastradas na plataforma.
          </p>
        </div>

        <div style={styles.topActions}>
          <div style={styles.pill}>{filtradas.length} escolas</div>
          <button onClick={openNovaEscola} style={styles.btnPrimary}>
            + Nova escola
          </button>
        </div>
      </div>

      {msg.text && (
        <div
          style={{
            ...styles.card,
            marginBottom: 14,
            borderLeft: msg.type === "error" ? "6px solid #ef4444" : "6px solid #16a34a",
          }}
        >
          <div style={{ fontWeight: 800 }}>{msg.text}</div>
        </div>
      )}

      {confirmDelete && (
        <div style={styles.modalBackdrop}>
          <div style={styles.successModal}>
            <h3 style={{ marginBottom: 10 }}>Apagar escola</h3>

            <p>
              Tens certeza que queres apagar a escola
              <br />
              <strong>{escolaDelete?.nome}</strong>?
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setConfirmDelete(false);
                  setEscolaDelete(null);
                }}
              >
                Cancelar
              </button>

              <button style={styles.btnDanger} onClick={confirmarApagar}>
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}

      {openSuccessModal && (
        <div style={styles.modalBackdrop} onClick={() => setOpenSuccessModal(false)}>
          <div style={styles.successModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successIcon}>✓</div>
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

      <div style={styles.card}>
        <div style={styles.filters}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={styles.label}>Pesquisar</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="nome, e-mail, localização..."
              style={styles.input}
            />
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
      </div>
<div style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
  {filtradas.length === 0 ? (
    <div style={styles.card}>
      <div style={styles.empty}>
        {loading ? "A carregar..." : "Nenhuma escola encontrada."}
      </div>
    </div>
  ) : (
    filtradas.map((e) => (
      <div key={e.id} style={styles.miniCard}>
  <div style={{ flex: 1 }}>
    <div style={styles.miniTitle}>{e.nome}</div>
    <div style={styles.miniDate}>
      Cadastrada: {formatarData(e.created_at)}
    </div>

  <div style={styles.miniActions}>
  <button style={styles.miniActionBtn} onClick={() => openEditarEscola(e)}>
    Ver
  </button>
  <button style={styles.miniActionBtn} onClick={() => enviarCredenciais(e.id)}>
    Enviar
  </button>
  <button
    style={e.status === "Ativo" ? styles.miniActionWarn : styles.miniActionOk}
    onClick={() => alternarStatus(e.id)}
  >
    {e.status === "Ativo" ? "Desativar" : "Ativar"}
  </button>
  <button style={styles.miniActionDanger} onClick={() => apagarEscola(e.id)}>
    Apagar
  </button>
</div>
  </div>

</div>
    ))
  )}
</div>

      {open && (
        <div style={styles.modalBackdrop} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: "#0B1B2A" }}>
                {editingId ? "Editar escola" : "Nova escola"}
              </h3>

              <button style={styles.btnGhost} onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <div>
                <div style={styles.label}>Nome da escola</div>
                <input
                  style={{
                    ...styles.input,
                    border: errors.nome ? "1px solid #ef4444" : styles.input.border,
                  }}
                  value={form.nome}
                  onChange={(ev) => setForm((p) => ({ ...p, nome: ev.target.value }))}
                  placeholder="Ex: Escola São Domingos"
                />
                {errors.nome && <div style={styles.fieldError}>{errors.nome}</div>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={styles.label}>Email da escola</div>
                  <input
                    style={styles.input}
                    value={form.email}
                    onChange={(ev) => setForm((p) => ({ ...p, email: ev.target.value }))}
                    placeholder="Ex: escola@email.com"
                  />
                  {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
                </div>

                <div>
                  <div style={styles.label}>Telefone</div>
                  <input
                    style={styles.input}
                    value={form.telefone}
                    onChange={(ev) => setForm((p) => ({ ...p, telefone: ev.target.value }))}
                    placeholder="Ex: 923000000"
                  />
                  {errors.telefone && <div style={styles.fieldError}>{errors.telefone}</div>}
                </div>
              </div>

              <div>
                <div style={styles.label}>Localização</div>
                <input
                  style={styles.input}
                  value={form.localizacao}
                  onChange={(ev) => setForm((p) => ({ ...p, localizacao: ev.target.value }))}
                  placeholder="Ex: Luanda, Angola"
                />
                {errors.localizacao && <div style={styles.fieldError}>{errors.localizacao}</div>}
              </div>

             

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={styles.label}>Nome do administrador</div>
                  <input
                    style={styles.input}
                    value={form.admin_nome}
                    onChange={(ev) => setForm((p) => ({ ...p, admin_nome: ev.target.value }))}
                    placeholder="Ex: João Manuel"
                  />
                  {errors.admin_nome && <div style={styles.fieldError}>{errors.admin_nome}</div>}
                </div>
             
                <div>
                  <div style={styles.label}>Email do administrador</div>
                <input
  style={{
    ...styles.input,
    border: errors.admin_email ? "1px solid #ef4444" : "1px solid rgba(11,27,42,.12)",
  }}
  value={form.admin_email}
  onChange={(ev) => setForm((p) => ({ ...p, admin_email: ev.target.value }))}
  placeholder="Ex: admin@escola.com"
/>
{errors.admin_email && <div style={styles.fieldError}>{errors.admin_email}</div>}
                </div>
              </div>

              <div>
                <div style={styles.label}>Status</div>
                <select
                  style={styles.input}
                  value={form.status}
                  onChange={(ev) => setForm((p) => ({ ...p, status: ev.target.value }))}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <button style={styles.btnPrimary} onClick={salvarEscola} disabled={loading}>
                {loading ? "A guardar..." : editingId ? "Guardar alterações" : "Criar escola"}
              </button>
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
  topActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
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
  },
  pill: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
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
  },
  btnDanger: {
    border: "1px solid rgba(239,68,68,.25)",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
  },
  empty: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
  },
  schoolCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  schoolInfo: {
    flex: 1,
    minWidth: 260,
  },
  schoolTitle: {
    fontSize: 30,
    fontWeight: 950,
    color: "#0B1B2A",
    marginBottom: 8,
  },
  schoolDate: {
    fontSize: 15,
    fontWeight: 800,
    color: "rgba(11,27,42,.72)",
    marginBottom: 12,
  },
  schoolMeta: {
    display: "grid",
    gap: 6,
    color: "#0B1B2A",
    fontWeight: 650,
  },
  schoolActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
  },
  modalBackdrop: {
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
    width: "min(840px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    padding: 16,
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
  miniCard: {
  width: 260,
  background: "#fff",
  borderRadius: 16,
  border: "1px solid rgba(11,27,42,.10)",
  boxShadow: "0 8px 20px rgba(11,27,42,.08)",
  padding: 14,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
},

miniTitle: {
  fontSize: 16,
  fontWeight: 900,
  color: "#0B1B2A",
},

miniDate: {
  fontSize: 12,
  color: "rgba(11,27,42,.65)",
  fontWeight: 700,
  marginTop: 4,
},

miniActions: {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 10,
},

miniActionBtn: {
  border: "1px solid rgba(11,27,42,.14)",
  padding: "6px 10px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
  background: "#fff",
  color: "#0B1B2A",
  fontSize: 12,
},

miniActionDanger: {
  border: "1px solid rgba(239,68,68,.25)",
  padding: "6px 10px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
  background: "rgba(239,68,68,.10)",
  color: "#B91C1C",
  fontSize: 12,
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
    fontSize: 34,
    fontWeight: 950,
    border: "1px solid rgba(34,197,94,.20)",
  },
  alert: {
  background: "#FFFFFF",
  border: "1px solid rgba(11,27,42,.10)",
  borderRadius: 18,
  boxShadow: "0 10px 30px rgba(11,27,42,.08)",
  padding: 16,
  marginBottom: 14,
},

cardsWrap: {
  marginTop: 14,
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
},

miniActionWarn: {
  border: "1px solid rgba(245,158,11,.30)",
  padding: "6px 10px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
  background: "rgba(245,158,11,.12)",
  color: "#7C4A03",
  fontSize: 12,
},

miniActionOk: {
  border: "1px solid rgba(34,197,94,.25)",
  padding: "6px 10px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
  background: "rgba(34,197,94,.10)",
  color: "#166534",
  fontSize: 12,
},

};