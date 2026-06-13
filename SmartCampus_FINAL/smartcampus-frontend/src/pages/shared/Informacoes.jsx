import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import http from "../../api/http";
import {
  Building2,
  Mail,
  Phone,
  User,
  Shield,
  MapPin,
  Lock,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
export default function Informacoes() {
  const { user } = useAuth();
  const escola = user?.escola || null;
  const [openSenha, setOpenSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formSenha, setFormSenha] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [modalMsg, setModalMsg] = useState({
    open: false,
    type: "",
    text: "",
  });
  function limparSenha() {
    setFormSenha({
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });
  }
  async function alterarSenha(e) {
    e.preventDefault();
    if (!formSenha.current_password.trim()) {
      setModalMsg({
        open: true,
        type: "error",
        text: "Informe a palavra-passe atual.",
      });
      return;
    }
    if (formSenha.new_password.length < 6) {
      setModalMsg({
        open: true,
        type: "error",
        text: "A nova palavra-passe deve ter pelo menos 6 caracteres.",
      });
      return;
    }
    if (formSenha.new_password !== formSenha.new_password_confirmation) {
      setModalMsg({
        open: true,
        type: "error",
        text: "A confirmação da palavra-passe não coincide.",
      });
      return;
    }
    try {
      setLoading(true);
      await http.post("/auth/change-password", formSenha);
      setOpenSenha(false);
      limparSenha();
      setModalMsg({
        open: true,
        type: "success",
        text: "Palavra-passe alterada com sucesso. Faça login novamente.",
      });
    } catch (e) {
      setModalMsg({
        open: true,
        type: "error",
        text: e?.response?.data?.message || "Erro ao alterar palavra-passe.",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Meu Perfil</h2>
            <p style={styles.subtitle}>
              Consulta os dados da tua conta e da escola associada.
            </p>
          </div>
          <button style={styles.btnPrimary} onClick={() => setOpenSenha(true)}>
            <Lock size={16} />
            Alterar palavra-passe
          </button>
        </div>
        <div style={styles.grid}>
          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>Dados da Conta</div>
            <InfoRow icon={<User size={18} />} label="Nome" value={user?.name || "-"} />
            <InfoRow icon={<Mail size={18} />} label="Email" value={user?.email || "-"} />
            <InfoRow icon={<Phone size={18} />} label="Telefone" value={user?.phone || "-"} />
            <InfoRow icon={<Shield size={18} />} label="Perfil" value={user?.role || "-"} />
            <InfoRow icon={<User size={18} />} label="Username" value={user?.username || "-"} />
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>Dados da Escola</div>
            <InfoRow
              icon={<Building2 size={18} />}
              label="Nome da escola"
              value={escola?.nome || "Sem escola associada"}
            />
            <InfoRow icon={<Mail size={18} />} label="Email da escola" value={escola?.email || "-"} />
            <InfoRow icon={<Phone size={18} />} label="Telefone" value={escola?.telefone || "-"} />
            <InfoRow icon={<MapPin size={18} />} label="Localização" value={escola?.localizacao || "-"} />
            <InfoRow icon={<Shield size={18} />} label="Estado" value={escola?.status || "-"} />
          </div>
        </div>
      </div>
      {openSenha && (
        <div style={styles.backdrop} onClick={() => setOpenSenha(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: "#0B1B2A" }}>
                  Alterar palavra-passe
                </h3>
                <p style={styles.subtitle}>
                  Esta alteração é opcional. Usa-a apenas se desejares trocar a tua senha.
                </p>
              </div>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={() => {
                  setOpenSenha(false);
                  limparSenha();
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={alterarSenha} style={styles.form}>
              <div>
                <div style={styles.label}>Palavra-passe atual</div>
                <input
                  type="password"
                  style={styles.input}
                  value={formSenha.current_password}
                  onChange={(e) =>
                    setFormSenha((p) => ({
                      ...p,
                      current_password: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <div style={styles.label}>Nova palavra-passe</div>
                <input
                  type="password"
                  style={styles.input}
                  value={formSenha.new_password}
                  onChange={(e) =>
                    setFormSenha((p) => ({
                      ...p,
                      new_password: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <div style={styles.label}>Confirmar nova palavra-passe</div>
                <input
                  type="password"
                  style={styles.input}
                  value={formSenha.new_password_confirmation}
                  onChange={(e) =>
                    setFormSenha((p) => ({
                      ...p,
                      new_password_confirmation: e.target.value,
                    }))
                  }
                />
              </div>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.btnGhost}
                  onClick={() => {
                    setOpenSenha(false);
                    limparSenha();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary} disabled={loading}>
                  {loading ? "A guardar..." : "Guardar alteração"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalMsg.open && (
        <div
          style={styles.backdrop}
          onClick={() => setModalMsg({ open: false, type: "", text: "" })}
        >
          <div style={styles.messageModal} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                ...styles.messageIcon,
                ...(modalMsg.type === "success"
                  ? styles.successIcon
                  : styles.errorIcon),
              }}
            >
              {modalMsg.type === "success" ? (
                <CheckCircle2 size={34} />
              ) : (
                <XCircle size={34} />
              )}
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                color: modalMsg.type === "success" ? "#166534" : "#B91C1C",
              }}
            >
              {modalMsg.type === "success" ? "Sucesso" : "Atenção"}
            </h3>
            <p style={styles.messageText}>{modalMsg.text}</p>
            <button
              type="button"
              style={modalMsg.type === "success" ? styles.btnPrimary : styles.btnDanger}
              onClick={() => setModalMsg({ open: false, type: "", text: "" })}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function InfoRow({ icon, label, value }) {
  return (
    <div style={styles.row}>
      <div style={styles.rowLeft}>
        <div style={styles.iconWrap}>{icon}</div>
        <div style={styles.label}>{label}</div>
      </div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}
const styles = {
  wrap: {
    display: "grid",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid rgba(11,27,42,.08)",
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(11,27,42,.06)",
    padding: 18,
  },
  header: {
    marginBottom: 18,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 950,
    color: "#0B1B2A",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "rgba(11,27,42,.62)",
    fontWeight: 650,
    lineHeight: 1.45,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
  },
  infoCard: {
    border: "1px solid rgba(11,27,42,.08)",
    borderRadius: 18,
    padding: 16,
    background: "rgba(11,27,42,.02)",
  },
  infoTitle: {
    fontWeight: 900,
    fontSize: 18,
    color: "#0B1B2A",
    marginBottom: 14,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(11,27,42,.06)",
    flexWrap: "wrap",
  },
  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(10,65,116,.08)",
    color: "#0A4174",
  },
  label: {
    color: "rgba(11,27,42,.68)",
    fontWeight: 800,
  },
  value: {
    color: "#0B1B2A",
    fontWeight: 900,
    maxWidth: 360,
    textAlign: "right",
    overflowWrap: "anywhere",
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
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "#fff",
    color: "#0B1B2A",
  },
  btnDanger: {
    border: "1px solid rgba(239,68,68,.25)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.30)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 30000,
  },
  modal: {
    width: "min(460px, 100%)",
    background: "#fff",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,.22)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.12)",
    background: "#fff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  form: {
    display: "grid",
    gap: 12,
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    border: "1px solid rgba(11,27,42,.14)",
    outline: "none",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  messageModal: {
    width: "min(390px, 100%)",
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,.22)",
    textAlign: "center",
  },
  messageIcon: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "grid",
    placeItems: "center",
  },
  successIcon: {
    background: "rgba(34,197,94,.12)",
    color: "#16A34A",
    border: "1px solid rgba(34,197,94,.20)",
  },
  errorIcon: {
    background: "rgba(239,68,68,.12)",
    color: "#DC2626",
    border: "1px solid rgba(239,68,68,.20)",
  },
  messageText: {
    margin: "0 0 18px",
    color: "rgba(11,27,42,.70)",
    fontWeight: 650,
    lineHeight: 1.5,
  },
};