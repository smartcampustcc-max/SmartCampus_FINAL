import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  Eye,
  Send,
  TriangleAlert,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import http from "../../api/http";
export default function Professores() {
  const [q, setQ] = useState("");
  const [disciplina, setDisciplina] = useState("Todas");
  const [professores, setProfessores] = useState([]);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [sucessText, setSucessText] = useState("");
  const [openSucessModal, setOpenSucessModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState(0);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [successText, setSuccessText] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [dadosCriados, setDadosCriados] = useState(null);
  const [openCredenciaisModal, setOpenCredenciaisModal] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bi: "",
    genero: "",
    morada: "",
    grau_academico: "",
    area_formacao: "",
    data_admissao: "",
    documento_bi: null,
    documento_diploma: null,
    username: "",
    password: "",
    status: "Ativo",
    disciplinas: [],
  });
  const steps = [
    "Dados pessoais",
    "Dados profissionais",
    "Disciplinas",
    "Documentos",
    "Acesso",
  ];
  useEffect(() => {
    fetchProfessores();
    fetchDisciplinas();
  }, []);
  async function fetchProfessores() {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await http.get("/admin/professores");
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.professores)
        ? raw.professores
        : [];
      const mapped = list.map((u) => ({
        id: u.id,
        nome: u.name || u.nome || "-",
        email: u.email || "-",
        phone: u.phone || "",
        bi: u.bi || "",
        genero: u.genero || "",
        morada: u.morada || "",
        grau_academico: u.grau_academico || "",
        area_formacao: u.area_formacao || "",
        data_admissao: u.data_admissao || "",
        documento_bi: u.documento_bi || "",
        documento_diploma: u.documento_diploma || "",
        username: u.username || u.codigo || "",
        disciplinas_ids: Array.isArray(u.disciplinas)
          ? u.disciplinas.map((d) => Number(d.id))
          : [],
        disciplina:
          Array.isArray(u.disciplinas) && u.disciplinas.length
            ? u.disciplinas.map((d) => d.nome).join(", ")
            : "—",
        status: u.status || "Ativo",
      }));
      setProfessores(mapped);
    } catch (e) {
      setProfessores([]);
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao carregar professores.",
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
      setDisciplinasDisponiveis(list);
    } catch {
      setDisciplinasDisponiveis([]);
    }
  }
  function capitalizarTexto(valor) {
    const minusculas = ["da", "de", "do", "das", "dos", "e"];
    return String(valor || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((palavra, index) => {
        if (index !== 0 && minusculas.includes(palavra)) return palavra;
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      })
      .join(" ");
  }
  function gerarUsername(nome) {
    const partes = String(nome || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (partes.length < 2) return "";
    return `${partes[0]}.${partes[partes.length - 1]}`.replace(
      /[^a-z0-9._-]/g,
      ""
    );
  }
  function resetForm() {
    setForm({
      name: "",
      email: "",
      phone: "",
      bi: "",
      genero: "",
      morada: "",
      grau_academico: "",
      area_formacao: "",
      data_admissao: "",
      documento_bi: null,
      documento_diploma: null,
      username: "",
      password: "",
      status: "Ativo",
      disciplinas: [],
    });
    setErrors({});
    setEditingId(null);
    setStep(0);
  }
  function openModal() {
    resetForm();
    setDadosCriados(null);
    setOpen(true);
    setMsg({ type: "", text: "" });
  }
  function openEditarProfessor(professor) {
    setForm({
      name: professor.nome || "",
      email: professor.email || "",
      phone: professor.phone || "",
      bi: professor.bi || "",
      genero: professor.genero || "",
      morada: professor.morada || "",
      grau_academico: professor.grau_academico || "",
      area_formacao: professor.area_formacao || "",
      data_admissao: professor.data_admissao || "",
      documento_bi: null,
      documento_diploma: null,
      username: professor.username || "",
      password: "",
      status: professor.status || "Ativo",
      disciplinas: professor.disciplinas_ids || [],
    });
    setErrors({});
    setEditingId(professor.id);
    setStep(0);
    setOpen(true);
    setMsg({ type: "", text: "" });
  }
  function verProfessor(id) {
    const p = professores.find((x) => x.id === id);
    if (!p) return;
    setSelectedProfessor(p);
    setViewOpen(true);
  }
  function apagarProfessor(id) {
    const p = professores.find((x) => x.id === id);
    if (!p) return;
    setProfessorToDelete(p);
    setConfirmOpen(true);
  }
  function validarDadosPessoais(newErrors) {
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const bi = form.bi.trim().toUpperCase();
    const morada = form.morada.trim();
    if (!name) {
      newErrors.name = "Nome obrigatório.";
    } else if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(name)) {
      newErrors.name = "O nome só pode conter letras, espaços, hífen e apóstrofo.";
    } else {
      const partes = name.split(/\s+/).filter(Boolean);
      if (partes.length < 2) {
        newErrors.name = "Informe pelo menos nome e apelido.";
      } else if (partes.some((p) => p.length < 2)) {
        newErrors.name = "Cada nome deve ter pelo menos 2 letras.";
      } else if (/(.)\1{3,}/i.test(name)) {
        newErrors.name = "Nome inválido.";
      }
    }
    if (!bi) {
      newErrors.bi = "Número do BI obrigatório.";
    } else if (
      !/^\d{9}(LA|ME|ZE|BE|BA|BO|CA|CC|CN|CS|CE|HO|HA|LN|LS|MO|NE|UE)\d{3}$/.test(
        bi
      )
      
    ) {
      newErrors.bi = "BI inválido. Ex: 001132566LA039.";
    }
    const biJaExiste = professores.some(
  (p) =>
    String(p.bi || "").toUpperCase() === bi &&
    String(p.id) !== String(editingId)
);

if (biJaExiste) {
  newErrors.bi = "Este número de BI já está cadastrado.";
}

    if (!form.genero) {
      newErrors.genero = "Género obrigatório.";
    }
    if (!email) {
      newErrors.email = "Email obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido.";
    }
    if (!phone) {
      newErrors.phone = "Telefone obrigatório.";
    } else if (!/^9[1-9][0-9]{7}$/.test(phone)) {
      newErrors.phone = "Número inválido. Ex: 923456789.";
    } else if (/^(.)\1{8}$/.test(phone)) {
      newErrors.phone = "Número inválido.";
    }
    if (!morada) {
      newErrors.morada = "Morada obrigatória.";
    } else if (morada.length < 5) {
      newErrors.morada = "Morada demasiado curta.";
    }
  }
  function validarDadosProfissionais(newErrors) {
    const grau = form.grau_academico.trim();
    const area = form.area_formacao.trim();
    if (!grau) {
      newErrors.grau_academico = "Grau académico obrigatório.";
    }
    if (!area) {
      newErrors.area_formacao = "Área de formação obrigatória.";
    }
    if (!form.data_admissao) {
  newErrors.data_admissao = "Data de admissão obrigatória.";
} else {
  const admissao = new Date(form.data_admissao);
  const hoje = new Date();
  const limite = new Date("2014-01-01");

  admissao.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  if (admissao > hoje) {
    newErrors.data_admissao =
      "A data de admissão não pode ser futura.";
  } else if (admissao < limite) {
    newErrors.data_admissao =
      "A data de admissão não pode ser inferior a 2014.";
  }
}
    if (!["Ativo", "Inativo"].includes(form.status)) {
      newErrors.status = "Status inválido.";
    }
  }
  function validarDisciplinas(newErrors) {
    if (!form.disciplinas || form.disciplinas.length === 0) {
      newErrors.disciplinas = "Seleciona pelo menos 1 disciplina.";
    } else if (form.disciplinas.length > 2) {
      newErrors.disciplinas = "Seleciona no máximo 2 disciplinas.";
    } else if (
      new Set(form.disciplinas.map(Number)).size !== form.disciplinas.length
    ) {
      newErrors.disciplinas = "Não seleciones a mesma disciplina duas vezes.";
    }
  }
  function validarAcesso(newErrors) {
    const username = form.username.trim();
    if (username && !/^[A-Za-z0-9._-]{3,50}$/.test(username)) {
      newErrors.username =
        "Utilizador inválido. Use letras, números, ponto, hífen ou underscore.";
    }
  }
  function validarFormulario() {
    const newErrors = {};
    validarDadosPessoais(newErrors);
    validarDadosProfissionais(newErrors);
    validarDisciplinas(newErrors);
    validarAcesso(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  function validarStepAtual() {
  const newErrors = {};

  if (step === 0) validarDadosPessoais(newErrors);
  if (step === 1) validarDadosProfissionais(newErrors);
  if (step === 2) validarDisciplinas(newErrors);
  if (step === 4) validarAcesso(newErrors);

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    setErrorText("Preencha corretamente todos os campos obrigatórios antes de avançar.");
    setOpenErrorModal(true);
    return false;
  }

  return true;
}
  function goNext() {
    if (!validarStepAtual()) return;
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    }
  }
  function goPrev() {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }
  function tratarErrosBackend(e) {
    const backendErrors = e?.response?.data?.errors;
    if (backendErrors) {
      const newErrors = {};
      Object.keys(backendErrors).forEach((key) => {
        newErrors[key] = backendErrors[key][0];
      });
      setErrors(newErrors);
      setErrorText(
        e?.response?.data?.message ||
          "Há campos inválidos. Corrige e tenta novamente."
      );
      setOpenErrorModal(true);
      return;
    }
    setErrorText(e?.response?.data?.message || "Erro na operação.");
    setOpenErrorModal(true);
  }
  function montarPayload() {
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim().toLowerCase());
    fd.append("phone", form.phone.trim());
    fd.append("bi", form.bi.trim().toUpperCase());
    fd.append("genero", form.genero);
    fd.append("morada", form.morada.trim());
    fd.append("grau_academico", form.grau_academico.trim());
    fd.append("area_formacao", form.area_formacao.trim());
    fd.append("data_admissao", form.data_admissao);
    fd.append("status", form.status);
    form.disciplinas.map(Number).forEach((id) => {
      fd.append("disciplinas[]", id);
    });
    if (form.username.trim()) {
      fd.append("username", form.username.trim().toLowerCase());
    }
    if (form.documento_bi) {
      fd.append("documento_bi", form.documento_bi);
    }
    if (form.documento_diploma) {
      fd.append("documento_diploma", form.documento_diploma);
    }
    return fd;
  }
async function salvarProfessor() {
  setMsg({ type: "", text: "" });
  setDadosCriados(null);
  setOpenErrorModal(false);

  const newErrors = {};

  validarDadosPessoais(newErrors);
  validarDadosProfissionais(newErrors);
  validarDisciplinas(newErrors);
  validarAcesso(newErrors);

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    if (
      newErrors.name ||
      newErrors.bi ||
      newErrors.genero ||
      newErrors.email ||
      newErrors.phone ||
      newErrors.morada
    ) {
      setStep(0);
    } else if (
      newErrors.grau_academico ||
      newErrors.area_formacao ||
      newErrors.data_admissao ||
      newErrors.status
    ) {
      setStep(1);
    } else if (newErrors.disciplinas) {
      setStep(2);
    } else if (newErrors.username || newErrors.password) {
      setStep(4);
    }

    setErrorText("Corrige os campos assinalados antes de criar o professor.");
    setOpenErrorModal(true);
    return;
  }

  const payload = montarPayload();

  try {
    setCreating(true);

    if (editingId) {
      const res = await http.post(
        `/admin/professores/${editingId}?_method=PUT`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      await fetchProfessores();
      setOpen(false);
      resetForm();

      setSuccessText(res?.data?.message || "Professor atualizado com sucesso.");
      setOpenSuccessModal(true);
      return;
    }

    const res = await http.post("/admin/professores", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await fetchProfessores();
    setOpen(false);
    resetForm();

    setSuccessText(
      res?.data?.message ||
        "Professor criado com sucesso. Use o botão Enviar para enviar as credenciais de acesso."
    );
    setOpenSuccessModal(true);
  } catch (e) {
    tratarErrosBackend(e);
  } finally {
    setCreating(false);
  }
}
  async function enviarCredenciais(id) {
    try {
      setSendingId(id);
      const res = await http.post(`/admin/professores/${id}/enviar-credenciais`);
      setSuccessText(res?.data?.message || "Credenciais processadas com sucesso.");
      setOpenSuccessModal(true);
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao enviar credenciais.");
      setOpenErrorModal(true);
    } finally {
      setSendingId(null);
    }
  }
  async function apagarProfessorConfirmado() {
    if (!professorToDelete) return;
    try {
      setDeleting(true);
      await http.delete(`/admin/professores/${professorToDelete.id}`);
      await fetchProfessores();
      setConfirmOpen(false);
      setProfessorToDelete(null);
      setSuccessText("Professor apagado com sucesso.");
      setOpenSuccessModal(true);
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao apagar professor.");
      setOpenErrorModal(true);
    } finally {
      setDeleting(false);
    }
  }
  const disciplinas = useMemo(() => {
    const set = new Set();
    professores.forEach((p) => {
      if (!p.disciplina || p.disciplina === "—") return;
      p.disciplina.split(",").forEach((d) => {
        const nome = d.trim();
        if (nome) set.add(nome);
      });
    });
    return ["Todas", ...Array.from(set)];
  }, [professores]);
  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    return professores.filter((p) => {
      const okDisc =
        disciplina === "Todas"
          ? true
          : String(p.disciplina || "")
              .toLowerCase()
              .includes(disciplina.toLowerCase());
      const okQ =
        !s ||
        (p.nome || "").toLowerCase().includes(s) ||
        (p.email || "").toLowerCase().includes(s) ||
        (p.phone || "").toLowerCase().includes(s) ||
        (p.bi || "").toLowerCase().includes(s) ||
        (p.username || "").toLowerCase().includes(s) ||
        (p.disciplina || "").toLowerCase().includes(s) ||
        (p.area_formacao || "").toLowerCase().includes(s);
      return okDisc && okQ;
    });
  }, [professores, q, disciplina]);
  return (
    <div>
      {openSuccessModal && (
        <div
          style={{...styles.modalBackdrop ,zIndex:20000}}
          onClick={() => setOpenSuccessModal(false)}
        >
          <div style={styles.successModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successIcon}>
              <CheckCircle2 size={34} />
            </div>
            <h3 style={{ margin: "0 0 8px", color: "#166534" }}>
              {successText}
            </h3>
            <p
              style={{
                margin: 0,
                color: "rgba(11,27,42,.65)",
                fontWeight: 650,
              }}
            >
              A operação foi concluída com sucesso.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 18,
              }}
            >
              <button
                style={styles.btnPrimary}
                onClick={() => setOpenSuccessModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {openErrorModal && (
        <div
          style={{...styles.modalBackdrop ,zIndex:20000}}
          onClick={() => setOpenErrorModal(false)}
        >
          <div style={styles.errorModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.errorIcon}>
              <XCircle size={34} />
            </div>
            <h3 style={{ margin: "0 0 8px", color: "#B91C1C" }}>Erro</h3>
            <p
              style={{
                margin: 0,
                color: "rgba(11,27,42,.75)",
                fontWeight: 650,
              }}
            >
              {errorText}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 18,
              }}
            >
              <button
                style={styles.btnDanger}
                onClick={() => setOpenErrorModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmOpen && (
        <div  style={{...styles.modalBackdrop ,zIndex:20000}} onClick={() => setConfirmOpen(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.confirmIcon}>
              <TriangleAlert size={34} />
            </div>
            <h3 style={{ margin: "0 0 8px", color: "#0B1B2A" }}>
              Apagar professor
            </h3>
            <p
              style={{
                margin: 0,
                color: "rgba(11,27,42,.75)",
                fontWeight: 650,
                lineHeight: 1.5,
              }}
            >
              Tens certeza que queres apagar
              <br />
              <strong>{professorToDelete?.nome}</strong>?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setConfirmOpen(false);
                  setProfessorToDelete(null);
                }}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                style={styles.btnDanger}
                onClick={apagarProfessorConfirmado}
                disabled={deleting}
              >
                {deleting ? "A apagar..." : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {openCredenciaisModal && (
        <div
          style={{...styles.modalBackdrop ,zIndex:20000}}
          onClick={() => setOpenCredenciaisModal(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successIcon}>
              <CheckCircle2 size={34} />
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                color: "#166534",
                textAlign: "center",
              }}
            >
              Professor criado com sucesso
            </h3>
            <p
              style={{
                color: "rgba(11,27,42,.7)",
                fontWeight: 650,
                textAlign: "center",
              }}
            >
              Os dados de acesso já estão prontos.
            </p>
            <div style={styles.successGrid}>
              <div style={styles.successItem}>
                <span style={styles.successLabel}>Utilizador</span>
                <strong style={styles.successCode}>
                  {dadosCriados?.codigo || "—"}
                </strong>
              </div>
              <div style={styles.successItem}>
                <span style={styles.successLabel}>Senha provisória</span>
                <strong style={styles.successCode}>
                  {dadosCriados?.senha || "—"}
                </strong>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                style={styles.btnGhost}
                onClick={() =>
                  navigator.clipboard.writeText(`
SmartCampus:
Sua conta foi criada.
Utilizador: ${dadosCriados?.codigo}
Senha provisória: ${dadosCriados?.senha}
Entre no sistema e altere a senha no primeiro acesso.
`)
                }
              >
                Copiar mensagem
              </button>
              <button
                style={styles.btnPrimary}
                onClick={() => setOpenCredenciaisModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {viewOpen && selectedProfessor && (
        <div
          style={styles.modalBackdrop}
          onClick={() => {
            setViewOpen(false);
            setSelectedProfessor(null);
          }}
        >
          <div style={styles.viewModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.viewHeader}>
              <div>
                <div style={styles.viewTitle}>Detalhes do professor</div>
                <div style={styles.viewSubtitle}>
                  Informação académica e profissional.
                </div>
              </div>
              <button
                style={styles.iconClose}
                onClick={() => {
                  setViewOpen(false);
                  setSelectedProfessor(null);
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.viewCard}>
              <ViewRow label="Nome" value={selectedProfessor.nome} />
              <ViewRow label="BI" value={selectedProfessor.bi} />
              <ViewRow label="Género" value={selectedProfessor.genero} />
              <ViewRow label="E-mail" value={selectedProfessor.email} />
              <ViewRow label="Telefone" value={selectedProfessor.phone} />
              <ViewRow label="Morada" value={selectedProfessor.morada} />
              <ViewRow
                label="Grau académico"
                value={selectedProfessor.grau_academico}
              />
              <ViewRow
                label="Área de formação"
                value={selectedProfessor.area_formacao}
              />
              <ViewRow
                label="Data de admissão"
                value={selectedProfessor.data_admissao}
              />
              <div style={styles.viewRow}>
                <span style={styles.viewLabel}>Utilizador</span>
                <span style={styles.viewCode}>
                  {selectedProfessor.username || "—"}
                </span>
              </div>
              <div style={styles.viewRow}>
                <span style={styles.viewLabel}>Disciplinas habilitadas</span>
                <span style={styles.viewBadgeNeutral}>
                  {selectedProfessor.disciplina || "—"}
                </span>
              </div>
              <div style={styles.viewRow}>
                <span style={styles.viewLabel}>Estado</span>
                {selectedProfessor.status === "Ativo" ? (
                  <span style={styles.viewBadgeOk}>Ativo</span>
                ) : (
                  <span style={styles.viewBadgeWarn}>Inativo</span>
                )}
              </div>
            </div>
            <div style={styles.viewFooter}>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setViewOpen(false);
                  setSelectedProfessor(null);
                }}
              >
                Fechar
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
        <div style={styles.cardHeader}>
          <div>
            <h3
              style={{
                margin: 0,
                color: "#0B1B2A",
                fontSize: 30,
                fontWeight: 950,
              }}
            >
              Professores
            </h3>
            <p
              style={{
                margin: "6px 0 0",
                color: "rgba(11,27,42,.62)",
                fontWeight: 650,
              }}
            >
              Gestão digital dos professores e documentos profissionais da
              escola.
            </p>
          </div>
          <div style={styles.topActions}>
            <div style={styles.pill}>
              <Users size={16} />
              <span>{filtrados.length} professores</span>
            </div>
            <button onClick={openModal} style={styles.btnPrimary}>
              <Plus size={16} />
              <span>Novo professor</span>
            </button>
          </div>
        </div>
        <div style={styles.filters}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={styles.label}>Pesquisar</div>
            <div style={styles.searchWrap}>
              <Search size={16} color="rgba(11,27,42,.45)" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="nome, BI, email, telefone, utilizador..."
                style={styles.searchInput}
              />
            </div>
          </div>
          <div style={{ width: 260, minWidth: 260 }}>
            <div style={styles.label}>Disciplina</div>
            <select
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              style={styles.input}
            >
              {disciplinas.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14, overflowX: "auto" }}>
          <table style={{ ...styles.table, minWidth: 1180 }}>
            <thead>
              <tr>
                <th style={styles.th}>Professor</th>
                <th style={styles.th}>BI</th>
                <th style={styles.th}>Contacto</th>
                <th style={styles.th}>Formação</th>
                <th style={styles.th}>Disciplinas</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, width: 360 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 16 }}>
                    <div style={styles.empty}>A carregar professores...</div>
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 16 }}>
                    <div style={styles.empty}>Nenhum professor encontrado.</div>
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>
                      <div
                        style={{
                          fontWeight: 950,
                          maxWidth: 240,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={p.nome}
                      >
                        {p.nome}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(11,27,42,.6)",
                          fontWeight: 650,
                        }}
                      >
                        Utilizador: {p.username || "—"}
                      </div>
                    </td>
                    <td style={styles.td}>{p.bi || "-"}</td>
                    <td style={styles.td}>
                      <div>{p.phone || "-"}</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(11,27,42,.6)",
                          fontWeight: 650,
                        }}
                      >
                        {p.email || "-"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 850 }}>
                        {p.grau_academico || "-"}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(11,27,42,.6)",
                          fontWeight: 650,
                        }}
                      >
                        {p.area_formacao || "-"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{p.disciplina || "—"}</span>
                    </td>
                    <td style={styles.td}>
                      {p.status === "Ativo" ? (
                        <span style={styles.badgeOk}>Ativo</span>
                      ) : (
                        <span style={styles.badgeWarn}>Inativo</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => verProfessor(p.id)}
                          style={styles.actionView}
                        >
                          <Eye size={14} />
                          <span>Ver</span>
                        </button>
                        <button
                          onClick={() => openEditarProfessor(p)}
                          style={styles.actionEdit}
                        >
                          <Pencil size={14} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => enviarCredenciais(p.id)}
                          style={{
                            ...styles.actionManage,
                            opacity: sendingId === p.id ? 0.6 : 1,
                            pointerEvents:
                              sendingId === p.id ? "none" : "auto",
                          }}
                          disabled={sendingId === p.id}
                        >
                          <Send size={14} />
                          <span>
                            {sendingId === p.id ? "A enviar..." : "Enviar"}
                          </span>
                        </button>
                        <button
                          onClick={() => apagarProfessor(p.id)}
                          style={styles.actionDelete}
                        >
                          <Trash2 size={14} />
                          <span>Apagar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {open && (
        <div
          style={styles.modalBackdrop}
          onClick={() => {
            setOpen(false);
            resetForm();
          }}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: "#0B1B2A" }}>
                  {editingId ? "Editar professor" : "Cadastrar professor"}
                </h3>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "rgba(11,27,42,.62)",
                    fontWeight: 650,
                  }}
                >
                  Registo digital dos dados pessoais, profissionais e
                  documentos.
                </p>
              </div>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                Fechar
              </button>
            </div>
            <div style={styles.stepper}>
              {steps.map((label, index) => (
                <div
                  key={label}
                  style={{
                    ...styles.stepItem,
                    ...(index === step ? styles.stepActive : {}),
                    ...(index < step ? styles.stepDone : {}),
                  }}
                >
                  <div style={styles.stepNumber}>{index + 1}</div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div key={`step-${step}`} style={{ marginTop: 16 }}>
              {step === 0 && (
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Dados pessoais</h4>
                  <div style={styles.formGrid}>
                    <Field label="Nome completo" error={errors.name}>
                      <input
                        style={inputStyle(errors.name)}
                        value={form.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setForm((p) => ({
                            ...p,
                            name: value,
                            username:
                              !editingId && !p.username.trim()
                                ? gerarUsername(value)
                                : p.username,
                          }));
                        }}
                        onBlur={(e) => {
                          const nome = capitalizarTexto(e.target.value);
                          setForm((p) => ({
                            ...p,
                            name: nome,
                            username:
                              !editingId && !p.username.trim()
                                ? gerarUsername(nome)
                                : p.username,
                          }));
                        }}
                        placeholder="Ex: João Francisco Costa"
                      />
                    </Field>
                    <Field label="Número do BI" error={errors.bi}>
                      <input
                        style={inputStyle(errors.bi)}
                        value={form.bi}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            bi: e.target.value.toUpperCase().slice(0, 14),
                          }))
                        }
                        placeholder="Ex: 001132566LA039"
                      />
                    </Field>
                    <Field label="Género" error={errors.genero}>
                      <select
                        style={inputStyle(errors.genero)}
                        value={form.genero}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, genero: e.target.value }))
                        }
                      >
                        <option value="">Selecione</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </Field>
                    <Field label="Telefone" error={errors.phone}>
                      <input
                        style={inputStyle(errors.phone)}
                        value={form.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                          setForm((p) => ({
                            ...p,
                            phone: value,
                          }));
                        setErrors((prev) => ({ ...prev, phone: "" }));
                        }}
                        placeholder="Ex: 923456789"
                      />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input
                        style={inputStyle(errors.email)}
                        value={form.email}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            email: e.target.value.toLowerCase().trim(),
                          }))
                        }
                        placeholder="Ex: professor@smartcampus.ao"
                      />
                    </Field>
                    <Field label="Morada" error={errors.morada}>
                      <input
                        style={inputStyle(errors.morada)}
                        value={form.morada}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            morada: e.target.value,
                          }))
                        }
                        onBlur={(e) =>
                          setForm((p) => ({
                            ...p,
                            morada: capitalizarTexto(e.target.value),
                          }))
                        }
                        placeholder="Ex: Bairro Operário, Luanda"
                      />
                    </Field>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Dados profissionais</h4>
                  <div style={styles.formGrid}>
                    <Field
                      label="Grau académico"
                      error={errors.grau_academico}
                    >
                      <select
                        style={inputStyle(errors.grau_academico)}
                        value={form.grau_academico}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            grau_academico: e.target.value,
                          }))
                        }
                      >
                        <option value="">Selecione</option>
                        <option value="Técnico Médio">Técnico Médio</option>
                        <option value="Licenciado">Licenciado</option>
                        <option value="Doutor">Doutor</option>
                      </select>
                    </Field>
                    <Field
                      label="Área de formação"
                      error={errors.area_formacao}
                    >
                  <select
  style={inputStyle(errors.area_formacao)}
  value={form.area_formacao}
  onChange={(e) =>
    setForm((p) => ({
      ...p,
      area_formacao: e.target.value,
    }))
  }
>
  <option value="">Selecione</option>
  <option value="Matemática">Matemática</option>
  <option value="Física">Física</option>
  <option value="Química">Química</option>
  <option value="Biologia">Biologia</option>
  <option value="Língua Portuguesa">Língua Portuguesa</option>
  <option value="Língua Inglesa">Língua Inglesa</option>
  <option value="Geografia">Geografia</option>
  <option value="História">História</option>
  <option value="Economia">Economia</option>
  <option value="Direito">Direito</option>
  <option value="Informática">Informática</option>
</select>
                    </Field>
                    <Field
                      label="Data de admissão"
                      error={errors.data_admissao}
                    >
                    <input
  type="date"
  min="2014-01-01"
  max={new Date().toISOString().split("T")[0]}
  style={inputStyle(errors.data_admissao)}
  value={form.data_admissao}
  onChange={(e) =>
    setForm((p) => ({
      ...p,
      data_admissao: e.target.value,
    }))
  }
/>
                    </Field>
                    <Field label="Status" error={errors.status}>
                      <select
                        style={inputStyle(errors.status)}
                        value={form.status}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            status: e.target.value,
                          }))
                        }
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Disciplinas habilitadas</h4>
                  <p style={styles.sectionHelp}>
                    Selecionas até 2 disciplinas que o professor pode
                    lecionar. 
                  </p>
                  <div style={styles.disciplinasBox}>
                    <div style={styles.disciplinasGrid}>
                      {disciplinasDisponiveis.length === 0 ? (
                        <div style={styles.empty}>
                          Nenhuma disciplina cadastrada.
                        </div>
                      ) : (
                        disciplinasDisponiveis.map((d) => {
                          const selecionadas = (form.disciplinas || []).map(
                            Number
                          );
                          const sel = selecionadas.includes(Number(d.id));
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                const dId = Number(d.id);
                                setForm((p) => {
                                  const atual = (p.disciplinas || []).map(
                                    Number
                                  );
                                  if (atual.includes(dId)) {
                                    return {
                                      ...p,
                                      disciplinas: atual.filter(
                                        (x) => x !== dId
                                      ),
                                    };
                                  }
                                  if (atual.length >= 2) {
                                    setErrorText(
                                      "Um professor pode ter no máximo 2 disciplinas habilitadas."
                                    );
                                    setOpenErrorModal(true);
                                    return p;
                                  }
                                  return {
                                    ...p,
                                    disciplinas: [...atual, dId],
                                  };
                                });
                              }}
                              style={{
                                ...styles.disciplinaChip,
                                ...(sel ? styles.disciplinaChipActive : {}),
                              }}
                            >
                              {d.nome}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                  {errors.disciplinas && (
                    <div style={styles.fieldError}>{errors.disciplinas}</div>
                  )}
                </div>
              )}
              {step === 3 && (
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Documentos digitais</h4>
                  <div style={styles.formGrid}>
                    <Field label="Cópia do BI" error={errors.documento_bi}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={inputStyle(errors.documento_bi)}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            documento_bi: e.target.files?.[0] || null,
                          }))
                        }
                      />
                    </Field>
                    <Field
                      label="Diploma ou certificado"
                      error={errors.documento_diploma}
                    >
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={inputStyle(errors.documento_diploma)}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            documento_diploma: e.target.files?.[0] || null,
                          }))
                        }
                      />
                    </Field>
                  </div>
                  
                </div>
              )}
              {step === 4 && (
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Dados de acesso</h4>
                  <div style={styles.formGrid}>
                    <Field label="Utilizador" error={errors.username}>
                      <input
                        style={inputStyle(errors.username)}
                        value={form.username}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            username: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9._-]/g, ""),
                          }))
                        }
                        placeholder="Gerado automaticamente se ficar vazio"
                      />
                    </Field>
                  <Field label="Senha">
  <input
    type="text"
    disabled
    value="Gerada automaticamente pelo sistema"
    style={{
      ...styles.input,
      background: "#f3f4f6",
      color: "rgba(11,27,42,.60)",
      cursor: "not-allowed",
      fontWeight: 800,
    }}
  />
</Field>
                  </div>
                  
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              {step > 0 && (
              <button
                style={styles.btnGhost}
                onClick={goPrev}
                
              >
                <ChevronLeft size={16} />
                Voltar
              </button>
      )}
              {step < steps.length - 1 ? (
                <button style={styles.btnPrimary} onClick={goNext}>
                  Avançar
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  style={styles.btnPrimary}
                  onClick={salvarProfessor}
                  disabled={creating}
                >
                  {creating
                    ? "A guardar..."
                    : editingId
                    ? "Guardar alterações"
                    : "Criar professor"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  function inputStyle(error) {
    return {
      ...styles.input,
      border: error ? "1px solid #ef4444" : "1px solid rgba(11,27,42,.12)",
      background: error ? "rgba(239,69,68,.03)" : "#fff",
    };
  }
}
function Field({ label, error, children }) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      {children}
      {error && <div style={styles.fieldError}>{error}</div>}
    </div>
  );
}
function ViewRow({ label, value }) {
  return (
    <div style={styles.viewRow}>
      <span style={styles.viewLabel}>{label}</span>
      <span style={styles.viewValue}>{value || "—"}</span>
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
  alertCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
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
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
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
  },
  pill: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
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
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
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
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  actionView: {
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
  actionManage: {
    border: "none",
    background: "transparent",
    color: "#0A7C52",
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
    padding: "12px 10px",
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
    background: "rgba(0,0,0,.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(980px, 100%)",
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
    marginBottom: 14,
  },
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
  },
  stepper: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
    marginTop: 16,
  },
  stepItem: {
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    borderRadius: 14,
    padding: 10,
    fontWeight: 900,
    color: "rgba(11,27,42,.65)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  stepActive: {
    border: "1px solid rgba(37,99,235,.30)",
    background: "rgba(37,99,235,.10)",
    color: "#1D4ED8",
  },
  stepDone: {
    border: "1px solid rgba(34,197,94,.25)",
    background: "rgba(34,197,94,.08)",
    color: "#166534",
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    border: "1px solid rgba(11,27,42,.12)",
    fontSize: 12,
  },
  fieldError: {
    marginTop: 6,
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: 800,
  },
  formSection: {
    border: "1px solid rgba(11,27,42,.08)",
    background: "rgba(11,27,42,.02)",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  sectionTitle: {
    margin: "0 0 10px",
    color: "#0B1B2A",
    fontWeight: 950,
  },
  sectionHelp: {
    margin: "-4px 0 10px",
    color: "rgba(11,27,42,.62)",
    fontWeight: 650,
    lineHeight: 1.5,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  infoBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(37,99,235,.18)",
    background: "rgba(37,99,235,.06)",
    color: "rgba(11,27,42,.75)",
    fontWeight: 700,
    lineHeight: 1.5,
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
  errorModal: {
    width: "min(420px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(239,68,68,.20)",
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    padding: 24,
    textAlign: "center",
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
  confirmModal: {
    width: "min(430px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    padding: 24,
    textAlign: "center",
  },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(245,158,11,.12)",
    color: "#D97706",
    border: "1px solid rgba(245,158,11,.20)",
  },
  disciplinasBox: {
    marginTop: 6,
    maxHeight: 180,
    overflowY: "auto",
    border: "1px solid rgba(11,27,42,.12)",
    borderRadius: 14,
    padding: 10,
    background: "#fff",
  },
  disciplinasGrid: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  disciplinaChip: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.15)",
    background: "#fff",
    color: "#0B1B2A",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 13,
  },
  disciplinaChipActive: {
    border: "2px solid #0A4174",
    background: "rgba(10,65,116,.10)",
    color: "#0A4174",
  },
  successGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 14,
  },
  successItem: {
    padding: 12,
    borderRadius: 14,
    background: "#fff",
    border: "1px solid rgba(11,27,42,.08)",
    display: "grid",
    gap: 6,
  },
  successLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: ".3px",
    color: "rgba(11,27,42,.60)",
    fontWeight: 900,
  },
  successCode: {
    fontSize: 18,
    fontWeight: 950,
    color: "#0B1B2A",
  },
  viewModal: {
    width: "min(680px, 100%)",
    background: "#fff",
    borderRadius: 22,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 24px 70px rgba(0,0,0,.22)",
    padding: 20,
    maxHeight: "92vh",
    overflowY: "auto",
  },
  viewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  viewTitle: {
    fontSize: 24,
    fontWeight: 950,
    color: "#0B1B2A",
  },
  viewSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(11,27,42,.60)",
    fontWeight: 650,
  },
  iconClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.10)",
    background: "#fff",
    color: "#0B1B2A",
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
    lineHeight: 1,
  },
  viewCard: {
    padding: 16,
    borderRadius: 18,
    background:
      "linear-gradient(180deg, rgba(11,27,42,.03), rgba(11,27,42,.01))",
    border: "1px solid rgba(11,27,42,.08)",
    display: "grid",
    gap: 12,
  },
  viewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    paddingBottom: 8,
    borderBottom: "1px solid rgba(11,27,42,.06)",
  },
  viewLabel: {
    fontSize: 13,
    color: "rgba(11,27,42,.60)",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".3px",
  },
  viewValue: {
    color: "#0B1B2A",
    fontWeight: 800,
  },
  viewCode: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
  },
  viewBadgeNeutral: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
  },
  viewBadgeOk: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,.25)",
    background: "rgba(34,197,94,.10)",
    color: "#166534",
    fontWeight: 900,
  },
  viewBadgeWarn: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(245,158,11,.30)",
    background: "rgba(245,158,11,.12)",
    color: "#7C4A03",
    fontWeight: 900,
  },
  viewFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 18,
  },
};