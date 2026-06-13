import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, History ,} from "lucide-react";
import http from "../../api/http";
export default function TurmaDisciplina() {
  const { turmaId, disciplinaId } = useParams();
  const [activeTab, setActiveTab] = useState("materiais");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [atribuicao, setAtribuicao] = useState(null);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [mensagensChat, setMensagensChat] = useState([]);
const [novaMensagem, setNovaMensagem] = useState("");
const [loadingChat, setLoadingChat] = useState(false);
const [sendingChat, setSendingChat] = useState(false);
   const [erroFaltaModal, setErroFaltaModal] = useState(false);
const [historicoFaltas, setHistoricoFaltas] = useState([]);
const [historicoAluno, setHistoricoAluno] = useState(null);
const [aulasHorario, setAulasHorario] = useState([]);
const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [materiais, setMateriais] = useState([]);
  const [alunos, setAlunos] = useState([]);
 const [faltaModalOpen, setFaltaModalOpen] = useState(false);
const [alunoFalta, setAlunoFalta] = useState(null);
const [temposAula, setTemposAula] = useState([]);
const [dataFalta, setDataFalta] = useState(new Date().toISOString().split("T")[0]);
const [savingFalta, setSavingFalta] = useState(false);
const [justificarOpen, setJustificarOpen] = useState(false);
const [faltaParaJustificar, setFaltaParaJustificar] = useState(null);
const [motivoJustificacao, setMotivoJustificacao] = useState("");
const [savingJustificacao, setSavingJustificacao] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
const [successText, setSuccessText] = useState("");
const [openErrorModal, setOpenErrorModal] = useState(false);
const [errorText, setErrorText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [visualizacoesOpen, setVisualizacoesOpen] = useState(false);
  const [visualizacoesData, setVisualizacoesData] = useState(null);
  const [visualizacoesLoading, setVisualizacoesLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    tipo: "PDF",
    url: "",
    descricao: "",
    ficheiro: null,
  });
  async function carregarDados() {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
     const [atrRes, matRes] = await Promise.all([
  http.get("/professor/minhas-atribuicoes"),
  http.get("/professor/materiais"),
]);
      const atribuicoes = Array.isArray(atrRes.data?.atribuicoes)
        ? atrRes.data.atribuicoes
        : [];
      const atual = atribuicoes.find(
        (a) =>
          String(a.turma_id) === String(turmaId) &&
          String(a.disciplina_id) === String(disciplinaId)
      );
      setAtribuicao(atual || null);
      const aulas = Array.isArray(atrRes.data?.proximas_aulas)
  ? atrRes.data.proximas_aulas
  : [];

const aulasDestaDisciplina = aulas.filter(
  (a) =>
    String(a.turma_id) === String(turmaId) &&
    String(a.disciplina_id) === String(disciplinaId)
);

setAulasHorario(aulasDestaDisciplina);
      const listaMateriais = Array.isArray(matRes.data) ? matRes.data : [];
      const filtrados = listaMateriais.filter(
        (m) =>
          String(m.turma_id) === String(turmaId) &&
          String(m.disciplina_id) === String(disciplinaId)
      );
      setMateriais(filtrados);
    } catch (e) {
      setMsg({
        type: "error",
        text:
          e?.response?.data?.message ||
          "Erro ao carregar dados desta turma/disciplina.",
      });
    } finally {
      setLoading(false);
    }
  }
function abrirModalFalta(aluno) {
  setAlunoFalta(aluno);
  setTemposAula([]);
  setDataFalta(new Date().toISOString().split("T")[0]);
  setFaltaModalOpen(true);
  setErroFaltaModal("");
}

   async function guardarFalta() {
  if (!alunoFalta) return;

  if (!dataFalta) {
    setErrorText("Seleciona a data da falta.");
    setOpenErrorModal(true);
    return;
  }

  if (temposAula.length === 0) {
    setErrorText("Seleciona pelo menos um tempo.");
    setOpenErrorModal(true);
    return;
  }

  if (temposAula.length > 2) {
    setErrorText("Só podes selecionar até 2 tempos.");
    setOpenErrorModal(true);
    return;
  }

  try {
    setSavingFalta(true);

   for (const horarioId of temposAula) {
  const aula = aulasHorario.find((a) => String(a.id) === String(horarioId));

  await http.post("/professor/faltas", {
    estudante_id: alunoFalta.id,
    turma_id: turmaId,
    disciplina_id: disciplinaId,
    data: dataFalta,
    tempo_aula: aula?.tempo,
    observacao: aula
      ? `${aula.dia} • ${aula.hora} - ${aula.hora_fim}`
      : null,
  });
}

    setFaltaModalOpen(false);
    setAlunoFalta(null);
    setTemposAula([]);

    await carregarAlunos();

    setSuccessText("Falta registada com sucesso.");
    setOpenSuccessModal(true);
  } catch (e) {
    setErrorText(
      e?.response?.data?.message || "Erro ao guardar falta."
    );

    setOpenErrorModal(true);
  } finally {
    setSavingFalta(false);
  }
}
  async function carregarAlunos() {
  try {
    const res = await http.get(`/professor/turmas/${turmaId}/alunos?disciplina_id=${disciplinaId}`);

    const lista = Array.isArray(res.data) ? res.data : [];

    const ordenados = [...lista].sort((a, b) =>
      String(a.nome_completo || "").localeCompare(
        String(b.nome_completo || ""),
        "pt"
      )
    );

    setAlunos(ordenados);
  } catch (e) {
    setAlunos([]);
    setMsg({
      type: "error",
      text: e?.response?.data?.message || "Erro ao carregar alunos da turma.",
    });
  }
}
  useEffect(() => {
    carregarDados();
    carregarAlunos();
    carregarChat();
  }, [turmaId, disciplinaId]);
  const turmaNome =
    atribuicao?.turma?.nome ||
    atribuicao?.turma?.name ||
    `Turma #${turmaId}`;
  const disciplinaNome =
    atribuicao?.disciplina?.nome ||
    atribuicao?.disciplina?.name ||
    `Disciplina #${disciplinaId}`;

       useEffect(() => {
  window.dispatchEvent(
    new CustomEvent("professor-header", {
      detail: {
        title: turmaNome,
        subtitle: disciplinaNome,
      },
    })
  );
}, [turmaNome, disciplinaNome]);

  function resetForm() {
    setForm({
      titulo: "",
      tipo: "PDF",
      url: "",
      descricao: "",
      ficheiro: null,
    });
  }
  async function salvarMaterial() {
    if (!form.titulo.trim()) {
      setMsg({ type: "error", text: "Informe o título do material." });
      return;
    }
    if ((form.tipo === "Link" || form.tipo === "YouTube") && !form.url.trim()) {
      setMsg({ type: "error", text: "Informe o link do material." });
      return;
    }
    const fd = new FormData();
    fd.append("turma_id", turmaId);
    fd.append("disciplina_id", disciplinaId);
    fd.append("titulo", form.titulo.trim());
    fd.append("tipo", form.tipo);
    fd.append("descricao", form.descricao.trim());
    if (form.url.trim()) {
      fd.append("url", form.url.trim());
    }
    if (form.ficheiro) {
      fd.append("ficheiro", form.ficheiro);
    }
    try {
      setSaving(true);
      await http.post("/professor/materiais", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg({ type: "success", text: "Material publicado com sucesso." });
      setOpenModal(false);
      resetForm();
      await carregarDados();
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao publicar material.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function abrirHistorico(aluno) {
  try {
    setHistoricoAluno(aluno);
    setHistoricoOpen(true);
    setLoadingHistorico(true);

    const res = await http.get(
      `/professor/alunos/${aluno.id}/faltas`
    );

    const lista = Array.isArray(res.data) ? res.data : [];

    setHistoricoFaltas(lista);
  } catch (e) {
    setErrorText(
      e?.response?.data?.message ||
        "Erro ao carregar histórico de faltas."
    );

    setOpenErrorModal(true);
  } finally {
    setLoadingHistorico(false);
  }
}

async function removerFaltaHistorico(faltaId) {
  if (!window.confirm("Tens certeza que deseja remover esta falta?")) return;

  try {
    await http.delete(`/professor/faltas/${faltaId}`);

    setHistoricoFaltas((prev) => prev.filter((f) => f.id !== faltaId));

    await carregarAlunos();
    
    setHistoricoOpen(false);
    setSuccessText("Falta removida com sucesso.");
    setOpenSuccessModal(true);
  } catch (e) {
    setErrorText(
      e?.response?.data?.message || "Erro ao remover falta."
    );
    setOpenErrorModal(true);
  }
}
  async function apagarMaterial(id) {
    if (!window.confirm("Tens certeza que queres apagar este material?")) return;
    try {
      await http.delete(`/professor/materiais/${id}`);
      setMsg({ type: "success", text: "Material apagado com sucesso." });
      await carregarDados();
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao apagar material.",
      });
    }
  }
  async function verVisualizacoes(material) {
    setVisualizacoesOpen(true);
    setVisualizacoesLoading(true);
    setVisualizacoesData({
      material,
      total_alunos: 0,
      total_visualizacoes: 0,
      visualizacoes: [],
    });
    try {
      const res = await http.get(
        `/professor/materiais/${material.id}/visualizacoes`
      );
      setVisualizacoesData({
        material,
        total_alunos: res.data?.total_alunos || 0,
        total_visualizacoes: res.data?.total_visualizacoes || 0,
        visualizacoes: Array.isArray(res.data?.visualizacoes)
          ? res.data.visualizacoes
          : [],
      });
    } catch (e) {
      setMsg({
        type: "error",
        text:
          e?.response?.data?.message ||
          "Erro ao carregar quem abriu o material.",
      });
    } finally {
      setVisualizacoesLoading(false);
    }
  }
  const totalAbriram = visualizacoesData?.total_visualizacoes || 0;
  const totalAlunos = visualizacoesData?.total_alunos || 0;
  const totalNaoAbriram = Math.max(totalAlunos - totalAbriram, 0);

  async function carregarChat() {
  try {
    setLoadingChat(true);

    const res = await http.get(
      `/professor/chat/mensagens?turma_id=${turmaId}&disciplina_id=${disciplinaId}`
    );

    setMensagensChat(Array.isArray(res.data) ? res.data : []);
  } catch (e) {
    setErrorText("Erro ao carregar mensagens do chat.");
    setOpenErrorModal(true);
  } finally {
    setLoadingChat(false);
  }
}

async function enviarMensagemChat() {
  if (!novaMensagem.trim()) {
    setErrorText("Escreve uma mensagem antes de enviar.");
    setOpenErrorModal(true);
    return;
  }

  try {
    setSendingChat(true);

    await http.post("/professor/chat/mensagens", {
      turma_id: turmaId,
      disciplina_id: disciplinaId,
      mensagem: novaMensagem.trim(),
    });

    setNovaMensagem("");
    await carregarChat();
  } catch (e) {
    setErrorText(e?.response?.data?.message || "Erro ao enviar mensagem.");
    setOpenErrorModal(true);
  } finally {
    setSendingChat(false);
  }
}
  
return (
  <div>

    {/* MODAL SUCESSO */}
    {openSuccessModal && (
      <div
        style={styles.modalBackdrop}
        onClick={() => setOpenSuccessModal(false)}
      >
        <div
          style={styles.smallModal}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ margin: "0 0 10px", color: "#166534" }}>
            Sucesso
          </h3>

          <p style={styles.sectionText}>
            {successText}
          </p>

          <div style={{ marginTop: 20 }}>
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

    {/* MODAL ERRO */}
    {openErrorModal && (
      <div
        style={styles.modalBackdrop}
        onClick={() => setOpenErrorModal(false)}
      >
        <div
          style={styles.smallModal}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ margin: "0 0 10px", color: "#B91C1C" }}>
            Atenção
          </h3>

          <p style={styles.sectionText}>
            {errorText}
          </p>

          <div style={{ marginTop: 20 }}>
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
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "materiais" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("materiais")}
        >
          Materiais
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "alunos" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("alunos")}
        >
          Alunos
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "chat" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </button>
      </div>
      {activeTab === "materiais" && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.sectionTitle}>Materiais da disciplina</h3>
              <p style={styles.sectionText}>
                Publica conteúdos para os alunos desta turma.
              </p>
            </div>
            <button style={styles.btnPrimary} onClick={() => setOpenModal(true)}>
              + Novo material
            </button>
          </div>
          {loading ? (
            <div style={styles.empty}>A carregar materiais...</div>
          ) : materiais.length === 0 ? (
            <div style={styles.empty}>Ainda não há materiais publicados.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Título</th>
                    <th style={styles.th}>Tipo</th>
                    <th style={styles.th}>Descrição</th>
                    <th style={styles.th}>Data</th>
                    <th style={{ ...styles.th, width: 260 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {materiais.map((m) => (
                    <tr key={m.id}>
                      <td style={styles.td}>
                        <strong>{m.titulo}</strong>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge}>{m.tipo}</span>
                      </td>
                      <td style={styles.td}>{m.descricao || "—"}</td>
                      <td style={styles.td}>
                        {m.created_at
                          ? new Date(m.created_at).toLocaleDateString("pt-PT")
                          : "—"}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            style={styles.btnSmall}
                            onClick={() => verVisualizacoes(m)}
                          >
                            Visualizações
                          </button>
                          <button
                            style={styles.btnDanger}
                            onClick={() => apagarMaterial(m.id)}
                          >
                            Apagar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
     {activeTab === "alunos" && (
  <div style={styles.card}>
    <div style={styles.cardHeader}>
      <div>
        <h3 style={styles.sectionTitle}>Controlo de faltas</h3>
        <p style={styles.sectionText}>
          Lista alfabética da turma para controlo de presença por dia.
        </p>
      </div>
    </div>

    {alunos.length === 0 ? (
      <div style={styles.empty}>Nenhum aluno encontrado nesta turma.</div>
    ) : (
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: 70 }}>Nº</th>
              <th style={styles.th}>Nome</th>
              <th style={{ ...styles.th, width: 140 }}>Faltas</th>
              <th style={{ ...styles.th, width: 150 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {alunos.map((aluno, index) => (
              <tr key={aluno.id}>
                <td style={styles.td}>
                  <strong>{index + 1}</strong>
                </td>

                <td style={styles.td}>
                  <strong>{aluno.nome_completo}</strong>
                </td>

              

 <td style={styles.td}>
  <div style={{ display: "grid", gap: 6 }}>
    <strong
      style={{
        color: aluno.faltas >= 3 ? "#B91C1C" : "#0B1B2A",
      }}
    >
      {aluno.faltas || 0} falta(s)
    </strong>

    {aluno.faltas >= 3 && (
      <span style={{ fontSize: 11, fontWeight: 900, color: "#B91C1C" }}>
        Reprovado por faltas
      </span>
    )}
  </div>
</td>
<td style={styles.td}>
  <div style={styles.actionsIcons}>
    <button
      title="Marcar falta"
      style={styles.iconButtonPrimary}
      onClick={() => abrirModalFalta(aluno)}
    >
      <Plus size={18} />
    </button>

    <button
      title="Histórico"
      style={styles.iconButton}
      onClick={() => abrirHistorico(aluno)}
    >
      <History size={18} />
    </button>
  </div>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
      {activeTab === "chat" && (
  <div style={styles.card}>
    <h3 style={styles.sectionTitle}>Chat da disciplina</h3>

    <p style={styles.sectionText}>
      Espaço para dúvidas dos alunos e respostas do professor.
    </p>

    <div style={styles.chatBoxReal}>
      {loadingChat ? (
        <div style={styles.empty}>A carregar mensagens...</div>
      ) : mensagensChat.length === 0 ? (
        <div style={styles.empty}>
          Ainda não há mensagens nesta turma/disciplina.
        </div>
      ) : (
        <div style={styles.messagesArea}>
          {mensagensChat.map((m) => (
            <div key={m.id} style={styles.messageItem}>
              <div style={styles.messageHeader}>
                <strong>{m.remetente?.name || "Utilizador"}</strong>
                <span>{m.remetente?.role || ""}</span>
              </div>

              <div style={styles.messageText}>
                {m.mensagem}
              </div>

              <div style={styles.messageDate}>
                {m.created_at
                  ? new Date(m.created_at).toLocaleString("pt-PT")
                  : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.chatInputRow}>
        <input
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Escreve uma resposta para a turma..."
          style={styles.input}
        />

        <button
          onClick={enviarMensagemChat}
          disabled={sendingChat}
          style={styles.btnPrimary}
        >
          {sendingChat ? "A enviar..." : "Enviar"}
        </button>
      </div>
    </div>
  </div>
)}
       
      {openModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>Novo material</h3>
                <p style={styles.sectionText}>
                  Publicar material para {turmaNome} • {disciplinaNome}
                </p>
              </div>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
              >
                Fechar
              </button>
            </div>
            <div style={styles.formGrid}>
              <div>
                <div style={styles.label}>Título</div>
                <input
                  style={styles.input}
                  value={form.titulo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, titulo: e.target.value }))
                  }
                  placeholder="Ex: Álgebra 3"
                />
              </div>
              <div>
                <div style={styles.label}>Tipo</div>
                <select
                  style={styles.input}
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tipo: e.target.value }))
                  }
                >
                  <option value="PDF">PDF</option>
                  <option value="Documento">Documento</option>
                  <option value="Imagem">Imagem</option>
                  <option value="Video">Vídeo</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Link">Link</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={styles.label}>Descrição</div>
                <textarea
                  style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
                  value={form.descricao}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, descricao: e.target.value }))
                  }
                  placeholder="Ex: Conteúdo da aula de sexta-feira..."
                />
              </div>
              <div>
                <div style={styles.label}>Link</div>
                <input
                  style={styles.input}
                  value={form.url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <div style={styles.label}>Ficheiro</div>
                <input
                  type="file"
                  style={styles.input}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      ficheiro: e.target.files?.[0] || null,
                    }))
                  }
                />
              </div>
            </div>

            {erroFaltaModal && ( 
              <div style={styles.inlineError}>
              {erroFaltaModal}
              </div>
            )}
            <div style={styles.modalFooter}>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
              >
                Cancelar
              </button>
              <button
                style={styles.btnPrimary}
                onClick={salvarMaterial}
                disabled={saving}
              >
                {saving ? "A publicar..." : "Publicar material"}
              </button>
            </div>
          </div>
        </div>
      )}
     
{faltaModalOpen && alunoFalta && (
  <div style={styles.modalBackdrop} onClick={() => setFaltaModalOpen(false)}>
    <div style={styles.smallModal} onClick={(e) => e.stopPropagation()}>
      <h3 style={{ margin: "0 0 8px", color: "#0B1B2A" }}>
        Marcar falta
      </h3>

      <p style={styles.sectionText}>
        {alunoFalta.nome_completo}
        <br />
        {disciplinaNome}
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 18, textAlign: "left" }}>
        <div>
          <div style={styles.label}>Data da aula</div>
          <input
            type="date"
            value={dataFalta}
            onChange={(e) => setDataFalta(e.target.value)}
            style={styles.input}
          />
        </div>

        <div>
          <div style={styles.label}>Tempo da aula</div>
         <div style={styles.checkboxGrid}>
  {aulasHorario.map((aula) => (
    <label key={aula.id} style={styles.checkboxItem}>
  <input
    type="checkbox"
    checked={temposAula.includes(String(aula.id))}
    onChange={(e) => {
      if (e.target.checked) {
        setTemposAula((prev) => [...prev, String(aula.id)]);
      } else {
        setTemposAula((prev) =>
          prev.filter((t) => t !== String(aula.id))
        );
      }
    }}
  />

  <span>
    {aula.dia} • {aula.tempo} • {aula.hora} - {aula.hora_fim}
  </span>
</label>
  ))}
</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
        <button style={styles.btnGhost} onClick={() => setFaltaModalOpen(false)}>
          Cancelar
        </button>

        <button style={styles.btnPrimary} onClick={guardarFalta} disabled={savingFalta}>
          {savingFalta ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </div>
  </div>
)}

       {historicoOpen && (
  <div
    style={styles.modalBackdrop}
    onClick={() => setHistoricoOpen(false)}
  >
    <div
      style={styles.modal}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={styles.modalHeader}>
        <div>
          <h3 style={{ margin: 0 }}>
            Histórico de faltas
          </h3>

          <p style={styles.sectionText}>
            {historicoAluno?.nome_completo}
          </p>
        </div>

        <button
          style={styles.btnGhost}
          onClick={() => setHistoricoOpen(false)}
        >
          Fechar
        </button>
      </div>

      {loadingHistorico ? (
        <div style={styles.empty}>
          A carregar histórico...
        </div>
      ) : historicoFaltas.length === 0 ? (
        <div style={styles.empty}>
          Nenhuma falta registada.
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Disciplina</th>
              <th style={styles.th}>Tempo</th>
              <th style={{ ...styles.th, width: 120 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {historicoFaltas.map((falta) => (
              <tr key={falta.id}>
                <td style={styles.td}>
                  {new Date(falta.data).toLocaleDateString("pt-PT")}
                </td>

                <td style={styles.td}>
                  {falta.disciplina}
                </td>

                <td style={styles.td}>
                  {falta.tempo_aula || "—"}
                </td>
                <td style={styles.td}>
  <button
    style={styles.btnDanger}
    onClick={() => removerFaltaHistorico(falta.id)}
  >
    Remover
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
)}

      {visualizacoesOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>
                  Quem abriu: {visualizacoesData?.material?.titulo}
                </h3>
                <p style={styles.sectionText}>
                  Lista de alunos que visualizaram este material.
                </p>
              </div>
              <button
                style={styles.btnGhost}
                onClick={() => setVisualizacoesOpen(false)}
              >
                Fechar
              </button>
            </div>
            {visualizacoesLoading ? (
              <div style={styles.empty}>A carregar visualizações...</div>
            ) : (
              <>
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <strong>{totalAbriram}</strong>
                    <span>Visualizaram</span>
                  </div>
                  <div style={styles.statCard}>
                    <strong>{totalNaoAbriram}</strong>
                    <span>Não visualizaram</span>
                  </div>
                  <div style={styles.statCard}>
                    <strong>{totalAlunos}</strong>
                    <span>Total alunos</span>
                  </div>
                </div>
                {visualizacoesData?.visualizacoes?.length === 0 ? (
                  <div style={{ ...styles.empty, marginTop: 14 }}>
                    Nenhum aluno visualizou.
                  </div>
                ) : (
                  <table style={{ ...styles.table, marginTop: 14 }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Aluno</th>
                        <th style={styles.th}>Aberto em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visualizacoesData.visualizacoes.map((v, index) => (
                        <tr key={index}>
                          <td style={styles.td}>{v.aluno}</td>
                          <td style={styles.td}>
                            {v.opened_at
                              ? new Date(v.opened_at).toLocaleString("pt-PT")
                              : "—"}
                          </td>
                        </tr>
                      ))}
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    margin: 0,
    color: "#0B1B2A",
    fontSize: 30,
    fontWeight: 950,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "rgba(11,27,42,.65)",
    fontWeight: 750,
  },
  tabs: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  tab: {
    border: "1px solid rgba(11,27,42,.12)",
    background: "#fff",
    color: "#0B1B2A",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
  },
  tabActive: {
    background: "rgba(37,99,235,.10)",
    color: "#1D4ED8",
    border: "1px solid rgba(37,99,235,.25)",
  },
  card: {
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
    marginBottom: 14,
  },
  sectionTitle: {
    margin: 0,
    color: "#0B1B2A",
    fontWeight: 950,
  },
  sectionText: {
    margin: "6px 0 0",
    color: "rgba(11,27,42,.62)",
    fontWeight: 650,
  },
  chatBoxReal: {
  display: "grid",
  gap: 14,
  marginTop: 14,
},

messagesArea: {
  display: "grid",
  gap: 10,
  maxHeight: 360,
  overflowY: "auto",
  padding: 10,
  borderRadius: 14,
  border: "1px solid rgba(11,27,42,.10)",
  background: "rgba(11,27,42,.02)",
},

messageItem: {
  padding: 12,
  borderRadius: 14,
  background: "#fff",
  border: "1px solid rgba(11,27,42,.08)",
},

messageHeader: {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  fontSize: 13,
  color: "#0B1B2A",
},

messageText: {
  marginTop: 8,
  color: "#0B1B2A",
  fontWeight: 650,
  lineHeight: 1.5,
},

messageDate: {
  marginTop: 8,
  fontSize: 11,
  color: "rgba(11,27,42,.55)",
  fontWeight: 700,
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
  },
  td: {
    borderBottom: "1px solid rgba(11,27,42,.06)",
    padding: "12px 10px",
    color: "#0B1B2A",
    fontWeight: 650,
    verticalAlign: "top",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
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
  btnGhost: {
    border: "1px solid rgba(11,27,42,.14)",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "#fff",
    color: "#0B1B2A",
  },
  btnSmall: {
    border: "1px solid rgba(37,99,235,.25)",
    padding: "8px 10px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(37,99,235,.08)",
    color: "#1D4ED8",
  },
  btnDanger: {
    border: "1px solid rgba(239,68,68,.25)",
    padding: "8px 10px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(239,68,68,.08)",
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
  error: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(239,68,68,.25)",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
    fontWeight: 850,
  },
  success: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(34,197,94,.25)",
    background: "rgba(34,197,94,.10)",
    color: "#166534",
    fontWeight: 850,
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
    width: "min(820px, 100%)",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    padding: 16,
    maxHeight: "92vh",
    overflowY: "auto",
  },
  inputMini: {
  width: "90px",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(11,27,42,.12)",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
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
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },
  statCard: {
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(11,27,42,.10)",
    background: "rgba(11,27,42,.02)",
    display: "grid",
    gap: 6,
    textAlign: "center",
  },
  chatBox: {
    display: "grid",
    gap: 14,
  },
  chatInputRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
  },
  voltarLink: {
  border: "none",
  background: "transparent",
  color: "#0A4174",
  fontWeight: 900,
  cursor: "pointer",
  marginBottom: 18,
  padding: 0,
  fontSize: 14,
},

topo: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 20,
},

tituloTurma: {
  margin: 0,
  fontSize: 36,
  fontWeight: 950,
  color: "#0B1B2A",
  lineHeight: 1.1,
},

subtitulo: {
  marginTop: 8,
  fontSize: 18,
  fontWeight: 700,
  color: "rgba(11,27,42,.62)",
},

tabs: {
  display: "flex",
  gap: 10,
  marginBottom: 24,
},

tab: {
  border: "1px solid rgba(11,27,42,.10)",
  background: "#fff",
  color: "#0B1B2A",
  padding: "10px 16px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 800,
},

tabActive: {
  border: "1px solid rgba(10,65,116,.10)",
  background: "rgba(10,65,116,.08)",
  color: "#0A4174",
  padding: "10px 16px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 900,
},
smallModal: {
  width: "100%",
  maxWidth: 380,
  background: "#fff",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 20px 60px rgba(0,0,0,.20)",
  textAlign: "center",
},
btnNovo: {
  border: "none",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 900,
  cursor: "pointer",
  background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
  color: "#fff",
},
actionsIcons: {
  display: "flex",
  gap: 8,
  alignItems: "center",
},

iconButtonPrimary: {
  width: 40,
  height: 40,
  borderRadius: 12,
  border: "1px solid rgba(37,99,235,.20)",
  background: "rgba(37,99,235,.10)",
  cursor: "pointer",
  fontSize: 18,
},
checkboxGrid: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
},

checkboxItem: {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(11,27,42,.12)",
  background: "#fff",
  fontWeight: 800,
  cursor: "pointer",
},
iconButton: {
  width: 40,
  height: 40,
  borderRadius: 12,
  border: "1px solid rgba(11,27,42,.10)",
  background: "#fff",
  cursor: "pointer",
  fontSize: 18,
},
inlineError: {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(239,68,68,.25)",
  background: "rgba(239,68,68,.08)",
  color: "#B91C1C",
  fontWeight: 800,
  fontSize: 13,
},
};