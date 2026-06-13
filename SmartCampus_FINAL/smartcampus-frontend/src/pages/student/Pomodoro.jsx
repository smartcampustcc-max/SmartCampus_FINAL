import { useEffect, useMemo, useRef, useState } from "react";

const LS_KEY = "smartcampus_pomodoro_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(s) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatMMSS(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Card({ title, children, right }) {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        background: "white",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 16, borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        {right}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
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
    <span style={{ padding: "4px 10px", borderRadius: 999, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 800, border: "1px solid rgba(0,0,0,0.06)" }}>
      {children}
    </span>
  );
}

export default function PomodoroAluno() {
  // Estado persistente
  const saved = loadState();

  const [mode, setMode] = useState(saved?.mode || "focus"); // focus | break
  const [isRunning, setIsRunning] = useState(saved?.isRunning || false);

  const [focusMin, setFocusMin] = useState(saved?.focusMin ?? 25);
  const [breakMin, setBreakMin] = useState(saved?.breakMin ?? 5);

  const [secondsLeft, setSecondsLeft] = useState(saved?.secondsLeft ?? focusMin * 60);
  const [disciplina, setDisciplina] = useState(saved?.disciplina || "");

  const [history, setHistory] = useState(saved?.history || {}); // { "YYYY-MM-DD": minutes }

  const intervalRef = useRef(null);

  // Sempre que mudam presets, se não estiver a correr, atualiza secondsLeft
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft((mode === "focus" ? focusMin : breakMin) * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMin, breakMin]);

  // Tick
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Quando chega a 0, troca automaticamente
  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft !== 0) return;

    // Som simples (opcional): alert
    if (mode === "focus") {
      // somar minutos estudados no histórico
      const key = todayKey();
      const add = focusMin;
      setHistory((prev) => ({
        ...prev,
        [key]: (prev[key] || 0) + add,
      }));

      alert("Pomodoro concluído! Hora de pausa 😄");
      setMode("break");
      setSecondsLeft(breakMin * 60);
    } else {
      alert("Pausa concluída! Volta ao foco 💪");
      setMode("focus");
      setSecondsLeft(focusMin * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  // Persistir tudo
  useEffect(() => {
    saveState({
      mode,
      isRunning,
      focusMin,
      breakMin,
      secondsLeft,
      disciplina,
      history,
    });
  }, [mode, isRunning, focusMin, breakMin, secondsLeft, disciplina, history]);

  const titleMode = mode === "focus" ? "Foco" : "Pausa";
  const toneMode = mode === "focus" ? "red" : "green";

  const hojeMin = history[todayKey()] || 0;

  const ultimos7 = useMemo(() => {
    const out = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const x = new Date(d);
      x.setDate(d.getDate() - i);
      const k = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
      out.push({ day: k.slice(5), minutes: history[k] || 0 });
    }
    return out;
  }, [history]);

  function start() {
    if (secondsLeft <= 0) {
      setSecondsLeft((mode === "focus" ? focusMin : breakMin) * 60);
    }
    setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
  }

  function reset() {
    setIsRunning(false);
    setSecondsLeft((mode === "focus" ? focusMin : breakMin) * 60);
  }

  function preset(type) {
    if (isRunning) return;
    if (type === "25") {
      setFocusMin(25);
      setBreakMin(5);
      setMode("focus");
      setSecondsLeft(25 * 60);
    }
    if (type === "50") {
      setFocusMin(50);
      setBreakMin(10);
      setMode("focus");
      setSecondsLeft(50 * 60);
    }
  }

  return (
    <div>
     

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr", marginTop: 14 }}>
        <Card
          title="Timer"
          right={
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Chip tone={toneMode}>{titleMode.toUpperCase()}</Chip>
              {disciplina && <Chip tone="blue">{disciplina}</Chip>}
            </div>
          }
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 54, fontWeight: 1000, letterSpacing: 1 }}>
              {formatMMSS(secondsLeft)}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!isRunning ? (
                <button onClick={start} style={primaryBtn}>
                  Iniciar
                </button>
              ) : (
                <button onClick={pause} style={ghostBtn}>
                  Pausar
                </button>
              )}
              <button onClick={reset} style={ghostBtn}>
                Reset
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 240 }}>
              <label style={lbl}>Disciplina (opcional)</label>
              <input
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                placeholder="Ex: Programação"
                style={input}
              />
            </div>

            <div style={{ minWidth: 160 }}>
              <label style={lbl}>Foco (min)</label>
              <input
                type="number"
                min={1}
                value={focusMin}
                onChange={(e) => setFocusMin(Number(e.target.value))}
                style={input}
                disabled={isRunning}
              />
            </div>

            <div style={{ minWidth: 160 }}>
              <label style={lbl}>Pausa (min)</label>
              <input
                type="number"
                min={1}
                value={breakMin}
                onChange={(e) => setBreakMin(Number(e.target.value))}
                style={input}
                disabled={isRunning}
              />
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
              <button onClick={() => preset("25")} style={ghostBtn} disabled={isRunning}>
                25/5
              </button>
              <button onClick={() => preset("50")} style={ghostBtn} disabled={isRunning}>
                50/10
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14, opacity: 0.65, fontSize: 12 }}>
            Nota: quando um foco termina, os minutos são somados ao histórico do dia.
          </div>
        </Card>

        <Card title="Progresso (últimos 7 dias)" right={<Chip tone="yellow">Hoje: {hojeMin} min</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {ultimos7.map((d) => (
              <div key={d.day} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 60, fontSize: 12, opacity: 0.7 }}>{d.day}</div>
                <div style={{ flex: 1, height: 10, borderRadius: 999, background: "#F3F4F6", overflow: "hidden", border: "1px solid #E5E7EB" }}>
                  <div
                    style={{
                      width: `${Math.min(100, (d.minutes / 120) * 100)}%`, // 120min como meta visual
                      height: "100%",
                      background: "#111827",
                    }}
                  />
                </div>
                <div style={{ width: 70, textAlign: "right", fontSize: 12, opacity: 0.75 }}>
                  {d.minutes} min
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, opacity: 0.65, fontSize: 12 }}>
            A barra usa uma meta visual de 120 min/dia (podes alterar depois).
          </div>
        </Card>
      </div>
    </div>
  );
}

const lbl = { fontSize: 13, fontWeight: 800 };
const input = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  outline: "none",
};

const primaryBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #1F2937",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const ghostBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  background: "white",
  cursor: "pointer",
};
