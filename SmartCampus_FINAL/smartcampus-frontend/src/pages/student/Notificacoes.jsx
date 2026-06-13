import { useState } from "react";

export default function NotificacoesAluno() {
  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      titulo: "Novo material disponível",
      mensagem: "O professor João adicionou material de Programação.",
      tipo: "material",
      data: "Hoje • 09:20",
      lida: false,
    },
    {
      id: 2,
      titulo: "Nova mensagem",
      mensagem: "Tens uma nova mensagem do professor Maria.",
      tipo: "mensagem",
      data: "Ontem • 18:40",
      lida: false,
    },
    {
      id: 3,
      titulo: "Nota lançada",
      mensagem: "A tua nota de Redes já está disponível.",
      tipo: "nota",
      data: "20 Jan • 14:10",
      lida: true,
    },
  ]);

  function marcarLida(id) {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }

  function remover(id) {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  }

  function badge(tipo) {
    if (tipo === "material") return styles.badgeInfo;
    if (tipo === "mensagem") return styles.badgeWarn;
    if (tipo === "nota") return styles.badgeOk;
    return styles.badge;
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "#0B1B2A" }}>Notificações</h2>
          <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
            Avisos importantes sobre a tua atividade académica.
          </p>
        </div>

        <div style={styles.pill}>
          {notificacoes.filter((n) => !n.lida).length} novas
        </div>
      </div>

      {/* Lista */}
      <div style={styles.card}>
        {notificacoes.map((n) => (
          <div
            key={n.id}
            style={{
              ...styles.item,
              background: n.lida ? "rgba(11,27,42,.02)" : "rgba(11,27,42,.06)",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={badge(n.tipo)}>{n.tipo}</span>
                <div style={{ fontWeight: 950 }}>{n.titulo}</div>
              </div>

              <div style={styles.msg}>{n.mensagem}</div>
              <div style={styles.date}>{n.data}</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {!n.lida && (
                <button onClick={() => marcarLida(n.id)} style={styles.btnGhost}>
                  Marcar como lida
                </button>
              )}
              <button onClick={() => remover(n.id)} style={styles.btnDanger}>
                Remover
              </button>
            </div>
          </div>
        ))}

        {notificacoes.length === 0 && (
          <div style={styles.empty}>Sem notificações.</div>
        )}
      </div>

      <div style={styles.hint}>
        * No backend, estas notificações virão de eventos reais (mensagens, notas, materiais).
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
  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 16,
    display: "grid",
    gap: 12,
  },
  item: {
    display: "flex",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(11,27,42,.10)",
  },
  msg: {
    marginTop: 6,
    color: "rgba(11,27,42,.75)",
    fontWeight: 650,
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(11,27,42,.55)",
    fontWeight: 700,
  },
  pill: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    color: "#0B1B2A",
  },
  badge: {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(11,27,42,.12)",
    background: "rgba(11,27,42,.03)",
    fontWeight: 900,
    fontSize: 11,
    textTransform: "uppercase",
  },
  badgeInfo: {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(59,130,246,.35)",
    background: "rgba(59,130,246,.12)",
    color: "#1D4ED8",
    fontWeight: 900,
    fontSize: 11,
    textTransform: "uppercase",
  },
  badgeWarn: {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(245,158,11,.35)",
    background: "rgba(245,158,11,.12)",
    color: "#92400E",
    fontWeight: 900,
    fontSize: 11,
    textTransform: "uppercase",
  },
  badgeOk: {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,.35)",
    background: "rgba(34,197,94,.12)",
    color: "#166534",
    fontWeight: 900,
    fontSize: 11,
    textTransform: "uppercase",
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