import { useEffect, useState } from "react";
import http from "../../api/http";

export default function DashboardSuperAdmin() {
  const [stats, setStats] = useState(null);
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTudo() {
      try {
        const [statsRes, escolasRes] = await Promise.all([
          http.get("/superadmin/estatisticas"),
          http.get("/superadmin/escolas"),
        ]);
        setStats(statsRes.data);
        setEscolas(Array.isArray(escolasRes.data) ? escolasRes.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTudo();
  }, []);

  async function toggleStatus(escola) {
    const novoStatus = escola.status === "Ativo" ? "Inativo" : "Ativo";
    try {
      await http.put(`/superadmin/escolas/${escola.id}`, {
        nome: escola.nome,
        email: escola.email || "",
        telefone: escola.telefone || "",
        localizacao: escola.localizacao || "",
        logo: escola.logo || "",
        admin_nome: escola.admin_nome || "",
        admin_email: escola.admin_email || "",
        status: novoStatus,
      });
      setEscolas((prev) =>
        prev.map((e) => (e.id === escola.id ? { ...e, status: novoStatus } : e))
      );
    } catch (err) {
      console.error(err);
    }
  }

  const cards = [
    { label: "Escolas Registadas", key: "escolas", cor: "#0F3DDE" },
    { label: "Administradores", key: "admins", cor: "#7C3AED" },
    { label: "Professores", key: "professores", cor: "#0891B2" },
    { label: "Alunos", key: "alunos", cor: "#16A34A" },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Painel do Super Admin</h2>
        <p style={{ color: "rgba(11,27,42,.6)" }}>
          Visão geral da plataforma SmartCampus.
        </p>
      </div>

      {/* Estatísticas */}
      <div style={styles.grid4}>
        {cards.map((c) => (
          <div key={c.key} style={styles.statCard}>
            <p style={styles.statLabel}>{c.label}</p>
            <h1 style={{ ...styles.statNum, color: c.cor }}>
              {loading ? "..." : stats ? stats[c.key] : "0"}
            </h1>
          </div>
        ))}
      </div>

      {/* Lista de escolas com toggle de status */}
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Escolas Registadas</h3>
        {loading ? (
          <p>A carregar...</p>
        ) : escolas.length === 0 ? (
          <p style={{ color: "rgba(11,27,42,.5)" }}>Nenhuma escola registada.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Localização</th>
                <th style={styles.th}>Administrador</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Acção</th>
              </tr>
            </thead>
            <tbody>
              {escolas.map((e) => (
                <tr key={e.id}>
                  <td style={styles.td}>{e.nome}</td>
                  <td style={styles.td}>{e.localizacao || "-"}</td>
                  <td style={styles.td}>{e.admin_nome || "-"}</td>
                  <td style={styles.td}>
                    <span style={e.status === "Ativo" ? styles.badgeOk : styles.badgeWarn}>
                      {e.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => toggleStatus(e)}
                      style={e.status === "Ativo" ? styles.btnDesativar : styles.btnAtivar}
                    >
                      {e.status === "Ativo" ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 20,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
  statCard: {
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    border: "1px solid rgba(11,27,42,.10)",
    boxShadow: "0 10px 30px rgba(11,27,42,.08)",
  },
  statLabel: {
    margin: 0,
    color: "rgba(11,27,42,.6)",
    fontWeight: 600,
    fontSize: 13,
  },
  statNum: {
    margin: "8px 0 0",
    fontSize: 48,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "2px solid rgba(11,27,42,.08)",
    fontWeight: 800,
    color: "rgba(11,27,42,.6)",
    fontSize: 13,
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid rgba(11,27,42,.06)",
    fontSize: 14,
  },
  badgeOk: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(34,197,94,.10)",
    border: "1px solid rgba(34,197,94,.25)",
    color: "#166534",
    fontWeight: 700,
    fontSize: 12,
  },
  badgeWarn: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(245,158,11,.12)",
    border: "1px solid rgba(245,158,11,.30)",
    color: "#7C4A03",
    fontWeight: 700,
    fontSize: 12,
  },
  btnAtivar: {
    padding: "6px 12px",
    borderRadius: 10,
    border: "1px solid rgba(34,197,94,.25)",
    background: "rgba(34,197,94,.10)",
    color: "#166534",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },
  btnDesativar: {
    padding: "6px 12px",
    borderRadius: 10,
    border: "1px solid rgba(239,68,68,.25)",
    background: "rgba(239,68,68,.10)",
    color: "#B91C1C",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },
};