import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function Atribuicoes() {
  const [loading, setLoading] = useState(false);

  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [disciplinasDaTurma, setDisciplinasDaTurma] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [turmaId, setTurmaId] = useState("");
  const [professoresSelecionados, setProfessoresSelecionados] = useState({});

  const [q, setQ] = useState("");
  const [verModal, setVerModal] = useState(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successText, setSuccessText] = useState("");

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [atribuicaoParaRemover, setAtribuicaoParaRemover] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);

    try {
      const [t, p, a] = await Promise.all([
        http.get("/admin/turmas"),
        http.get("/admin/professores"),
        http.get("/admin/atribuicoes"),
      ]);

      setTurmas(Array.isArray(t.data) ? t.data : []);
      setProfessores(Array.isArray(p.data) ? p.data : []);
      setAtribuicoes(Array.isArray(a.data) ? a.data : []);
    } catch (e) {
      abrirErro("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  function abrirSucesso(texto) {
    setSuccessText(texto);
    setSuccessOpen(true);
  }

  function abrirErro(texto) {
    setErrorText(texto);
    setErrorOpen(true);
  }

  async function handleTurmaChange(e) {
    const id = e.target.value;

    setTurmaId(id);
    setProfessoresSelecionados({});
    setDisciplinasDaTurma([]);

    if (!id) return;

    try {
      const res = await http.get(`/admin/turmas/${id}/disciplinas`);
      setDisciplinasDaTurma(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      abrirErro("Erro ao carregar disciplinas da turma.");
    }
  }

  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();

    if (!s) return atribuicoes;

    return atribuicoes.filter((a) => {
      const turma = a?.turma?.nome || "";
      const codigo = a?.turma?.codigo_turma || "";
      const disciplina = a?.disciplina?.nome || "";
      const professor = a?.professor?.name || "";

      return `${turma} ${codigo} ${disciplina} ${professor}`
        .toLowerCase()
        .includes(s);
    });
  }, [q, atribuicoes]);

  async function guardarAtribuicoesDaTurma() {
    if (!turmaId) {
      abrirErro("Selecciona uma turma.");
      return;
    }

    const selecionadas = Object.entries(professoresSelecionados)
      .filter(([, professorId]) => professorId)
      .map(([disciplinaId, professorId]) => ({
        turma_id: Number(turmaId),
        disciplina_id: Number(disciplinaId),
        professor_id: Number(professorId),
      }));

    if (selecionadas.length === 0) {
      abrirErro("Seleciona pelo menos um professor para uma disciplina.");
      return;
    }

    setLoading(true);

    try {
      for (const item of selecionadas) {
        const existe = atribuicoes.some(
          (a) =>
            String(a.turma_id) === String(item.turma_id) &&
            String(a.disciplina_id) === String(item.disciplina_id)
        );

        if (!existe) {
          await http.post("/admin/atribuicoes", item);
        }
      }

      const res = await http.get("/admin/atribuicoes");
      setAtribuicoes(Array.isArray(res.data) ? res.data : []);

      setTurmaId("");
      setDisciplinasDaTurma([]);
      setProfessoresSelecionados({});

      abrirSucesso("Atribuições guardadas com sucesso.");
    } catch (e) {
      abrirErro(e?.response?.data?.message || "Erro ao guardar atribuições.");
    } finally {
      setLoading(false);
    }
  }

  function pedirRemover(atribuicao) {
    setAtribuicaoParaRemover(atribuicao);
    setConfirmOpen(true);
  }

  async function confirmarRemover() {
    if (!atribuicaoParaRemover) return;

    setLoading(true);

    try {
      await http.delete(`/admin/atribuicoes/${atribuicaoParaRemover.id}`);

      setAtribuicoes((prev) =>
        prev.filter((a) => a.id !== atribuicaoParaRemover.id)
      );

      setConfirmOpen(false);
      setAtribuicaoParaRemover(null);

      abrirSucesso("Atribuição removida com sucesso.");
    } catch (e) {
      abrirErro("Erro ao remover atribuição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={styles.card}>
        <h3 style={{ marginTop: 0, color: "#0B1B2A" }}>Nova atribuição</h3>

        <div style={{ maxWidth: 320, marginBottom: 18 }}>
          <div style={styles.label}>Turma</div>

          <select value={turmaId} onChange={handleTurmaChange} style={styles.input}>
            <option value="">Selecciona a turma</option>

            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.codigo_turma || t.nome || `Turma #${t.id}`}
              </option>
            ))}
          </select>
        </div>

        {!turmaId ? null : disciplinasDaTurma.length === 0 ? (
          <div style={styles.empty}>Esta turma ainda não possui disciplinas.</div>
        ) : (
          <>
            <div style={styles.atribuirScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Disciplina</th>
                    <th style={styles.th}>Professor</th>
                  </tr>
                </thead>

                <tbody>
                  {disciplinasDaTurma.map((disciplina) => {
                    const atribuicaoExistente = atribuicoes.find(
                      (a) =>
                        String(a.turma_id) === String(turmaId) &&
                        String(a.disciplina_id) === String(disciplina.id)
                    );
                    const professoresDaDisciplina = professores.filter((p) => {
                      const discs = p.disciplinas || [];
                      return discs.some(
                        (d) => String(d.id) === String(disciplina.id)
                      );
                    });

                    return (
                      <tr key={disciplina.id}>
                        <td style={styles.td}>
                          <strong>{disciplina.nome}</strong>
                        </td>

                        <td style={styles.td}>
{atribuicaoExistente ? (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <span style={styles.badgeOk}>
      {atribuicaoExistente?.professor?.name || "Professor já atribuído"}
    </span>

    <button
      type="button"
      style={styles.btnDanger}
      onClick={() => pedirRemover(atribuicaoExistente)}
      disabled={loading}
    >
      Remover
    </button>
  </div>
) : (
  <select
    value={professoresSelecionados[disciplina.id] || ""}
    onChange={(e) =>
      setProfessoresSelecionados((prev) => ({
        ...prev,
        [disciplina.id]: e.target.value,
      }))
    }
    style={styles.input}
  >
    <option value="">Selecciona o professor</option>

    {professoresDaDisciplina.map((p) => (
      <option key={p.id} value={p.id}>
        {p.name}
      </option>
    ))}
  </select>
)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                style={styles.btnPrimary}
                onClick={guardarAtribuicoesDaTurma}
                disabled={loading}
              >
                {loading ? "A guardar..." : "Guardar atribuições da turma"}
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ ...styles.card, marginTop: 14 }}>
        <div style={styles.filters}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={styles.label}>Pesquisar</div>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="turma, disciplina ou professor..."
              style={styles.input}
            />
          </div>
        </div>

        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Turma</th>
                <th style={styles.th}>Disciplina</th>
                <th style={styles.th}>Professor</th>
                <th style={{ ...styles.th, width: 180, textAlign: "right" }}>
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map((a) => (
                <tr key={a.id}>
                  <td style={styles.td}>
                    <span
                      style={styles.badge}
                      title={a?.turma?.curso?.nome || "Curso não informado"}
                    >
                      {a?.turma?.codigo_turma ||
                        a?.turma?.nome ||
                        `#${a?.turma_id}`}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {a?.disciplina?.nome || `#${a?.disciplina_id}`}
                  </td>

                  <td style={styles.td}>
                    {a?.professor?.name || `#${a?.professor_id}`}
                  </td>

                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={styles.actions}>
                      <button onClick={() => setVerModal(a)} style={styles.btnGhost}>
                        Ver
                      </button>

                      <button
                        onClick={() => pedirRemover(a)}
                        style={styles.btnDanger}
                        disabled={loading}
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 16 }}>
                    <div style={styles.empty}>Nenhuma atribuição encontrada.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {verModal && (
        <div style={styles.backdrop} onClick={() => setVerModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Detalhes da Atribuição</h3>

              <button style={styles.btnGhost} onClick={() => setVerModal(null)}>
                Fechar
              </button>
            </div>

            <div style={styles.detalheGrid}>
              <Detalhe label="Turma" valor={verModal?.turma?.nome} />
              <Detalhe label="Código da Turma" valor={verModal?.turma?.codigo_turma} />
              <Detalhe label="Curso" valor={verModal?.turma?.curso?.nome} />
              <Detalhe label="Disciplina" valor={verModal?.disciplina?.nome} />
              <Detalhe label="Professor" valor={verModal?.professor?.name} />
              <Detalhe label="Email do Professor" valor={verModal?.professor?.email} />
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div style={styles.backdrop}>
          <div style={styles.confirmModal}>
            <h3 style={{ margin: "0 0 8px", color: "#0B1B2A" }}>
              Remover atribuição
            </h3>

            <p style={styles.confirmText}>
              Tens certeza que queres remover a atribuição de{" "}
              <strong>{atribuicaoParaRemover?.disciplina?.nome}</strong> para a turma{" "}
              <strong>
                {atribuicaoParaRemover?.turma?.codigo_turma ||
                  atribuicaoParaRemover?.turma?.nome}
              </strong>
              ?
            </p>

            <div style={styles.confirmActions}>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setConfirmOpen(false);
                  setAtribuicaoParaRemover(null);
                }}
                disabled={loading}
              >
                Não
              </button>

              <button
                style={styles.btnDanger}
                onClick={confirmarRemover}
                disabled={loading}
              >
                {loading ? "A remover..." : "Sim, remover"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successOpen && (
        <div style={styles.backdrop} onClick={() => setSuccessOpen(false)}>
          <div style={styles.statusModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={{ color: "#166534", margin: "0 0 8px" }}>
              {successText}
            </h3>

            <button style={styles.btnPrimary} onClick={() => setSuccessOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {errorOpen && (
        <div style={styles.backdrop} onClick={() => setErrorOpen(false)}>
          <div style={styles.statusModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.errorIcon}>!</div>
            <h3 style={{ color: "#B91C1C", margin: "0 0 8px" }}>Erro</h3>
            <p style={styles.confirmText}>{errorText}</p>

            <button style={styles.btnDanger} onClick={() => setErrorOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detalhe({ label, valor }) {
  return (
    <div style={styles.detalheItem}>
      <div style={styles.detalheLabel}>{label}</div>
      <div style={styles.detalheValor}>{valor || "-"}</div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
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
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
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
  btnPrimary: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 950,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
    boxShadow: "0 10px 22px rgba(10,65,116,.22)",
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
  btnDanger: {
    border: "1px solid rgba(239,68,68,.25)",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
  },
  atribuirScroll: {
    maxHeight: 360,
    overflowY: "auto",
    overflowX: "auto",
    paddingRight: 6,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8,
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
    verticalAlign: "middle",
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  empty: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(500px, 100%)",
    background: "#fff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
  },
  confirmModal: {
    width: "min(430px, 100%)",
    background: "#fff",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    textAlign: "center",
  },
  statusModal: {
    width: "min(390px, 100%)",
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
    textAlign: "center",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detalheGrid: {
    display: "grid",
    gap: 12,
  },
  detalheItem: {
    padding: 12,
    borderRadius: 14,
    background: "rgba(11,27,42,.03)",
    border: "1px solid rgba(11,27,42,.08)",
  },
  detalheLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(11,27,42,.6)",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  detalheValor: {
    fontWeight: 900,
    color: "#0B1B2A",
    fontSize: 15,
  },
  confirmText: {
    color: "rgba(11,27,42,.72)",
    fontWeight: 650,
    lineHeight: 1.5,
  },
  confirmActions: {
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    gap: 10,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    margin: "0 auto 14px",
    display: "grid",
    placeItems: "center",
    background: "rgba(34,197,94,.12)",
    color: "#166534",
    fontWeight: 950,
    fontSize: 30,
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    margin: "0 auto 14px",
    display: "grid",
    placeItems: "center",
    background: "rgba(239,68,68,.12)",
    color: "#B91C1C",
    fontWeight: 950,
    fontSize: 30,
  },
};