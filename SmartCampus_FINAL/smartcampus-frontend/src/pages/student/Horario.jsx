import { useMemo, useState } from "react";

export default function HorarioAluno() {
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  const [dia, setDia] = useState("Segunda");

  // Horário simulado
  const aulas = [
    { id: 1, dia: "Segunda", hora: "08:00 - 10:00", disciplina: "Programação", sala: "Lab 2" },
    { id: 2, dia: "Segunda", hora: "10:15 - 11:45", disciplina: "Matemática", sala: "Sala 5" },
    { id: 3, dia: "Terça", hora: "08:00 - 09:30", disciplina: "Redes", sala: "Lab 1" },
    { id: 4, dia: "Quarta", hora: "09:45 - 11:15", disciplina: "Física", sala: "Sala 3" },
    { id: 5, dia: "Quinta", hora: "08:00 - 10:00", disciplina: "Programação", sala: "Lab 2" },
    { id: 6, dia: "Sexta", hora: "10:00 - 11:30", disciplina: "Química", sala: "Sala 4" },
  ];

  const aulasDoDia = useMemo(() => {
    return aulas.filter((a) => a.dia === dia);
  }, [dia]);

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "#0B1B2A" }}>Horário</h2>
          <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
            Visualiza as tuas aulas por dia da semana.
          </p>
        </div>

        <div style={styles.pill}>{dia}</div>
      </div>

      {/* Dias */}
      <div style={styles.days}>
        {dias.map((d) => (
          <button
            key={d}
            onClick={() => setDia(d)}
            style={{
              ...styles.dayBtn,
              background: dia === d ? "linear-gradient(135deg, #0A4174, #4E8EA2)" : "#fff",
              color: dia === d ? "#fff" : "#0B1B2A",
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Aulas */}
      <div style={{ ...styles.card, marginTop: 14 }}>
        {aulasDoDia.map((a) => (
          <div key={a.id} style={styles.aula}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 950 }}>{a.disciplina}</div>
              <div style={styles.small}>
                {a.hora} • {a.sala}
              </div>
            </div>

            <span style={styles.badge}>{a.dia}</span>
          </div>
        ))}

        {aulasDoDia.length === 0 && (
          <div style={styles.empty}>Sem aulas neste dia.</div>
        )}
      </div>

      <div style={styles.hint}>
        * Depois este horário virá diretamente do backend, conforme a turma do aluno.
      </div>
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
  days: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  dayBtn: {
    border: "1px solid rgba(11,27,42,.14)",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
    display: "grid",
    gap: 12,
  },
  aula: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(11,27,42,.10)",
    background: "rgba(11,27,42,.02)",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    fontSize: 12,
  },
  pill: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
  },
  small: {
    fontSize: 12,
    color: "rgba(11,27,42,.6)",
    fontWeight: 700,
    marginTop: 6,
  },
  empty: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(11,27,42,.18)",
    background: "rgba(11,27,42,.03)",
    color: "rgba(11,27,42,.7)",
    fontWeight: 750,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: 650,
    color: "rgba(11,27,42,.6)",
  },
};