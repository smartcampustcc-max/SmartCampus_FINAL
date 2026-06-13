import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  UserPlus,
  UserMinus,
  Printer,
  TriangleAlert,
  CheckCircle2,
  XCircle,
  Wand2,
  BookOpen,
} from "lucide-react";
import http from "../../api/http";

export default function Turmas() {
  const [q, setQ] = useState("");
  const [turmas, setTurmas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [openGerir, setOpenGerir] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunosElegiveis, setAlunosElegiveis] = useState([]);
  const [searchAluno, setSearchAluno] = useState("");

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [successText, setSuccessText] = useState("");

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [openDisciplinas, setOpenDisciplinas] = useState(false);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [turmaToDelete, setTurmaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    curso_id: "",
    classe: "",
    turno: "",
    ano_letivo: getAnoLetivoAtual(),
    codigo_turma: "",
    limite_alunos: 35,
    status: "Ativo",
  });

  useEffect(() => {
    fetchTurmas();
    fetchCursos();
  }, []);

  useEffect(() => {
    if (!open) return;

    const curso = cursos.find((c) => Number(c.id) === Number(form.curso_id));
    const codigo = gerarCodigoTurma(curso?.nome);

    setForm((p) => ({ ...p, codigo_turma: codigo }));
  }, [open, form.curso_id, cursos]);

  function getAnoLetivoAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;

    if (mes >= 9) return `${ano}-${ano + 1}`;
    return `${ano - 1}-${ano}`;
  }

  async function fetchTurmas() {
    setLoading(true);

    try {
      const res = await http.get("/admin/turmas");
      const raw = res.data;

      const list =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.turmas) ? raw.turmas :
        [];

      const mapped = list.map((t) => {
        const limite = Number(t.limite_alunos ?? 35);
        const total = Number(t.total_alunos ?? t.estudantes_count ?? 0);
        const vagas = Math.max(0, limite - total);

        return {
          id: t.id,
          nome: t.nome || "",
          codigo_turma: t.codigo_turma || "",
          classe: t.classe || "",
          turno: t.turno || "",
          ano_letivo: t.ano_letivo || "",
          curso_id: t.curso_id || "",
          curso_nome: t?.curso?.nome || "",
          limite_alunos: limite,
          status: t.status || "Ativo",
          total_alunos: total,
          vagas_disponiveis: t.vagas_disponiveis ?? vagas,
        };
      });

      setTurmas(mapped);
      return mapped;
    } catch (e) {
      setTurmas([]);
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao carregar turmas.",
      });
      return [];
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
      curso_id: "",
      classe: "",
      turno: "",
      ano_letivo: getAnoLetivoAtual(),
      codigo_turma: "",
      limite_alunos: 35,
      status: "Ativo",
    });

    setErrors({});
    setEditingId(null);
  }

  function openNovaTurma() {
    resetForm();
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

  function openEditarTurma(turma) {
    setForm({
      curso_id: turma.curso_id || "",
      classe: turma.classe || "",
      turno: turma.turno || "",
      ano_letivo: turma.ano_letivo || getAnoLetivoAtual(),
      codigo_turma: turma.codigo_turma || "",
      limite_alunos: turma.limite_alunos ?? 35,
      status: turma.status || "Ativo",
    });

    setErrors({});
    setEditingId(turma.id);
    setOpen(true);
    setMsg({ type: "", text: "" });
  }

  function abreviarCurso(nomeCurso) {
    const curso = String(nomeCurso || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

    if (curso.includes("ECONOMICAS") || curso.includes("JURIDICAS")) return "CEJ";
    if (curso.includes("FISICAS") || curso.includes("BIOLOGICAS")) return "CFB";

    const palavras = curso.split(/\s+/).filter(Boolean);
    if (palavras.length === 1) return palavras[0].slice(0, 4);

    return palavras.map((p) => p[0]).join("").slice(0, 4);
  }

  function gerarCodigoTurma(cursoNome) {
    const sigla = abreviarCurso(cursoNome);
    if (!sigla) return "";
    return sigla;
  }

  function gerarNomeTurma(cursoNome, classe) {
    const curso = String(cursoNome || "").trim();
    const classeTxt = String(classe || "").trim();

    if (!curso || !classeTxt) return "";

    return `${classeTxt}ª ${curso}`;
  }

  function validarFormulario() {
    const newErrors = {};
    const codigo = String(form.codigo_turma).trim().toUpperCase();
    const capacidade = Number(form.limite_alunos);

    if (!String(form.curso_id).trim()) {
      newErrors.curso_id = "Curso obrigatório";
    }

    if (!["10", "11", "12"].includes(String(form.classe))) {
      newErrors.classe = "Selecione 10ª, 11ª ou 12ª classe";
    }

    if (!["Manhã", "Tarde"].includes(form.turno)) {
      newErrors.turno = "Selecione Manhã ou Tarde";
    }

    if (!/^\d{4}-\d{4}$/.test(String(form.ano_letivo).trim())) {
      newErrors.ano_letivo = "Ano letivo inválido. Use o formato 2025-2026.";
    }

    if (!codigo) {
      newErrors.codigo_turma = "Código da turma obrigatório";
    } else if (!/^[A-Z0-9-]+$/.test(codigo)) {
      newErrors.codigo_turma = "Use apenas letras, números e hífen";
    }

    if (!String(form.limite_alunos).trim()) {
      newErrors.limite_alunos = "Capacidade obrigatória";
    } else if (!/^\d+$/.test(String(form.limite_alunos))) {
      newErrors.limite_alunos = "Capacidade deve ser numérica";
    } else if (capacidade < 15 || capacidade > 35) {
      newErrors.limite_alunos = "A capacidade deve estar entre 15 e 35 alunos";
    }

    if (!["Ativo", "Inativo"].includes(form.status)) {
      newErrors.status = "Status inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function salvarTurma() {
    setMsg({ type: "", text: "" });

    if (!validarFormulario()) return;

    const cursoSelecionadoObj = cursos.find(
      (c) => Number(c.id) === Number(form.curso_id)
    );

    const nomeGerado = gerarNomeTurma(cursoSelecionadoObj?.nome, form.classe);

    const payload = {
      nome: nomeGerado,
      curso_id: Number(form.curso_id),
      classe: String(form.classe).trim(),
      letra: "-",
      turno: form.turno.trim(),
      ano_letivo: String(form.ano_letivo).trim(),
      codigo_turma: String(form.codigo_turma).trim().toUpperCase(),
      limite_alunos: Number(form.limite_alunos),
      status: form.status,
    };

    setLoading(true);

    try {
      if (editingId) {
        await http.put(`/admin/turmas/${editingId}`, payload);
        setSuccessText("Turma atualizada com sucesso.");
      } else {
        await http.post("/admin/turmas", payload);
        setSuccessText("Turma criada com sucesso.");
      }

      await fetchTurmas();
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
      }

      setErrorText(e?.response?.data?.message || "Erro ao guardar turma.");
      setOpenErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  async function abrirGerirAlunos(turma) {
    setTurmaSelecionada(turma);
    setSearchAluno("");
    setOpenGerir(true);
    await fetchAlunosElegiveis(turma.id);
  }

  async function fetchAlunosElegiveis(turmaId) {
    try {
      const res = await http.get(`/admin/turmas/${turmaId}/alunos-elegiveis`);
      const raw = res.data;

      const list =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.alunos) ? raw.alunos :
        [];

      setAlunosElegiveis(list);
    } catch (e) {
      setAlunosElegiveis([]);
      setErrorText(e?.response?.data?.message || "Erro ao carregar alunos da turma.");
      setOpenErrorModal(true);
    }
  }

  async function atualizarTurmaAberta(turmaId) {
    const listaAtualizada = await fetchTurmas();
    const turmaAtualizada = listaAtualizada.find((t) => Number(t.id) === Number(turmaId));

    if (turmaAtualizada) {
      setTurmaSelecionada(turmaAtualizada);
    }
  }

  async function adicionarAluno(alunoId) {
    if (!turmaSelecionada) return;

    if (Number(turmaSelecionada.vagas_disponiveis) <= 0) {
      setErrorText("Esta turma já está lotada.");
      setOpenErrorModal(true);
      return;
    }

    try {
      await http.post(`/admin/turmas/${turmaSelecionada.id}/adicionar-alunos`, {
        alunos_ids: [alunoId],
      });

      await fetchAlunosElegiveis(turmaSelecionada.id);
      await atualizarTurmaAberta(turmaSelecionada.id);

      setMsg({ type: "ok", text: "Aluno adicionado à turma." });
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao adicionar aluno.");
      setOpenErrorModal(true);
    }
  }

  async function removerAluno(alunoId) {
    if (!turmaSelecionada) return;

    try {
      await http.delete(`/admin/turmas/${turmaSelecionada.id}/alunos/${alunoId}`);

      await fetchAlunosElegiveis(turmaSelecionada.id);
      await atualizarTurmaAberta(turmaSelecionada.id);

      setMsg({ type: "ok", text: "Aluno removido da turma." });
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao remover aluno.");
      setOpenErrorModal(true);
    }
  }

  async function preencherAutomatico() {
    if (!turmaSelecionada) return;

    if (Number(turmaSelecionada.vagas_disponiveis) <= 0) {
      setErrorText("Esta turma já está lotada.");
      setOpenErrorModal(true);
      return;
    }

    try {
      const res = await http.post(
        `/admin/turmas/${turmaSelecionada.id}/preencher-automatico`
      );

      await fetchAlunosElegiveis(turmaSelecionada.id);
      await atualizarTurmaAberta(turmaSelecionada.id);

      setSuccessText(
        res?.data?.message ||
          `${res?.data?.adicionados || 0} alunos adicionados com sucesso.`
      );
      setOpenSuccessModal(true);
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao preencher vagas.");
      setOpenErrorModal(true);
    }
  }

  async function abrirDisciplinas(turma) {
    setTurmaSelecionada(turma);
    setOpenDisciplinas(true);

    try {
      const todas = await http.get("/admin/disciplinas");
      const vinculadas = await http.get(`/admin/turmas/${turma.id}/disciplinas`);

      const listaTodas = Array.isArray(todas.data) ? todas.data : [];
      const listaVinculadas = Array.isArray(vinculadas.data) ? vinculadas.data : [];

      setDisciplinas(listaTodas);
      setDisciplinasSelecionadas(listaVinculadas.map((d) => d.id));
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao carregar disciplinas da turma.");
      setOpenErrorModal(true);
    }
  }

  function toggleDisciplina(id) {
    setDisciplinasSelecionadas((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  async function guardarDisciplinasTurma() {
    if (!turmaSelecionada?.id) {
      setErrorText("Nenhuma turma selecionada.");
      setOpenErrorModal(true);
      return;
    }

    if (disciplinasSelecionadas.length < 2) {
      setErrorText("Seleciona pelo menos 2 disciplinas para esta turma.");
      setOpenErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      await http.post(`/admin/turmas/${turmaSelecionada.id}/disciplinas`, {
        disciplinas: disciplinasSelecionadas.map((id) => Number(id)),
      });

      await fetchTurmas();

      setOpenDisciplinas(false);
      setSuccessText("Disciplinas da turma atualizadas com sucesso.");
      setOpenSuccessModal(true);
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao guardar disciplinas da turma.");
      setOpenErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  function pedirApagarTurma(id) {
    const turma = turmas.find((t) => t.id === id);
    if (!turma) return;

    setTurmaToDelete(turma);
    setConfirmDeleteOpen(true);
  }

  async function confirmarApagarTurma() {
    if (!turmaToDelete) return;

    try {
      setDeleting(true);
      await http.delete(`/admin/turmas/${turmaToDelete.id}`);
      await fetchTurmas();

      setConfirmDeleteOpen(false);
      setTurmaToDelete(null);

      setSuccessText("Turma apagada com sucesso.");
      setOpenSuccessModal(true);
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao apagar turma.");
      setOpenErrorModal(true);
    } finally {
      setDeleting(false);
    }
  }

  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();

    return turmas.filter((t) => {
      return (
        !s ||
        (t.nome || "").toLowerCase().includes(s) ||
        (t.codigo_turma || "").toLowerCase().includes(s) ||
        (t.curso_nome || "").toLowerCase().includes(s) ||
        String(t.classe || "").toLowerCase().includes(s) ||
        String(t.turno || "").toLowerCase().includes(s) ||
        String(t.ano_letivo || "").toLowerCase().includes(s)
      );
    });
  }, [turmas, q]);

  const alunosFiltrados = useMemo(() => {
    const s = searchAluno.trim().toLowerCase();

    return alunosElegiveis.filter((a) => {
      const nome = (a.nome_completo || "").toLowerCase();
      const matricula = (a.numero_aluno || "").toLowerCase();
      const telefone = (a.telefone || "").toLowerCase();

      return !s || nome.includes(s) || matricula.includes(s) || telefone.includes(s);
    });
  }, [alunosElegiveis, searchAluno]);

  const alunosNaTurma = useMemo(() => {
    if (!turmaSelecionada) return [];
    return alunosFiltrados.filter(
      (a) => Number(a.sala_de_aula_id) === Number(turmaSelecionada.id)
    );
  }, [alunosFiltrados, turmaSelecionada]);

  const alunosDisponiveis = useMemo(() => {
    return alunosFiltrados.filter((a) => !a.sala_de_aula_id);
  }, [alunosFiltrados]);

  const totalTurmas = turmas.length;
  const turmasAtivas = turmas.filter((t) => t.status === "Ativo").length;
  const totalAlunos = turmas.reduce((acc, t) => acc + Number(t.total_alunos || 0), 0);
  const totalVagas = turmas.reduce((acc, t) => acc + Number(t.vagas_disponiveis || 0), 0);


async function imprimirLista(turma) {
  try {
    const res = await http.get(`/admin/turmas/${turma.id}`);

    const turmaCompleta = res.data;
    const alunos = Array.isArray(turmaCompleta.estudantes)
      ? [...turmaCompleta.estudantes].sort((a,b) => 
        String(a.nome_completo || "").localeCompare
        (String(b.nome_completo || ""),"pt"))
      : [];

      if (alunos.length === 0) {
        setErrorText("Não é possivel imprimir a lista de presença ,porque esta turma ainda não possui alunos.");
        setOpenErrorModal(true);
        return;
      }

    const win = window.open("", "_blank");

    win.document.write(`
      <html>
        <head>
          <title>Lista de Presença</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            h2, h3, p { margin: 0 0 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 9px; text-align: left; font-size: 13px; height: 28px;}
            th { background: #f3f4f6; }
          </style>
        </head>

        <body>
         <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
  <img src="${window.location.origin}/logo.png" style="width:70px;height:70px;object-fit:contain;" />
  <div>
    <h2 style="margin:0;">Colégio Henriques</h2>
    <h3 style="margin:4px 0 0;">Lista de Presença</h3>
  </div>
</div>
          <p><strong>Turma:</strong> ${turmaCompleta.nome || turmaCompleta.codigo_turma || "-"}</p>
           <p><strong>Turno:</strong> ${turmaCompleta.turno || "-"}</p>
          <p><strong>Ano lectivo:</strong> ${turmaCompleta.ano_letivo || "-"}</p>
          <p><strong>Total de alunos:</strong> ${alunos.length}</p>

          <table>

            <thead>
              <tr>
                <th>Nº</th>
                <th>Nome do aluno</th>
                <th>Nº de matrícula</th>
                <th>Presença</th>
                <th>Observação</th>
              </tr>
            </thead>

            <tbody>
              ${alunos.map((a, i) => `
                <tr>
                  <td>${a.numero_turma || i + 1}</td>
                  <td>${a.nome_completo || a.name || "-"}</td>
                  <td>${a.numero_aluno || a.numero_matricula || "-"}</td>
                  <td></td>
                  <td></td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div style="margin-top:70px;display:flex;justify-content:space-between;text-align:center;">
  <div>
    ___________________________<br/>
    Diretor de Turma
  </div>

  <div>
    ___________________________<br/>
    Professor(a)
  </div>
</div>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
  } catch (e) {
    setErrorText("Erro ao carregar alunos da turma para impressão.");
    setOpenErrorModal(true);
  }
}
  return (
    <div>
      {msg.text && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 12,
            background:
              msg.type === "ok"
                ? "rgba(34,197,94,.12)"
                : "rgba(239,68,68,.12)",
            border:
              msg.type === "ok"
                ? "1px solid rgba(34,197,94,.25)"
                : "1px solid rgba(239,68,68,.25)",
            color: msg.type === "ok" ? "#166534" : "#B91C1C",
            fontWeight: 800,
          }}
        >
          {msg.text}
        </div>
      )}

      <div style={styles.mainCard}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={{ margin: 0, color: "#0B1B2A", fontSize: 20, fontWeight: 950 }}>
              Gestão das turmas do Colégio Henriques do Kinaxixi
            </h3>
          </div>

          <button onClick={openNovaTurma} style={styles.btnPrimary}>
            <Plus size={16} />
            <span>Nova turma</span>
          </button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total de turmas</div>
            <div style={styles.statValue}>{totalTurmas}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Turmas ativas</div>
            <div style={styles.statValue}>{turmasAtivas}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total de alunos</div>
            <div style={styles.statValue}>{totalAlunos}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Vagas disponíveis</div>
            <div style={styles.statValue}>{totalVagas}</div>
          </div>
        </div>

        <div style={styles.filters}>
          <div style={{ flex: 1 }}>
            <div style={styles.label}>Pesquisar turma</div>
            <div style={styles.searchWrap}>
              <Search size={16} color="rgba(11,27,42,.45)" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="código, curso, classe, turno..."
                style={styles.searchInput}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, overflowX: "auto" }}>
          <table style={{ ...styles.table, minWidth: 1100 }}>
            <thead>
              <tr>
                <th style={styles.th}>Turma</th>
                <th style={styles.th}>Turno</th>
                <th style={styles.th}>Ano letivo</th>
                <th style={styles.th}>Ocupação</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, width: 320, textAlign: "right" }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map((t) => {
                const limite = Number(t.limite_alunos || 1);
                const total = Number(t.total_alunos || 0);
                const percentagem = Math.min(100, Math.round((total / limite) * 100));
                const lotada = Number(t.vagas_disponiveis || 0) <= 0;

                return (
                  <tr key={t.id}>
                    <td style={styles.td}>
                      <span
                        title={`${t.classe}ª ${t.curso_nome}`}
                        style={styles.codigoTexto}
                      >
                        {t.codigo_turma || "-"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {t.turno === "Manhã" ? (
                        <span style={styles.turnoManha}>Manhã</span>
                      ) : (
                        <span style={styles.turnoTarde}>Tarde</span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badge}>{t.ano_letivo || "-"}</span>
                    </td>

                    <td style={styles.td}>
                      <div style={{ minWidth: 190 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                            fontSize: 13,
                            fontWeight: 800,
                          }}
                        >
                          <span>
                            {t.total_alunos}/{t.limite_alunos} alunos
                          </span>
                          <span>{percentagem}%</span>
                        </div>

                        <div style={styles.progressBg}>
                          <div style={{ ...styles.progressFill, width: `${percentagem}%` }} />
                        </div>

                        <div
                          style={{
                            marginTop: 5,
                            fontSize: 12,
                            color: lotada ? "#B91C1C" : "rgba(11,27,42,.58)",
                            fontWeight: 800,
                          }}
                        >
                          {lotada ? "Turma lotada" : `${t.vagas_disponiveis} vagas disponíveis`}
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      {t.status === "Ativo" ? (
                        <span style={styles.badgeOk}>● Ativa</span>
                      ) : (
                        <span style={styles.badgeWarn}>● Inativa</span>
                      )}
                    </td>

                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={styles.actionsRight}>
                        <button onClick={() => openEditarTurma(t)} style={styles.actionEdit}>
                          <Pencil size={14} />
                          <span>Editar</span>
                        </button>

                          <button onClick={() => imprimirLista(t)} style={styles.actionPrint}>
                          <Printer size={14} />
                          <span>Imprimir Lista</span>
                        </button>

                        <button onClick={() => abrirGerirAlunos(t)} style={styles.actionManage}>
                          <Users size={14} />
                          <span>Alunos</span>
                        </button>

                        <button onClick={() => abrirDisciplinas(t)} style={styles.actionManage}>
                          <BookOpen size={14} />
                          <span>Disciplinas</span>
                        </button>

                        <button onClick={() => pedirApagarTurma(t.id)} style={styles.actionDelete}>
                          <Trash2 size={14} />
                          <span>Apagar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 16 }}>
                    <div style={styles.empty}>
                      {loading ? "A carregar..." : "Nenhuma turma encontrada."}
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
                {editingId ? "Editar turma" : "Nova turma"}
              </h3>

              <button style={styles.btnGhost} onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={styles.label}>Curso</div>
                  <select
                    style={{
                      ...styles.input,
                      border: errors.curso_id
                        ? "1px solid #ef4444"
                        : "1px solid rgba(11,27,42,.12)",
                    }}
                    value={form.curso_id}
                    onChange={(e) => setForm((p) => ({ ...p, curso_id: e.target.value }))}
                  >
                    <option value="">Selecione o curso</option>
                    {cursos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                  {errors.curso_id && <div style={styles.fieldError}>{errors.curso_id}</div>}
                </div>

                <div>
                  <div style={styles.label}>Classe</div>
                  <select
                    style={{
                      ...styles.input,
                      border: errors.classe
                        ? "1px solid #ef4444"
                        : "1px solid rgba(11,27,42,.12)",
                    }}
                    value={form.classe}
                    onChange={(e) => setForm((p) => ({ ...p, classe: e.target.value }))}
                  >
                    <option value="">Selecione a classe</option>
                    <option value="10">10ª classe</option>
                    <option value="11">11ª classe</option>
                    <option value="12">12ª classe</option>
                  </select>
                  {errors.classe && <div style={styles.fieldError}>{errors.classe}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={styles.label}>Turno</div>
                  <select
                    style={{
                      ...styles.input,
                      border: errors.turno
                        ? "1px solid #ef4444"
                        : "1px solid rgba(11,27,42,.12)",
                    }}
                    value={form.turno}
                    onChange={(e) => setForm((p) => ({ ...p, turno: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                  {errors.turno && <div style={styles.fieldError}>{errors.turno}</div>}
                </div>

                <div>
                  <div style={styles.label}>Ano letivo</div>
                  <input
                    readOnly
                    style={{
                      ...styles.input,
                      background: "rgba(11,27,42,.04)",
                      color: "rgba(11,27,42,.65)",
                      border: errors.ano_letivo
                        ? "1px solid #ef4444"
                        : "1px solid rgba(11,27,42,.12)",
                    }}
                    value={form.ano_letivo}
                  />
                  {errors.ano_letivo && <div style={styles.fieldError}>{errors.ano_letivo}</div>}
                </div>
              </div>

              <div>
                <div style={styles.label}>Código da turma</div>
                <input
                  readOnly
                  style={{
                    ...styles.input,
                    background: "rgba(11,27,42,.04)",
                    color: "rgba(11,27,42,.65)",
                    border: errors.codigo_turma
                      ? "1px solid #ef4444"
                      : "1px solid rgba(11,27,42,.12)",
                  }}
                  value={form.codigo_turma}
                  placeholder="Gerado automaticamente pelo curso"
                />
                {errors.codigo_turma && (
                  <div style={styles.fieldError}>{errors.codigo_turma}</div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={styles.label}>Capacidade da turma</div>
                  <input
                    type="number"
                    min="15"
                    max="35"
                    style={{
                      ...styles.input,
                      border: errors.limite_alunos
                        ? "1px solid #ef4444"
                        : "1px solid rgba(11,27,42,.12)",
                    }}
                    value={form.limite_alunos}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        limite_alunos: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="Ex: 35"
                  />
                  {errors.limite_alunos && (
                    <div style={styles.fieldError}>{errors.limite_alunos}</div>
                  )}
                </div>

                <div>
                  <div style={styles.label}>Status</div>
                  <select
                    style={styles.input}
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <button style={styles.btnPrimary} onClick={salvarTurma} disabled={loading}>
                {loading ? "A guardar..." : editingId ? "Guardar alterações" : "Criar turma"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openDisciplinas && turmaSelecionada && (
        <div style={styles.modalBackdrop} onClick={() => setOpenDisciplinas(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: "#0B1B2A" }}>
                  Disciplinas da turma
                </h3>
                <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
                  {turmaSelecionada.codigo_turma} — {turmaSelecionada.classe}ª {turmaSelecionada.curso_nome}
                </p>
              </div>

              <button style={styles.btnGhost} onClick={() => setOpenDisciplinas(false)}>
                Fechar
              </button>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={styles.label}>
                Seleciona pelo menos 2 disciplinas
              </div>

              <div style={styles.disciplinasGrid}>
                {disciplinas.map((d) => (
                  <label key={d.id} style={styles.disciplinaItem}>
                    <input
                      type="checkbox"
                      checked={disciplinasSelecionadas.includes(d.id)}
                      onChange={() => toggleDisciplina(d.id)}
                    />
                    <span>
                      <strong>{d.nome}</strong>
                      <small>{d.codigo || "Sem código"} • {d.carga_horaria || 1}h</small>
                    </span>
                  </label>
                ))}
              </div>

              <div style={{ marginTop: 12, fontWeight: 800, color: "rgba(11,27,42,.65)" }}>
                {disciplinasSelecionadas.length} disciplinas selecionadas
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <button
                type="button"
                style={styles.btnPrimary}
                onClick={guardarDisciplinasTurma}
                disabled={loading}
              >
                {loading ? "A guardar..." : "Guardar disciplinas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openGerir && turmaSelecionada && (
        <div style={styles.modalBackdrop} onClick={() => setOpenGerir(false)}>
          <div style={styles.largeModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: "#0B1B2A" }}>Gerir alunos da turma</h3>
                <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
                  {turmaSelecionada.codigo_turma} — {turmaSelecionada.classe}ª {turmaSelecionada.curso_nome}
                </p>
              </div>

              <button style={styles.btnGhost} onClick={() => setOpenGerir(false)}>
                Fechar
              </button>
            </div>

            <div style={styles.turmaInfoGrid}>
              <div style={styles.infoBox}>
                <span>Curso</span>
                <strong>{turmaSelecionada.curso_nome}</strong>
              </div>

              <div style={styles.infoBox}>
                <span>Classe</span>
                <strong>{turmaSelecionada.classe}ª</strong>
              </div>

              <div style={styles.infoBox}>
                <span>Ano letivo</span>
                <strong>{turmaSelecionada.ano_letivo}</strong>
              </div>

              <div style={styles.infoBox}>
                <span>Ocupação</span>
                <strong>
                  {turmaSelecionada.total_alunos} / {turmaSelecionada.limite_alunos}
                </strong>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={styles.label}>Pesquisar aluno</div>
              <div style={styles.searchWrap}>
                <Search size={16} color="rgba(11,27,42,.45)" />
                <input
                  value={searchAluno}
                  onChange={(e) => setSearchAluno(e.target.value)}
                  placeholder="nome, matrícula ou telefone..."
                  style={styles.searchInput}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button
                style={{
                  ...styles.btnPrimary,
                  opacity: Number(turmaSelecionada.vagas_disponiveis || 0) <= 0 ? 0.55 : 1,
                  cursor: Number(turmaSelecionada.vagas_disponiveis || 0) <= 0 ? "not-allowed" : "pointer",
                }}
                onClick={preencherAutomatico}
                disabled={Number(turmaSelecionada.vagas_disponiveis || 0) <= 0}
              >
                <span>
                  {Number(turmaSelecionada.vagas_disponiveis || 0) <= 0
                    ? "Turma lotada"
                    : "Enturmar Alunos"}
                </span>
              </button>
            </div>

            <div style={styles.alunosGrid}>
              <div style={styles.alunosBox}>
                <h4 style={styles.boxTitle}>Alunos na turma</h4>

                {alunosNaTurma.length === 0 ? (
                  <div style={styles.empty}>Nenhum aluno nesta turma.</div>
                ) : (
                  alunosNaTurma.map((a) => (
                    <div key={a.id} style={styles.alunoItem}>
                      <div>
                        <strong> Nº {a.numero_turma || "-"}-{a.nome_completo}</strong>
                        <div style={styles.alunoMeta}>
                          {a.numero_aluno} • {a.telefone}
                        </div>
                      </div>

                      <button style={styles.actionDelete} onClick={() => removerAluno(a.id)}>
                        <UserMinus size={14} />
                        <span>Remover</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={styles.alunosBox}>
                <h4 style={styles.boxTitle}>Alunos disponíveis</h4>

                {alunosDisponiveis.length === 0 ? (
                  <div style={styles.empty}>Nenhum aluno disponível para esta turma.</div>
                ) : (
                  alunosDisponiveis.map((a) => (
                    <div key={a.id} style={styles.alunoItem}>
                      <div>
                        <strong>{a.nome_completo}</strong>
                        <div style={styles.alunoMeta}>
                          {a.numero_aluno} • {a.telefone}
                        </div>
                      </div>

                      <button
                        style={{
                          ...styles.actionManage,
                          opacity: Number(turmaSelecionada.vagas_disponiveis || 0) <= 0 ? 0.45 : 1,
                          cursor: Number(turmaSelecionada.vagas_disponiveis || 0) <= 0 ? "not-allowed" : "pointer",
                        }}
                        onClick={() => adicionarAluno(a.id)}
                        disabled={Number(turmaSelecionada.vagas_disponiveis || 0) <= 0}
                      >
                        <UserPlus size={14} />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteOpen && (
        <div style={styles.alertBackdrop} onClick={() => setConfirmDeleteOpen(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.confirmIcon}>
              <TriangleAlert size={34} />
            </div>

            <h3 style={{ margin: "0 0 8px", color: "#0B1B2A" }}>Apagar turma</h3>
            <p style={{ margin: 0, color: "rgba(11,27,42,.75)", fontWeight: 650, lineHeight: 1.5 }}>
              Tens certeza que queres apagar a turma
              <br />
              <strong>{turmaToDelete?.codigo_turma} - {turmaToDelete?.curso_nome}</strong>?
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setConfirmDeleteOpen(false);
                  setTurmaToDelete(null);
                }}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button style={styles.btnDanger} onClick={confirmarApagarTurma} disabled={deleting}>
                {deleting ? "A apagar..." : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openSuccessModal && (
        <div style={styles.alertBackdrop} onClick={() => setOpenSuccessModal(false)}>
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

      {openErrorModal && (
        <div style={styles.alertBackdrop} onClick={() => setOpenErrorModal(false)}>
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
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 16,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(11,27,42,.03)",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(11,27,42,.60)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".3px",
  },
  statValue: {
    marginTop: 6,
    fontSize: 28,
    color: "#0B1B2A",
    fontWeight: 950,
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
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  codigoTexto: {
    fontWeight: 950,
    color: "#0B1B2A",
    cursor: "help",
    whiteSpace: "nowrap",
  },
  turnoManha: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(245,158,11,.25)",
    background: "rgba(245,158,11,.10)",
    color: "#7C4A03",
    fontWeight: 900,
  },
  turnoTarde: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(249,115,22,.25)",
    background: "rgba(249,115,22,.10)",
    color: "#9A3412",
    fontWeight: 900,
  },
  progressBg: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "rgba(11,27,42,.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "rgba(37,99,235,.55)",
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
  actionsRight: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
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
  alertBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 20000,
  },
  modal: {
    width: "min(780px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    padding: 16,
    maxHeight: "92vh",
    overflowY: "auto",
  },
  largeModal: {
    width: "min(980px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    padding: 16,
    maxHeight: "92vh",
    overflowY: "auto",
  },
  actionPrint: {
  border: "none",
  background: "transparent",
  color: "#059669",
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: 0,
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
  turmaInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginTop: 16,
  },
  infoBox: {
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(11,27,42,.03)",
    display: "grid",
    gap: 4,
  },
  alunosGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginTop: 16,
  },
  alunosBox: {
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 16,
    padding: 12,
    background: "#fff",
    minHeight: 220,
  },
  boxTitle: {
    margin: "0 0 10px",
    color: "#0B1B2A",
    fontWeight: 950,
  },
  alunoItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    borderBottom: "1px solid rgba(11,27,42,.06)",
    padding: "10px 0",
  },
  alunoMeta: {
    fontSize: 12,
    color: "rgba(11,27,42,.62)",
    fontWeight: 700,
    marginTop: 3,
  },
  disciplinasGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 10,
  },
  disciplinaItem: {
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "rgba(11,27,42,.03)",
    cursor: "pointer",
  },
};