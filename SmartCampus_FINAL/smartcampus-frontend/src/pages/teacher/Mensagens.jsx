import { useMemo, useState } from "react";

export default function Mensagens() {
  const contactos = [
    { id: 1, nome: "Admin", tipo: "admin" },
    { id: 2, nome: "IG12A - Alunos", tipo: "turma" },
    { id: 3, nome: "IG12B - Alunos", tipo: "turma" },
  ];

  const [ativo, setAtivo] = useState(contactos[0]);
  const [texto, setTexto] = useState("");

  const [mensagens, setMensagens] = useState([
    { id: 1, de: "Admin", para: "Professor", texto: "Bom dia, não esqueça a reunião.", data: "09:10" },
    { id: 2, de: "Professor", para: "Admin", texto: "Obrigado pelo aviso.", data: "09:12" },
  ]);

  const conversa = useMemo(() => {
    return mensagens.filter(
      (m) =>
        m.de === ativo.nome ||
        m.para === ativo.nome ||
        ativo.nome === "Admin"
    );
  }, [mensagens, ativo]);

  function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;

    const nova = {
      id: Date.now(),
      de: "Professor",
      para: ativo.nome,
      texto: texto.trim(),
      data: new Date().toLocaleTimeString().slice(0, 5),
    };

    setMensagens((prev) => [...prev, nova]);
    setTexto("");
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "#0B1B2A" }}>Mensagens</h2>
          <p style={{ margin: "6px 0 0", color: "rgba(11,27,42,.65)", fontWeight: 650 }}>
            Comunicação com admin e turmas (simulado).
          </p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Lista contactos */}
        <div style={styles.sidebar}>
          {contactos.map((c) => (
            <div
              key={c.id}
              onClick={() => setAtivo(c)}
              style={{
                ...styles.contact,
                background:
                  ativo.id === c.id ? "rgba(11,27,42,.06)" : "transparent",
              }}
            >
              <div style={{ fontWeight: 900 }}>{c.nome}</div>
              <div style={styles.small}>{c.tipo}</div>
            </div>
          ))}
        </div>

        {/* Conversa */}
        <div style={styles.chat}>
          <div style={styles.chatHeader}>
            <div style={{ fontWeight: 950 }}>{ativo.nome}</div>
          </div>

          <div style={styles.chatBody}>
            {conversa.map((m) => (
              <div
                key={m.id}
                style={{
                  ...styles.msg,
                  alignSelf: m.de === "Professor" ? "flex-end" : "flex-start",
                  background:
                    m.de === "Professor"
                      ? "linear-gradient(135deg, #0A4174, #4E8EA2)"
                      : "#F1F5F9",
                  color: m.de === "Professor" ? "#fff" : "#0B1B2A",
                }}
              >
                <div>{m.texto}</div>
                <div style={styles.time}>{m.data}</div>
              </div>
            ))}
          </div>

          <form onSubmit={enviar} style={styles.chatForm}>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escreva a mensagem..."
              style={styles.input}
            />
            <button type="submit" style={styles.btnPrimary}>
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: 14,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 12,
  },
  sidebar: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    padding: 10,
    display: "grid",
    gap: 6,
    height: "520px",
  },
  contact: {
    padding: 12,
    borderRadius: 14,
    cursor: "pointer",
  },
  small: {
    fontSize: 12,
    color: "rgba(11,27,42,.6)",
    fontWeight: 700,
  },
  chat: {
    background: "#FFFFFF",
    border: "1px solid rgba(11,27,42,.10)",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
    display: "flex",
    flexDirection: "column",
    height: "520px",
  },
  chatHeader: {
    padding: 14,
    borderBottom: "1px solid rgba(11,27,42,.10)",
  },
  chatBody: {
    flex: 1,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },
  msg: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: 16,
    fontWeight: 700,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
    textAlign: "right",
  },
  chatForm: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid rgba(11,27,42,.10)",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    outline: "none",
  },
  btnPrimary: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 950,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
  },
};