import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

export default function AlterarSenha() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    new_password: "",
    new_password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!form.new_password.trim()) {
      setMsg({ type: "error", text: "Digite a nova senha." });
      return;
    }

    if (form.new_password.length < 6) {
      setMsg({ type: "error", text: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    if (form.new_password !== form.new_password_confirmation) {
      setMsg({ type: "error", text: "A confirmação da senha não coincide." });
      return;
    }

    setLoading(true);

    try {
      await http.post("/auth/first-change-password", {
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation,
      });

      setMsg({ type: "ok", text: "Senha alterada com sucesso." });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Erro ao alterar senha.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Alterar senha</h2>
        <p style={styles.subtitle}>
         Altere a sua senha sempre que desejar.
        </p>

        {msg.text && (
          <div
            style={{
              ...styles.message,
              borderColor: msg.type === "ok" ? "rgba(34,197,94,.25)" : "rgba(239,68,68,.25)",
              background: msg.type === "ok" ? "rgba(34,197,94,.10)" : "rgba(239,68,68,.10)",
              color: msg.type === "ok" ? "#166534" : "#B91C1C",
            }}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Nova senha</label>
            <input
              type="password"
              value={form.new_password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, new_password: e.target.value }))
              }
              style={styles.input}
              placeholder="Digite a nova senha"
            />
          </div>

          <div>
            <label style={styles.label}>Confirmar nova senha</label>
            <input
              type="password"
              value={form.new_password_confirmation}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  new_password_confirmation: e.target.value,
                }))
              }
              style={styles.input}
              placeholder="Confirme a nova senha"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "A guardar..." : "Guardar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.20)",
  },
  title: {
    margin: 0,
    marginBottom: 8,
    color: "#0B1B2A",
    fontWeight: 900,
  },
  subtitle: {
    margin: 0,
    marginBottom: 20,
    color: "rgba(11,27,42,.65)",
    fontWeight: 600,
  },
  form: {
    display: "grid",
    gap: 14,
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontWeight: 800,
    color: "#0B1B2A",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.14)",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    border: "1px solid rgba(37,99,235,.25)",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(37,99,235,.12)",
    color: "#1D4ED8",
  },
  message: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    border: "1px solid",
    fontWeight: 700,
  },
};