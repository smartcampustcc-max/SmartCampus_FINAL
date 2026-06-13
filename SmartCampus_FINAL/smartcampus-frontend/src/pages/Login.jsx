import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../api/auth";
import http from "../api/http";
import { useAuth } from "../auth/AuthProvider";
import logo from "../assets/logosmartcampus.png";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [recuperarMsg, setRecuperarMsg] = useState("");
  const [recuperarErro, setRecuperarErro] = useState("");
  const [recuperarLoading, setRecuperarLoading] = useState(false);

  const { refresh } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const data = await apiLogin(login, password);
      const u = await refresh();


      const role = String(data?.role || data?.user?.role || u?.role || u?.perfil || "")
        .toLowerCase()
        .trim();

      if (role === "superadmin") navigate("/superadmin", { replace: true });
      else if (role === "admin_escola") navigate("/admin/dashboard", { replace: true });
      else if (role === "professor") navigate("/professor/dashboard", { replace: true });
      else if (role === "estudante" || role === "aluno") navigate("/aluno/dashboard", { replace: true });
      else navigate("/login", { replace: true });
    } catch (err) {
      setMsg(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.login?.[0] ||
          err?.message ||
          "Erro no login"
      );
    } finally {
      setLoading(false);
    }
  }

  async function recuperarPassword(e) {
    e.preventDefault();
    setRecuperarMsg("");
    setRecuperarErro("");

    if (!telefone.trim()) {
      setRecuperarErro("Informe o número de telemóvel.");
      return;
    }

    if (!/^9[1-9][0-9]{7}$/.test(telefone)) {
      setRecuperarErro("Número inválido. Ex: 923456789.");
      return;
    }

    setRecuperarLoading(true);

    try {
      const res = await http.post("/auth/recuperar-password", {
        phone: telefone,
        telefone: telefone,
      });

      setRecuperarMsg(res?.data?.message || "Senha temporária enviada por SMS.");
      setTelefone("");
    } catch (err) {
      setRecuperarErro(err?.response?.data?.message || "Erro ao recuperar palavra-passe.");
    } finally {
      setRecuperarLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.left}>
          <img src={logo} alt="SmartCampus" style={styles.logo} />
          <div style={styles.brand}>SmartCampus</div>
          <div style={styles.desc}>
            Plataforma escolar inteligente para alunos, professores e administração.
            <br />
            <b>Organiza • Comunica • Evolui</b>
          </div>

        
        </div>

        <div style={styles.right}>
          {!modoRecuperar ? (
            <>
              <div style={styles.sub}>Entra para aceder ao teu painel.</div>

              <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
                <label style={styles.label}>Utilizador</label>
                <input
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="email ou username"
                  style={styles.input}
                />

                <label style={{ ...styles.label, marginTop: 14 }}>Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  style={styles.input}
                />

                {msg && <div style={styles.msg}>{msg}</div>}

                <button type="submit" style={styles.btn} disabled={loading}>
                  {loading ? "A entrar..." : "Entrar"}
                </button>

                <div style={{ marginTop: 14, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setModoRecuperar(true);
                      setMsg("");
                      setRecuperarMsg("");
                      setRecuperarErro("");
                    }}
                    style={styles.linkBtn}
                  >
                    Esqueceu a palavra-passe?
                  </button>
                </div>

                <div style={styles.bottom}>
                  <small style={{ color: "rgba(255,255,255,.72)" }}>
                    Ao continuar, aceitas os Termos & Serviços.
                  </small>
                </div>
              </form>
            </>
          ) : (
            <>
              <div style={styles.sub}>Recuperar palavra-passe</div>
              <p style={{ color: "rgba(255,255,255,.72)", lineHeight: 1.5 }}>
                Insere o número de telemóvel registado no sistema. Vamos enviar uma senha temporária por SMS.
              </p>

              <form onSubmit={recuperarPassword} style={{ marginTop: 18 }}>
                <label style={styles.label}>Telemóvel</label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="Ex: 923456789"
                  style={styles.input}
                />

                {recuperarErro && <div style={styles.msg}>{recuperarErro}</div>}
                {recuperarMsg && <div style={styles.successMsg}>{recuperarMsg}</div>}

                <button type="submit" style={styles.btn} disabled={recuperarLoading}>
                  {recuperarLoading ? "A enviar..." : "Enviar SMS"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModoRecuperar(false);
                    setTelefone("");
                    setRecuperarMsg("");
                    setRecuperarErro("");
                  }}
                  style={styles.backBtn}
                >
                  ← Voltar ao login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 18,
    background:
      "radial-gradient(900px 420px at 15% 0%, rgba(123,189,232,.35), transparent 60%)," +
      "radial-gradient(900px 420px at 85% 10%, rgba(78,142,162,.25), transparent 55%)," +
      "#F5F9FC",
  },
  card: {
    width: "min(1040px, 96vw)",
    minHeight: 520,
    borderRadius: 26,
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    boxShadow: "0 20px 60px rgba(0,0,0,.18)",
    border: "1px solid rgba(255,255,255,.25)",
    background: "rgba(255,255,255,.18)",
    backdropFilter: "blur(10px)",
  },
  left: {
    padding: 34,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    background:
      "radial-gradient(800px 420px at 25% 10%, rgba(123,189,232,.55), transparent 60%)," +
      "linear-gradient(135deg, rgba(255,255,255,.78), rgba(255,255,255,.28))",
  },
  logo: {
    width: 340,
    height: "auto",
    objectFit: "contain",
    marginBottom: 18,
    filter: "drop-shadow(0px 8px 18px rgba(0,0,0,.15))",
  },
  brand: { fontSize: 44, fontWeight: 950, letterSpacing: 0.2, color: "#001D39" },
  desc: { marginTop: 10, maxWidth: 460, color: "rgba(0,29,57,.72)", lineHeight: 1.55 },
  footer: {
    marginTop: 22,
    paddingTop: 12,
    borderTop: "1px solid rgba(0,29,57,.14)",
    width: "fit-content",
  },
  supportLink: {
    color: "rgba(0,29,57,.72)",
    fontWeight: 800,
    textDecoration: "none",
  },
  right: {
    padding: 34,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "linear-gradient(160deg, rgba(0,29,57,0.92), rgba(10,65,116,0.92))",
  },
  sub: { marginTop: 10, color: "rgba(255,255,255,.75)", lineHeight: 1.5, fontWeight: 800 },
  label: { display: "block", fontWeight: 850, marginBottom: 8, color: "rgba(255,255,255,.88)" },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.18)",
    outline: "none",
    background: "rgba(255,255,255,.12)",
    color: "#fff",
    boxSizing: "border-box",
  },
  msg: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(239,68,68,.18)",
    border: "1px solid rgba(239,68,68,.35)",
    color: "#fff",
    fontWeight: 850,
  },
  successMsg: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(34,197,94,.18)",
    border: "1px solid rgba(34,197,94,.35)",
    color: "#fff",
    fontWeight: 850,
  },
  btn: {
    marginTop: 16,
    width: "100%",
    padding: "12px 18px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 950,
    color: "#fff",
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
    boxShadow: "0 10px 22px rgba(0,0,0,.18)",
  },
  linkBtn: {
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,.82)",
    fontWeight: 850,
    cursor: "pointer",
    textDecoration: "underline",
  },
  backBtn: {
    marginTop: 12,
    width: "100%",
    border: "1px solid rgba(255,255,255,.20)",
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    padding: "11px 16px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 900,
  },
  bottom: { marginTop: 16, textAlign: "center", opacity: 0.95 },
};