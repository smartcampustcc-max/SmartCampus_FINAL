import { useEffect, useMemo, useState } from "react";

const LS_KEY = "smartcampus_agenda_v1";

function loadAgenda() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAgenda(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function nowLocalDatetime() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function diffMinutes(fromISO, toISO) {
  const a = new Date(fromISO).getTime();
  const b = new Date(toISO).getTime();
  return Math.round((a - b) / 60000);
}

function Chip({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#F3F4F6", fg: "#111827" },
    blue: { bg: "#DBEAFE", fg: "#1E3A8A" },
    green: { bg: "#DCFCE7", fg: "#14532D" },
    yellow: { bg: "#FEF9C3", fg: "#713F12" },
    red: { bg: "#FEE2E2", fg: "#7F1D1D" },
    purple: { bg: "#EDE9FE", fg: "#4C1D95" },
  };

  const t = tones[tone] || tones.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        fontSize: 12,
        fontWeight: 700,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        background: "white",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  );
}

export default function AgendaAluno() {
  const [items, setItems] = useState(() => loadAgenda());

  const [titulo, setTitulo] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [quando, setQuando] = useState(nowLocalDatetime());
  const [prioridade, setPrioridade] = useState("media"); // baixa, media, alta
  const [tipo, setTipo] = useState("estudo"); // estudo, tarefa, teste, outro
  const [erro, setErro] = useState("");

  const [filtro, setFiltro] = useState("tudo"); // tudo, hoje, semana, pendentes, concluidas
  const [busca, setBusca] = useState("");

  useEffect(() => {
    saveAgenda(items);
  }, [items]);

  // “Reminders” simples: ao abrir a página, alerta itens próximos (até 60 min)
  useEffect(() => {
    const now = new Date();
    const nowISO = now.toISOString();

    const proximos = items
      .filter((i) => !i.concluida)
      .filter((i) => {
        const mins = diffMinutes(i.quando, nowISO);
        return mins >= 0 && mins <= 60;
      })
      .sort((a, b) => new Date(a.quando) - new Date(b.quando));

    if (proximos.length > 0) {
      const top = proximos[0];
      alert(`Lembrete: "${top.titulo}" em breve! (${new Date(top.quando).toLocaleString()})`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resumo = useMemo(() => {
    const pendentes = items.filter((i) => !i.concluida).length;
    const concluidas = items.filter((i) => i.concluida).length;
    const hoje = items.filter((i) => {
      const d = new Date(i.quando);
      const n = new Date();
      return d.toDateString() === n.toDateString();
    }).length;
    return { pendentes, concluidas, hoje };
  }, [items]);

  const filtrados = useMemo(() => {
    const n = new Date();

    function inSemana(d) {
      // semana atual (seg-dom) simples
      const day = n.getDay(); // 0 dom..6 sab
      const diffToMon = (day === 0 ? 6 : day - 1);
      const monday = new Date(n);
      monday.setDate(n.getDate() - diffToMon);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return d >= monday && d <= sunday;
    }

    let list = [...items];

    // filtro
    if (filtro === "hoje") {
      list = list.filter((i) => new Date(i.quando).toDateString() === n.toDateString());
    } else if (filtro === "semana") {
      list = list.filter((i) => inSemana(new Date(i.quando)));
    } else if (filtro === "pendentes") {
      list = list.filter((i) => !i.concluida);
    } else if (filtro === "concluidas") {
      list = list.filter((i) => i.concluida);
    }

    // busca
    const q = busca.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => {
        const a = (i.titulo || "").toLowerCase();
        const b = (i.disciplina || "").toLowerCase();
        return a.includes(q) || b.includes(q);
      });
    }

    // ordenar por data
    list.sort((a, b) => new Date(a.quando) - new Date(b.quando));
    return list;
  }, [items, filtro, busca]);

  function adicionar(e) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim()) {
      setErro("Escreve um título (ex: Estudar Programação 30 min).");
      return;
    }
    if (!quando) {
      setErro("Escolhe data e hora.");
      return;
    }

    const novo = {
      id: Date.now(),
      titulo: titulo.trim(),
      disciplina: disciplina.trim(),
      quando,
      prioridade,
      tipo,
      concluida: false,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [novo, ...prev]);
    setTitulo("");
    setDisciplina("");
    setQuando(nowLocalDatetime());
    setPrioridade("media");
    setTipo("estudo");
  }

  function toggleConcluida(id) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, concluida: !i.concluida } : i))
    );
  }

  function apagar(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function tonePrioridade(p) {
    if (p === "alta") return "red";
    if (p === "media") return "yellow";
    return "green";
  }

  function toneTipo(t) {
    if (t === "estudo") return "blue";
    if (t === "tarefa") return "purple";
    if (t === "teste") return "red";
    return "neutral";
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ marginTop: 0 }}>Agenda & Reminders</h2>
          <p style={{ opacity: 0.75, marginTop: 6 }}>
            Organiza estudos, tarefas e testes. (Guarda automaticamente no teu dispositivo.)
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Chip tone="blue">Hoje: {resumo.hoje}</Chip>
          <Chip tone="yellow">Pendentes: {resumo.pendentes}</Chip>
          <Chip tone="green">Concluídas: {resumo.concluidas}</Chip>
        </div>
      </div>

      {/* FORM */}
      <Card>
        <div style={{ padding: 16, borderBottom: "1px solid #E5E7EB" }}>
          <h3 style={{ margin: 0 }}>Adicionar lembrete</h3>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
            Dica: coloca “Estudar 25 min” e usa Pomodoro a seguir.
          </div>
        </div>

        <form onSubmit={adicionar} style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 260, flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Título</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Estudar Redes 30 min"
                style={inputStyle}
              />
            </div>

            <div style={{ minWidth: 220 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Disciplina (opcional)</label>
              <input
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                placeholder="Ex: Programação"
                style={inputStyle}
              />
            </div>

            <div style={{ minWidth: 220 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Data e hora</label>
              <input
                type="datetime-local"
                value={quando}
                onChange={(e) => setQuando(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ minWidth: 180 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
                <option value="estudo">Estudo</option>
                <option value="tarefa">Tarefa</option>
                <option value="teste">Teste</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div style={{ minWidth: 180 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                style={inputStyle}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          {erro && (
            <div style={{ marginTop: 12 }}>
              <Chip tone="red">{erro}</Chip>
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="submit" style={primaryBtn}>
              Guardar
            </button>
          </div>
        </form>
      </Card>

      {/* LISTA + FILTROS */}
      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} style={inputStyleSmall}>
          <option value="tudo">Tudo</option>
          <option value="hoje">Hoje</option>
          <option value="semana">Esta semana</option>
          <option value="pendentes">Pendentes</option>
          <option value="concluidas">Concluídas</option>
        </select>

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar por título ou disciplina..."
          style={{ ...inputStyleSmall, minWidth: 260, flex: 1 }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        {filtrados.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Ainda não tens lembretes.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filtrados.map((i) => (
              <Card key={i.id}>
                <div style={{ padding: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 260 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0 }}>{i.titulo}</h3>
                      {i.concluida ? <Chip tone="green">Concluída</Chip> : <Chip tone="yellow">Pendente</Chip>}
                    </div>

                    <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Chip tone={toneTipo(i.tipo)}>{i.tipo.toUpperCase()}</Chip>
                      <Chip tone={tonePrioridade(i.prioridade)}>
                        Prioridade: {i.prioridade.toUpperCase()}
                      </Chip>
                      {i.disciplina && <Chip tone="blue">{i.disciplina}</Chip>}
                    </div>

                    <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
                      ⏰ {new Date(i.quando).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button onClick={() => toggleConcluida(i.id)} style={ghostBtn}>
                      {i.concluida ? "Marcar pendente" : "Marcar concluída"}
                    </button>
                    <button onClick={() => apagar(i.id)} style={dangerBtn}>
                      Apagar
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, opacity: 0.65, fontSize: 12 }}>
        Nota: os lembretes são guardados no teu navegador (localStorage). Quando ligar ao backend, isso vai para a base de dados.
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  outline: "none",
  background: "#fff",
};

const inputStyleSmall = {
  padding: 10,
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  outline: "none",
  background: "#fff",
};

const primaryBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #1F2937",
  background: "#111827",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const ghostBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  background: "white",
  cursor: "pointer",
};

const dangerBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #FCA5A5",
  background: "#FEE2E2",
  color: "#7F1D1D",
  fontWeight: 800,
  cursor: "pointer",
};
