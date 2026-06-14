import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, History, FileText } from "lucide-react";
import http from "../../api/http";

export default function TurmaDisciplinaDetalhe() {
  const { turmaId, disciplinaId } = useParams();

  const [loading, setLoading] = useState(false);
  const [atribuicao, setAtribuicao] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [aulasHorario, setAulasHorario] = useState([]);

  const [faltaModalOpen, setFaltaModalOpen] = useState(false);
  const [alunoFalta, setAlunoFalta] = useState(null);
  const [temposAula, setTemposAula] = useState([]);
  const [dataFalta, setDataFalta] = useState(new Date().toISOString().split("T")[0]);
  function getDiaSemana(data) {
  const dias = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  return dias[new Date(data).getDay()];
}
  const [savingFalta, setSavingFalta] = useState(false);

  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [historicoAluno, setHistoricoAluno] = useState(null);
  const [historicoFaltas, setHistoricoFaltas] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [successText, setSuccessText] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorText, setErrorText] = useState("");


  useEffect(() => {
    carregarDados();
    carregarAlunos();
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

  async function carregarDados() {
    try {
      setLoading(true);

      const res = await http.get("/professor/minhas-atribuicoes");

      const atribuicoes = Array.isArray(res.data?.atribuicoes)
        ? res.data.atribuicoes
        : [];

      const atual = atribuicoes.find(
        (a) =>
          String(a.turma_id) === String(turmaId) &&
          String(a.disciplina_id) === String(disciplinaId)
      );

      setAtribuicao(atual || null);

      const aulas = Array.isArray(res.data?.proximas_aulas)
        ? res.data.proximas_aulas
        : [];

      const aulasDestaDisciplina = aulas.filter(
        (a) =>
          String(a.turma_id) === String(turmaId) &&
          String(a.disciplina_id) === String(disciplinaId)
      );

      setAulasHorario(aulasDestaDisciplina);
    } catch (e) {
      setErrorText("Erro ao carregar dados da turma/disciplina.");
      setOpenErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  async function carregarAlunos() {
    try {
      const res = await http.get(
        `/professor/turmas/${turmaId}/alunos?disciplina_id=${disciplinaId}`
      );

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
      setErrorText(
        e?.response?.data?.message || "Erro ao carregar alunos da turma."
      );
      setOpenErrorModal(true);
    }
  }

  function abrirModalFalta(aluno) {
    setAlunoFalta(aluno);
    setTemposAula([]);
    setDataFalta(new Date().toISOString().split("T")[0]);
    setFaltaModalOpen(true);
  }

  async function guardarFalta() {
    if (!alunoFalta) return;

    if (!dataFalta) {
      setErrorText("Seleciona a data da falta.");
      setOpenErrorModal(true);
      return;
    }
if (aulasDisponiveis.length === 0) {
  setErrorText(
    "Não existe aula desta disciplina na data selecionada."
  );
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
      setErrorText(e?.response?.data?.message || "Erro ao guardar falta.");
      setOpenErrorModal(true);
    } finally {
      setSavingFalta(false);
    }
  }

  async function abrirHistorico(aluno) {
    try {
      setHistoricoAluno(aluno);
      setHistoricoOpen(true);
      setLoadingHistorico(true);

      const res = await http.get(`/professor/alunos/${aluno.id}/faltas`);
      setHistoricoFaltas(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErrorText(
        e?.response?.data?.message || "Erro ao carregar histórico de faltas."
      );
      setOpenErrorModal(true);
    } finally {
      setLoadingHistorico(false);
    }
  }

  async function removerFaltaHistorico(faltaId) {
    if (!window.confirm("Tens certeza que desejas remover esta falta?")) return;

    try {
      await http.delete(`/professor/faltas/${faltaId}`);

      setHistoricoFaltas((prev) => prev.filter((f) => f.id !== faltaId));

      await carregarAlunos();

      setHistoricoOpen(false);
      setSuccessText("Falta removida com sucesso.");
      setOpenSuccessModal(true);
    } catch (e) {
      setErrorText(e?.response?.data?.message || "Erro ao remover falta.");
      setOpenErrorModal(true);
    }
  }

  function imprimirRelatorioFaltas() {
  if (alunos.length === 0) {
    setErrorText("Não é possível imprimir o relatório porque esta turma não possui alunos.");
    setOpenErrorModal(true);
    return;
  }


  const win = window.open("", "_blank");

  win.document.write(`
    <html>
      <head>
        <title>Relatório de Faltas</title>
        <style>
          body { font-family: Arial; padding: 30px; color: #111827; }
          h2, h3, p { margin: 0 0 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 9px; text-align: left; font-size: 13px; }
          th { background: #f3f4f6; }
          .resumo { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
          .box { border: 1px solid #000; padding: 10px; font-weight: bold; }
          .assinaturas { margin-top: 70px; display: flex; justify-content: space-between; text-align: center; }
        </style>
      </head>

      <body>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
          <img src="${window.location.origin}/logo.png" style="width:70px;height:70px;object-fit:contain;" />
          <div>
            <h2>Colégio Henriques</h2>
            <h3>Relatório de Faltas</h3>
          </div>
        </div>

        <p><strong>Turma:</strong> ${turmaNome}</p>
        <p><strong>Disciplina:</strong> ${disciplinaNome}</p>
        <p><strong>Total de alunos:</strong> ${alunos.length}</p>

        <div class="resumo">
   
        </div>

        <table>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Nome do aluno</th>
              <th>Nº de matrícula</th>
              <th>Total de faltas</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            ${alunos.map((a, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${a.nome_completo || "-"}</td>
                <td>${a.numero_aluno || "-"}</td>
                <td>${a.faltas || 0}</td>
                <td>${Number(a.faltas || 0) >= 3 ? "Reprovado por faltas" : "Regular"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="assinaturas">
          <div>
            ___________________________<br/>
            Professor(a)
          </div>

          <div>
            ___________________________<br/>
            Coordenação
          </div>
        </div>
      </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
}
const aulasDisponiveis = aulasHorario.filter(
  (aula) => aula.dia === getDiaSemana(dataFalta)
);
  return (
    <div>
      {openSuccessModal && (
        <Modal onClose={() => setOpenSuccessModal(false)}>
          <h3 style={{ margin: "0 0 10px", color: "#166534" }}>Sucesso</h3>
          <p style={styles.sectionText}>{successText}</p>
          <button style={styles.btnPrimary} onClick={() => setOpenSuccessModal(false)}>
            Fechar
          </button>
        </Modal>
      )}

      {openErrorModal && (
        <Modal onClose={() => setOpenErrorModal(false)}>
          <h3 style={{ margin: "0 0 10px", color: "#B91C1C" }}>Atenção</h3>
          <p style={styles.sectionText}>{errorText}</p>
          <button style={styles.btnDanger} onClick={() => setOpenErrorModal(false)}>
            Fechar
          </button>
        </Modal>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Controlo de faltas</h3>
            <p style={styles.sectionText}>
              Lista dos alunos desta turma para marcação e consulta de faltas.
            </p>
          </div>

<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
 


</div>
<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
 

<button style={styles.btnPrimary} onClick={imprimirRelatorioFaltas}>
    <FileText size={16} />
    Relatório
  </button>
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
                  <th style={{ ...styles.th, width: 160 }}>Faltas</th>
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
                          <span style={styles.alertText}>
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

            <div style={styles.formBox}>
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

                {aulasDisponiveis.length === 0 ? (
                  <div style={styles.empty}>
                  Não há aula desta disciplina na data selecionada.
                  </div>
                ) : (
                  <div style={styles.checkboxGrid}>
                   {aulasDisponiveis.map((aula) => (
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
                )}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.btnGhost} onClick={() => setFaltaModalOpen(false)}>
                Cancelar
              </button>

              <button
                style={styles.btnPrimary}
                onClick={guardarFalta}
                disabled={savingFalta}
              >
                {savingFalta ? "A guardar..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {historicoOpen && (
        <div style={styles.modalBackdrop} onClick={() => setHistoricoOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>Histórico de faltas</h3>
                <p style={styles.sectionText}>{historicoAluno?.nome_completo}</p>
              </div>

              <button style={styles.btnGhost} onClick={() => setHistoricoOpen(false)}>
                Fechar
              </button>
            </div>

            {loadingHistorico ? (
              <div style={styles.empty}>A carregar histórico...</div>
            ) : historicoFaltas.length === 0 ? (
              <div style={styles.empty}>Nenhuma falta registada.</div>
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

                      <td style={styles.td}>{falta.disciplina}</td>

                      <td style={styles.td}>{falta.tempo_aula || "—"}</td>

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
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.smallModal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const styles = {
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
  infoPill: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(10,65,116,.08)",
    border: "1px solid rgba(10,65,116,.16)",
    color: "#0A4174",
    fontWeight: 950,
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
  empty: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
  },
  alertText: {
    fontSize: 11,
    fontWeight: 900,
    color: "#B91C1C",
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
    display: "grid",
    placeItems: "center",
    color: "#1D4ED8",
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.10)",
    background: "#fff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "#0B1B2A",
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
  smallModal: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    textAlign: "center",
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
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  formBox: {
    display: "grid",
    gap: 12,
    marginTop: 18,
    textAlign: "left",
  },
  modalActions: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
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
  btnGhost: {
    border: "1px solid rgba(11,27,42,.14)",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "#fff",
    color: "#0B1B2A",
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
};