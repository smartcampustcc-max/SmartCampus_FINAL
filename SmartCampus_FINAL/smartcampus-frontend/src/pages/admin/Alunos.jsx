import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  TriangleAlert,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import http from "../../api/http";

export default function Alunos() {
  const [q, setQ] = useState("");
  const [cursoFiltro, setCursoFiltro] = useState("Todos");
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState(0);
  const [showTransferDoc, setShowTransferDoc] = useState(false);

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [successText, setSuccessText] = useState("");

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    nome: "",
    numero_bi: "",
    telefone: "",
    data_nascimento: "",
    genero: "",
    naturalidade: "",
    morada: "",
    nome_pai: "",
    nome_mae: "",
    contacto_encarregado: "",
    tipo_matricula: "Novo ingresso",
    curso_id: "",
    classe: "10",
    ano_letivo: 2025/2026,
    turno_preferido: "",
    status_matricula: "Pendente",
    documento_certificado: null,
    documento_transferencia: null,
  });

  const steps = ["Dados pessoais", "Dados familiares", "Dados académicos", "Documentos"];

  const provincias = [
    "Bengo",
    "Benguela",
    "Bié",
    "Cabinda",
    "Cuando Cubango",
    "Cuanza Norte",
    "Cuanza Sul",
    "Cunene",
    "Huambo",
    "Huíla",
    "Luanda",
    "Lunda Norte",
    "Lunda Sul",
    "Malanje",
    "Moxico",
    "Namibe",
    "Uíge",
    "Zaire",
  ];

  const anosLetivos = [
    "2025/2026",
    "2026/2027",
  ];

  useEffect(() => {
    fetchAlunos();
    fetchCursos();
  }, []);

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

  async function fetchAlunos() {
    setLoading(true);

    try {
      const res = await http.get("/admin/estudantes");
      const raw = res.data;

      const list =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.estudantes) ? raw.estudantes :
        [];

      const mapped = list.map((a) => {
        const cursoNome = a?.curso?.nome || "";
        const cursoCodigo = gerarCodigoCurso(cursoNome);

        return {
          id: a.id,
          nome: a.nome_completo || "",
          numero_bi: a.numero_bi || "",
          telefone: a.telefone || "",
          data_nascimento: a.data_nascimento || "",
          genero: a.sexo || "",
          naturalidade: a.naturalidade || "",
          morada: a.morada || "",
          nome_pai: a.nome_pai || "",
          nome_mae: a.nome_mae || "",
          contacto_encarregado: a.contacto_encarregado || "",
          tipo_matricula: a.tipo_matricula || "Novo ingresso",
          numero_matricula: a.numero_aluno || "",
          curso_id: a.curso_id || "",
          curso_nome: cursoNome,
          curso_codigo: cursoCodigo,
          classe: a.classe || "",
          ano_letivo: a.ano_letivo || "",
          turno_preferido: a.turno_preferido || "",
          status_matricula: a.status_matricula || "Pendente",
          status: a.status_matricula || "Pendente",
        };
      });

      setAlunos(mapped);
    } catch (e) {
      setAlunos([]);
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao carregar matrículas.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchCursos() {
    try {
      const res = await http.get("/admin/cursos");
      const raw = res.data;

      const list =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.cursos) ? raw.cursos :
        [];

      setCursos(list);
    } catch (e) {
      setCursos([]);
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao carregar cursos.",
      });
    }
  }

  function resetForm() {
    setForm({
      nome: "",
      numero_bi: "",
      telefone: "",
      data_nascimento: "",
      genero: "",
      naturalidade: "",
      morada: "",
      nome_pai: "",
      nome_mae: "",
      contacto_encarregado: "",
      tipo_matricula: "Novo ingresso",
      curso_id: "",
      classe: "10",
      ano_letivo: 2025/2026,
      turno_preferido: "",
      status_matricula: "Pendente",
      documento_certificado: null,
      documento_transferencia: null,
    });

    setErrors({});
    setEditingId(null);
    setStep(0);
    setShowTransferDoc(false);
  }

  function openNovaMatricula() {
    resetForm();
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

  function openEditarAluno(aluno) {
    setForm({
      nome: aluno.nome || "",
      numero_bi: aluno.numero_bi || "",
      telefone: aluno.telefone || "",
      data_nascimento: aluno.data_nascimento || "",
      genero: aluno.genero || "",
      naturalidade: aluno.naturalidade || "",
      morada: aluno.morada || "",
      nome_pai: aluno.nome_pai || "",
      nome_mae: aluno.nome_mae || "",
      contacto_encarregado: aluno.contacto_encarregado || "",
      tipo_matricula: aluno.tipo_matricula || "Novo ingresso",
      curso_id: aluno.curso_id || "",
      classe: aluno.classe || "",
      ano_letivo: aluno.ano_letivo || "",
      turno_preferido: aluno.turno_preferido || "",
      status_matricula: aluno.status_matricula || "Pendente",
      documento_certificado: null,
      documento_transferencia: null,
    });

    setErrors({});
    setEditingId(aluno.id);
    setStep(0);
    setShowTransferDoc(aluno.tipo_matricula === "Transferência");
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;

    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    if (Number.isNaN(nascimento.getTime())) return null;

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  function capitalizeWords(value) {
    const lowerWords = ["da", "de", "do", "das", "dos", "e"];

    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/(^|\s|-)([a-zà-ÿ])/g, (match, sep, char) => sep + char.toUpperCase())
      .split(" ")
      .map((word, index) => {
        if (index !== 0 && lowerWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }

        return word;
      })
      .join(" ");
  }

  function onlyLetters(value) {
    const texto = String(value || "").trim();

    if (texto.length < 3) return false;
    if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(texto)) return false;
    if (/(.)\1{3,}/i.test(texto)) return false;

    return true;
  }

  function validarDadosPessoais(newErrors) {
    const nome = form.nome.trim();
    const bi = form.numero_bi.trim().toUpperCase();
    const telefone = form.telefone.trim();
    const naturalidade = form.naturalidade.trim();
    const morada = form.morada.trim();

    if (!nome) {
      newErrors.nome = "Nome obrigatório";
    } else if (nome.split(/\s+/).length < 2) {
      newErrors.nome = "Informe o nome completo";
    } else if (!onlyLetters(nome)) {
      newErrors.nome = "O nome deve conter apenas letras";
    }

    if (!bi) {
      newErrors.numero_bi = "Número do BI obrigatório";
    } else if (!/^\d{9}(LA|ME|ZE|BE|BA|BO|CA|CC|CN|CS|CE|HO|HA|LN|LS|MO|NE|UE)\d{3}$/.test(bi)) {
      newErrors.numero_bi = "BI inválido. Ex: 001132566LA039";
    }

    if (!telefone) {
      newErrors.telefone = "Telefone obrigatório";
    } else if (!/^9[1-9]\d{7}$/.test(telefone)) {
      newErrors.telefone = "Telefone inválido. Ex: 923456789";
    } else if (/^(.)\1{8}$/.test(telefone)) {
      newErrors.telefone = "Telefone inválido";
    }

    if (!form.data_nascimento) {
      newErrors.data_nascimento = "Data de nascimento obrigatória";
    } else {
      const idade = calcularIdade(form.data_nascimento);

      if (idade === null) {
        newErrors.data_nascimento = "Data inválida";
      } else if (idade < 14 || idade > 30) {
        newErrors.data_nascimento = "A idade deve estar entre 14 e 30 anos";
      }
    }

    if (!form.genero) {
      newErrors.genero = "Género obrigatório";
    }

    if (!naturalidade) {
      newErrors.naturalidade = "Naturalidade obrigatória";
    } else if (!provincias.includes(naturalidade)) {
      newErrors.naturalidade = "Selecione uma naturalidade válida";
    }

    if (!morada) {
      newErrors.morada = "Morada obrigatória";
    } else if (morada.length < 5) {
      newErrors.morada = "Morada demasiado curta";
    } else if (!/[A-Za-zÀ-ÿ]{3,}/.test(morada)) {
      newErrors.morada = "Morada deve conter pelo menos um nome/local";
    } else if (!/^[A-Za-zÀ-ÿ0-9\s,.'ºª/-]+$/.test(morada)) {
      newErrors.morada = "Morada inválida";
    } else if (/[-]{2,}/.test(morada)) {
      newErrors.morada = "Morada inválida";
    }
  }

  function validarDadosFamiliares(newErrors) {
    const nomePai = form.nome_pai.trim();
    const nomeMae = form.nome_mae.trim();
    const contacto = form.contacto_encarregado.trim();

    if (!nomePai) {
      newErrors.nome_pai = "Nome do pai obrigatório";
    } else if (!onlyLetters(nomePai)) {
      newErrors.nome_pai = "Nome do pai inválido";
    }

    if (!nomeMae) {
      newErrors.nome_mae = "Nome da mãe obrigatório";
    } else if (!onlyLetters(nomeMae)) {
      newErrors.nome_mae = "Nome da mãe inválido";
    }

    if (!contacto) {
      newErrors.contacto_encarregado = "Contacto do encarregado obrigatório";
    } else if (!/^9[1-9]\d{7}$/.test(contacto)) {
      newErrors.contacto_encarregado = "Contacto inválido. Ex: 923456789";
    } else if (/^(.)\1{8}$/.test(contacto)) {
      newErrors.contacto_encarregado = "Contacto inválido";
    }
  }

  function validarDadosAcademicos(newErrors) {
    const anoAtual = new Date().getFullYear();
    const anoLetivo = String(form.ano_letivo).trim();

    if (!form.tipo_matricula) {
      newErrors.tipo_matricula = "Tipo de matrícula obrigatório";
    }

    if (!String(form.curso_id).trim()) {
      newErrors.curso_id = "Curso obrigatório";
    }

    if (!["10", "11", "12"].includes(String(form.classe))) {
      newErrors.classe = "Selecione 10ª, 11ª ou 12ª classe";
    }

    if (!anoLetivo) {
      newErrors.ano_letivo = "Ano letivo obrigatório";
   } else if (!/^\d{4}\/\d{4}$/.test(anoLetivo)) {
  newErrors.ano_letivo = "Selecione um ano letivo válido";
}

    if (!["Manhã", "Tarde"].includes(form.turno_preferido)) {
      newErrors.turno_preferido = "Selecione Manhã ou Tarde";
    }

    if (
      editingId &&
      !["Pendente", "Ativo", "Transferido", "Cancelado"].includes(form.status_matricula)
    ) {
      newErrors.status_matricula = "Status inválido";
    }
  }

  function validarDocumentos(newErrors) {
    if (!editingId && form.tipo_matricula === "Novo ingresso" && !form.documento_certificado) {
      newErrors.documento_certificado = "Certificado da 9ª classe obrigatório";
    }

    if (!editingId && form.tipo_matricula === "Transferência" && !form.documento_transferencia) {
      newErrors.documento_transferencia = "Documento de transferência obrigatório";
    }
  }

  function validarFormulario() {
    const newErrors = {};

    validarDadosPessoais(newErrors);
    validarDadosFamiliares(newErrors);
    validarDadosAcademicos(newErrors);
    validarDocumentos(newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validarStepAtual() {
    const newErrors = {};

    if (step === 0) validarDadosPessoais(newErrors);
    if (step === 1) validarDadosFamiliares(newErrors);
    if (step === 2) validarDadosAcademicos(newErrors);
    if (step === 3) validarDocumentos(newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  function appendFormData() {
    const fd = new FormData();

    fd.append("nome_completo", form.nome.trim());
    fd.append("numero_bi", form.numero_bi.trim().toUpperCase());
    fd.append("telefone", form.telefone.trim());
    fd.append("data_nascimento", form.data_nascimento);
    fd.append("sexo", form.genero);
    fd.append("naturalidade", form.naturalidade.trim());
    fd.append("morada", form.morada.trim());
    fd.append("nome_pai", form.nome_pai.trim());
    fd.append("nome_mae", form.nome_mae.trim());
    fd.append("contacto_encarregado", form.contacto_encarregado.trim());
    fd.append("tipo_matricula", form.tipo_matricula);
    fd.append("curso_id", Number(form.curso_id));
    fd.append("classe", String(form.classe));
    fd.append("ano_letivo", String(form.ano_letivo));
    fd.append("turno_preferido", form.turno_preferido);
    fd.append("status_matricula", editingId ? form.status_matricula : "Pendente");

    if (form.documento_certificado) {
      fd.append("documento_certificado", form.documento_certificado);
    }

    if (form.documento_transferencia) {
      fd.append("documento_transferencia", form.documento_transferencia);
    }

    return fd;
  }

  async function salvarAluno() {
    setMsg({ type: "", text: "" });

    if (!validarFormulario()) {
      setErrorText("Há campos inválidos. Corrige os dados da matrícula.");
      setOpenErrorModal(true);
      return;
    }

    const payload = appendFormData();

    setLoading(true);

    try {
      if (editingId) {
        await http.post(`/admin/estudantes/${editingId}?_method=PUT`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setSuccessText("Matrícula atualizada com sucesso.");
      } else {
        await http.post("/admin/estudantes", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setSuccessText("Matrícula criada com sucesso. Status inicial: Pendente.");
      }

      await fetchAlunos();
      setOpen(false);
      resetForm();
      setOpenSuccessModal(true);
    } catch (e) {
      const backendErrors = e?.response?.data?.errors;

      if (backendErrors) {
        const newErrors = {};

        Object.keys(backendErrors).forEach((key) => {
          const message = backendErrors[key][0];

          if (key === "nome_completo") newErrors.nome = message;
          else if (key === "sexo") newErrors.genero = message;
          else newErrors[key] = message;
        });

        setErrors(newErrors);
      }

      setErrorText(e?.response?.data?.message || "Erro ao guardar matrícula.");
      setOpenErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  function pedirApagarAluno(id) {
    const aluno = alunos.find((a) => a.id === id);
    if (!aluno) return;

    setAlunoToDelete(aluno);
    setConfirmDeleteOpen(true);
  }

  async function confirmarApagarAluno() {
    if (!alunoToDelete) return;

    try {
      setDeleting(true);

      await http.delete(`/admin/estudantes/${alunoToDelete.id}`);
      await fetchAlunos();

      setConfirmDeleteOpen(false);
      setAlunoToDelete(null);

      setSuccessText("Matrícula apagada com sucesso.");
      setOpenSuccessModal(true);
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao apagar matrícula.");
      setOpenErrorModal(true);
    } finally {
      setDeleting(false);
    }
  }

  function nomeCurto(nome) {
    const partes = String(nome || "").trim().split(/\s+/).filter(Boolean);

    if (partes.length <= 2) return nome;

    return `${partes[0]} ${partes[partes.length - 1]}`;
  }

  function handleTipoMatriculaChange(tipo) {
    setForm((p) => ({
      ...p,
      tipo_matricula: tipo,
      classe: tipo === "Novo ingresso" ? "10" : "",
      documento_transferencia: tipo === "Novo ingresso" ? null : p.documento_transferencia,
    }));

    setShowTransferDoc(tipo === "Transferência");
  }

  const cursosFiltro = useMemo(() => {
    const set = new Set(alunos.map((a) => a.curso_codigo).filter(Boolean));
    return ["Todos", ...Array.from(set)];
  }, [alunos]);

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();

    return alunos.filter((a) => {
      const okCurso = cursoFiltro === "Todos" ? true : a.curso_codigo === cursoFiltro;
      const okStatus = statusFiltro === "Todos" ? true : a.status === statusFiltro;

      const okQ =
        !s ||
        (a.nome || "").toLowerCase().includes(s) ||
        (a.numero_matricula || "").toLowerCase().includes(s) ||
        (a.numero_bi || "").toLowerCase().includes(s) ||
        (a.telefone || "").toLowerCase().includes(s) ||
        (a.curso_codigo || "").toLowerCase().includes(s) ||
        (a.curso_nome || "").toLowerCase().includes(s);

      return okCurso && okStatus && okQ;
    });
  }, [alunos, q, cursoFiltro, statusFiltro]);

  function inputStyle(error) {
    return {
      ...styles.input,
      border: error ? "1px solid #ef4444" : "1px solid rgba(11,27,42,.12)",
    };
  }

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

      {confirmDeleteOpen && (
        <div style={styles.modalBackdrop} onClick={() => setConfirmDeleteOpen(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.confirmIcon}>
              <TriangleAlert size={34} />
            </div>

            <h3 style={{ margin: "0 0 8px", color: "#0B1B2A" }}>Apagar matrícula</h3>

            <p style={{ margin: 0, color: "rgba(11,27,42,.75)", fontWeight: 650, lineHeight: 1.5 }}>
              Tens certeza que queres apagar a matrícula de
              <br />
              <strong>{alunoToDelete?.nome}</strong>?
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setConfirmDeleteOpen(false);
                  setAlunoToDelete(null);
                }}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button style={styles.btnDanger} onClick={confirmarApagarAluno} disabled={deleting}>
                {deleting ? "A apagar..." : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {msg.text && (
        <div
          style={{
            ...styles.alertCard,
            borderLeft: msg.type === "ok" ? "6px solid #16a34a" : "6px solid #ef4444",
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
            <h3 style={{ margin: 0, color: "#0B1B2A", fontSize: 30, fontWeight: 950 }}>
              Matrículas
            </h3>

            <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.62)", fontWeight: 650 }}>
              Gestão das matrículas digitais do Colégio Henriques do Kinaxixi.
            </p>
          </div>

          <div style={styles.topActions}>
            <div style={styles.pill}>
              <Users size={16} />
              <span>{filtrados.length} matrículas</span>
            </div>

            <button onClick={openNovaMatricula} style={styles.btnPrimary}>
              <Plus size={16} />
              <span>Nova matrícula</span>
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
                placeholder="nome, matrícula, BI, telefone, curso..."
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={{ width: 220, minWidth: 220 }}>
            <div style={styles.label}>Curso</div>

            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              style={styles.input}
            >
              {cursosFiltro.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: 220, minWidth: 220 }}>
            <div style={styles.label}>Status</div>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={styles.input}
            >
              <option value="Todos">Todos</option>
              <option value="Pendente">Pendente</option>
              <option value="Ativo">Ativo</option>
              <option value="Transferido">Transferido</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14, overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Matrícula</th>
                <th style={styles.th}>BI</th>
                <th style={styles.th}>Curso</th>
                <th style={styles.th}>Classe</th>
                <th style={styles.th}>Ano letivo</th>
                <th style={styles.th}>Telefone</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, width: 220 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 950 }} title={a.nome}>
                      {nomeCurto(a.nome)}
                    </div>

                    <div style={{ fontSize: 12, color: "rgba(11,27,42,.6)", fontWeight: 650 }}>
                      ID: {a.id}
                    </div>
                  </td>

                  <td style={styles.td}>{a.numero_matricula || "-"}</td>
                  <td style={styles.td}>{a.numero_bi || "-"}</td>

                  <td style={styles.td}>
                    <span style={styles.badge} title={a.curso_nome}>
                      {a.curso_codigo || "-"}
                    </span>
                  </td>

                  <td style={styles.td}>{a.classe ? `${a.classe}ª` : "-"}</td>
                  <td style={styles.td}>{a.ano_letivo || "-"}</td>
                  <td style={styles.td}>{a.telefone || "-"}</td>

                  <td style={styles.td}>
                    {a.status === "Ativo" ? (
                      <span style={styles.badgeOk}>Ativo</span>
                    ) : a.status === "Pendente" ? (
                      <span style={styles.badgeWarn}>Pendente</span>
                    ) : (
                      <span style={styles.badgeDanger}>{a.status}</span>
                    )}
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button onClick={() => openEditarAluno(a)} style={styles.actionEdit}>
                        <Pencil size={14} />
                        <span>Editar</span>
                      </button>

                      <button onClick={() => pedirApagarAluno(a.id)} style={styles.actionDelete}>
                        <Trash2 size={14} />
                        <span>Apagar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 16 }}>
                    <div style={styles.empty}>
                      {loading ? "A carregar..." : "Nenhuma matrícula encontrada."}
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
              <div>
                <h3 style={{ margin: 0, color: "#0B1B2A" }}>
                  {editingId ? "Editar matrícula" : "Nova matrícula"}
                </h3>

                <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.6)", fontWeight: 650 }}>
                  Matrícula digital do aluno.
                </p>
              </div>

              <button style={styles.btnGhost} onClick={() => setOpen(false)}>
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
                <div style={styles.formGrid}>
                  <Field label="Nome completo" error={errors.nome}>
                    <input
                      style={inputStyle(errors.nome)}
                      value={form.nome}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          nome: capitalizeWords(e.target.value),
                        }))
                      }
                      placeholder="Ex: Carlos Manuel"
                    />
                  </Field>

                  <Field label="Número do BI" error={errors.numero_bi}>
                    <input
                      style={inputStyle(errors.numero_bi)}
                      value={form.numero_bi}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          numero_bi: e.target.value.toUpperCase().slice(0, 14),
                        }))
                      }
                      placeholder="Ex: 001132566LA039"
                    />
                  </Field>

                  <Field label="Telefone do aluno" error={errors.telefone}>
                    <input
                      style={inputStyle(errors.telefone)}
                      value={form.telefone}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          telefone: e.target.value.replace(/\D/g, "").slice(0, 9),
                        }))
                      }
                      placeholder="Ex: 923456789"
                    />
                  </Field>

                  <Field label="Data de nascimento" error={errors.data_nascimento}>
                    <input
                      type="date"
                      style={inputStyle(errors.data_nascimento)}
                      value={form.data_nascimento}
                      onChange={(e) => setForm((p) => ({ ...p, data_nascimento: e.target.value }))}
                    />
                  </Field>

                  <Field label="Género" error={errors.genero}>
                    <select
                      style={inputStyle(errors.genero)}
                      value={form.genero}
                      onChange={(e) => setForm((p) => ({ ...p, genero: e.target.value }))}
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </Field>

                  <Field label="Naturalidade" error={errors.naturalidade}>
                    <select
                      style={inputStyle(errors.naturalidade)}
                      value={form.naturalidade}
                      onChange={(e) => setForm((p) => ({ ...p, naturalidade: e.target.value }))}
                    >
                      <option value="">Selecione</option>
                      {provincias.map((provincia) => (
                        <option key={provincia} value={provincia}>
                          {provincia}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Morada" error={errors.morada} full>
                    <input
                      style={inputStyle(errors.morada)}
                      value={form.morada}
                      onChange={(e) => setForm((p) => ({ ...p, morada: e.target.value }))}
                      placeholder="Ex: Rua X, Bairro Y, Luanda"
                    />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div style={styles.formGrid}>
                  <Field label="Nome do pai" error={errors.nome_pai}>
                    <input
                      style={inputStyle(errors.nome_pai)}
                      value={form.nome_pai}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          nome_pai: capitalizeWords(e.target.value),
                        }))
                      }
                      placeholder="Ex: Manuel António"
                    />
                  </Field>

                  <Field label="Nome da mãe" error={errors.nome_mae}>
                    <input
                      style={inputStyle(errors.nome_mae)}
                      value={form.nome_mae}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          nome_mae: capitalizeWords(e.target.value),
                        }))
                      }
                      placeholder="Ex: Maria Joaquina"
                    />
                  </Field>

                  <Field label="Contacto do encarregado" error={errors.contacto_encarregado}>
                    <input
                      style={inputStyle(errors.contacto_encarregado)}
                      value={form.contacto_encarregado}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          contacto_encarregado: e.target.value.replace(/\D/g, "").slice(0, 9),
                        }))
                      }
                      placeholder="Ex: 923456789"
                    />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div style={styles.formGrid}>
                  <Field label="Tipo de matrícula" error={errors.tipo_matricula}>
                    <select
                      style={inputStyle(errors.tipo_matricula)}
                      value={form.tipo_matricula}
                      onChange={(e) => handleTipoMatriculaChange(e.target.value)}
                    >
                      <option value="Novo ingresso">Novo ingresso</option>
                      <option value="Transferência">Transferência</option>
                    </select>
                  </Field>

                  <Field label="Curso" error={errors.curso_id}>
                    <select
                      style={inputStyle(errors.curso_id)}
                      value={form.curso_id}
                      onChange={(e) => setForm((p) => ({ ...p, curso_id: e.target.value }))}
                    >
                      <option value="">Selecione o curso</option>
                      {cursos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {gerarCodigoCurso(c.nome, c.codigo)} - {c.nome}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Classe" error={errors.classe}>
                    <select
                      style={{
                        ...inputStyle(errors.classe),
                        background: form.tipo_matricula === "Novo ingresso" ? "rgba(11,27,42,.04)" : "#fff",
                        color: form.tipo_matricula === "Novo ingresso" ? "rgba(11,27,42,.55)" : "#0B1B2A",
                      }}
                      value={form.classe}
                      disabled={form.tipo_matricula === "Novo ingresso"}
                      onChange={(e) => setForm((p) => ({ ...p, classe: e.target.value }))}
                    >
                      {form.tipo_matricula === "Novo ingresso" ? (
                        <option value="10">10ª classe</option>
                      ) : (
                        <>
                          <option value="">Selecione a classe</option>
                          <option value="10">10ª classe</option>
                          <option value="11">11ª classe</option>
                          <option value="12">12ª classe</option>
                        </>
                      )}
                    </select>
                  </Field>

                 <Field label="Ano letivo" error={errors.ano_letivo}>
  <select
    style={inputStyle(errors.ano_letivo)}
    value={form.ano_letivo}
    onChange={(e) =>
      setForm((p) => ({
        ...p,
        ano_letivo: e.target.value,
      }))
    }
  >
    <option value="">Selecione</option>
    {anosLetivos.map((ano) => (
      <option key={ano} value={ano}>
        {ano}
      </option>
    ))}
  </select>
</Field>



                  <Field label="Turno preferido" error={errors.turno_preferido}>
                    <select
                      style={inputStyle(errors.turno_preferido)}
                      value={form.turno_preferido}
                      onChange={(e) => setForm((p) => ({ ...p, turno_preferido: e.target.value }))}
                    >
                      <option value="">Selecione</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                    </select>
                  </Field>

                  <Field label="Número de matrícula">
                    <input
                      value="Gerado automaticamente"
                      disabled
                      style={{
                        ...styles.input,
                        background: "rgba(11,27,42,.04)",
                        color: "rgba(11,27,42,.55)",
                      }}
                    />
                  </Field>

                  {editingId && (
                    <Field label="Status da matrícula" error={errors.status_matricula}>
                      <select
                        style={inputStyle(errors.status_matricula)}
                        value={form.status_matricula}
                        onChange={(e) => setForm((p) => ({ ...p, status_matricula: e.target.value }))}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Transferido">Transferido</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </Field>
                  )}

                  {!editingId && (
                    <div style={styles.infoBox}>
                      Nova matrícula será criada automaticamente com status <b>Pendente</b>.
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div style={styles.formGrid}>
                  <Field label="Certificado da 9ª classe" error={errors.documento_certificado}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={inputStyle(errors.documento_certificado)}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          documento_certificado: e.target.files?.[0] || null,
                        }))
                      }
                    />
                  </Field>

                  {!showTransferDoc && form.tipo_matricula === "Novo ingresso" ? (
                    <div style={{ display: "flex", alignItems: "end" }}>
                      <button
                        type="button"
                        style={styles.btnPrimary}
                        onClick={() => setShowTransferDoc(true)}
                      >
                        <Plus size={16} />
                        Adicionar transferência
                      </button>
                    </div>
                  ) : (
                    <Field
                      label="Documento de transferência/boletim/carta"
                      error={errors.documento_transferencia}
                    >
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={inputStyle(errors.documento_transferencia)}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            documento_transferencia: e.target.files?.[0] || null,
                          }))
                        }
                      />
                    </Field>
                  )}

                  <div style={styles.infoBox}>
                    Formatos aceites: PDF, JPG, JPEG e PNG até 5MB.
                    <br />
                    Novo ingresso exige certificado da 9ª classe.
                    <br />
                    Transferência exige documento de transferência.
                  </div>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnGhost} onClick={goPrev} disabled={step === 0}>
                <ChevronLeft size={16} />
                Voltar
              </button>

              {step < steps.length - 1 ? (
                <button style={styles.btnPrimary} onClick={goNext}>
                  Avançar
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button style={styles.btnPrimary} onClick={salvarAluno} disabled={loading}>
                  {loading ? "A guardar..." : editingId ? "Guardar alterações" : "Criar matrícula"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, error, children, full }) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : undefined}>
      <div style={styles.label}>{label}</div>
      {children}
      {error && <div style={styles.fieldError}>{error}</div>}
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
    fontWeight: 950,
    whiteSpace: "nowrap",
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
  badgeDanger: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,.25)",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
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
    minWidth: 1100,
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
    maxHeight: "92vh",
    overflowY: "auto",
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
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  fieldError: {
    marginTop: 6,
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: 800,
  },
  stepper: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
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
  infoBox: {
    gridColumn: "1 / -1",
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
};