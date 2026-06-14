import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  MessageCircle,
  FileText,
  ShieldCheck,
  BarChart3,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>SmartCampus</div>

        <Link to="/login" style={styles.loginBtn}>
          Entrar
        </Link>
      </header>

      <section style={styles.hero}>
        <div style={styles.heroText}>
          <div style={styles.badge}>Sistema de Gestão Escolar</div>

          <h1 style={styles.title}>
            Transformamos a gestão escolar com tecnologia
          </h1>

          <p style={styles.subtitle}>
            O SmartCampus conecta administração, professores e estudantes num
            único ambiente digital, facilitando materiais, notas, faltas,
            avisos e comunicação académica.
          </p>

          <div style={styles.actions}>
            <Link to="/login" style={styles.primaryBtn}>
              Entrar no sistema <ArrowRight size={18} />
            </Link>

            <a href="#funcionalidades" style={styles.secondaryBtn}>
              Ver funcionalidades
            </a>
          </div>
        </div>

        <div style={styles.heroCard}>
          <h3 style={styles.cardTitle}>Colégio Henriques do Kinaxixi</h3>
          <p style={styles.cardText}>
            Plataforma académica desenvolvida para organizar a comunicação
            escolar e reduzir a dependência de canais externos.
          </p>

          <div style={styles.heroStats}>
            <div>
              <strong>Admin</strong>
              <span>Gestão escolar</span>
            </div>
            <div>
              <strong>Professor</strong>
              <span>Aulas e avaliações</span>
            </div>
            <div>
              <strong>Aluno</strong>
              <span>Acompanhamento académico</span>
            </div>
          </div>
        </div>
      </section>

      <section id="funcionalidades" style={styles.section}>
        <h2 style={styles.sectionTitle}>Funcionalidades principais</h2>
        <p style={styles.sectionText}>
          Tudo o que a escola precisa para organizar a vida académica.
        </p>

        <div style={styles.grid}>
          <Feature icon={<Users />} title="Gestão académica" text="Turmas, alunos, professores, cursos e disciplinas." />
          <Feature icon={<BookOpen />} title="Materiais" text="Publicação de PDFs, documentos, links e conteúdos de apoio." />
          <Feature icon={<FileText />} title="Notas e faltas" text="Lançamento de avaliações e controlo de presença." />
          <Feature icon={<MessageCircle />} title="Comunicação" text="Chat académico entre professores e alunos." />
          <Feature icon={<BarChart3 />} title="Painéis" text="Indicadores para administração, professor e estudante." />
          <Feature icon={<ShieldCheck />} title="Segurança" text="Acesso por perfis e permissões específicas." />
        </div>
      </section>

      <section style={styles.about}>
        <div>
          <h2 style={styles.sectionTitle}>Sobre o projeto</h2>
          <p style={styles.sectionText}>
            O SmartCampus foi desenvolvido como solução para modernizar a
            comunicação académica, centralizando materiais, notas, faltas,
            avisos e interações escolares numa única plataforma.
          </p>
        </div>

        <div style={styles.steps}>
          <Step text="Administrador organiza a escola" />
          <Step text="Professor publica conteúdos e acompanha alunos" />
          <Step text="Aluno consulta tudo no seu painel" />
        </div>
      </section>

      <footer style={styles.footer}>
        <strong>SmartCampus</strong>
        <span>© 2026 Sistema de Gestão Escolar</span>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>{icon}</div>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureText}>{text}</p>
    </div>
  );
}

function Step({ text }) {
  return (
    <div style={styles.step}>
      <CheckCircle size={18} />
      <span>{text}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F5F9FC",
    color: "#0B1B2A",
    fontFamily: "Inter, system-ui, Arial, sans-serif",
  },
  header: {
    height: 76,
    padding: "0 7%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    borderBottom: "1px solid rgba(11,27,42,.08)",
  },
  logo: {
    fontSize: 24,
    fontWeight: 950,
    color: "#0A4174",
  },
  loginBtn: {
    textDecoration: "none",
    padding: "10px 18px",
    borderRadius: 14,
    background: "#0A4174",
    color: "#fff",
    fontWeight: 900,
  },
  hero: {
    padding: "70px 7%",
    display: "grid",
    gridTemplateColumns: "1.2fr .8fr",
    gap: 40,
    alignItems: "center",
  },
  badge: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(10,65,116,.08)",
    color: "#0A4174",
    fontWeight: 900,
    marginBottom: 18,
  },
  title: {
    fontSize: 56,
    lineHeight: 1.05,
    margin: 0,
    fontWeight: 950,
    letterSpacing: "-1.5px",
  },
  subtitle: {
    marginTop: 20,
    fontSize: 18,
    lineHeight: 1.7,
    color: "rgba(11,27,42,.68)",
    fontWeight: 650,
    maxWidth: 720,
  },
  actions: {
    marginTop: 30,
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },
  primaryBtn: {
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: 16,
    background: "linear-gradient(135deg, #0A4174, #4E8EA2)",
    color: "#fff",
    fontWeight: 950,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  secondaryBtn: {
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: 16,
    background: "#fff",
    border: "1px solid rgba(11,27,42,.10)",
    color: "#0B1B2A",
    fontWeight: 950,
  },
  heroCard: {
    background: "#fff",
    borderRadius: 28,
    padding: 28,
    border: "1px solid rgba(11,27,42,.08)",
    boxShadow: "0 24px 70px rgba(11,27,42,.12)",
  },
  cardTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 950,
    color: "#0A4174",
  },
  cardText: {
    color: "rgba(11,27,42,.68)",
    fontWeight: 650,
    lineHeight: 1.6,
  },
  heroStats: {
    display: "grid",
    gap: 12,
    marginTop: 22,
  },
  section: {
    padding: "40px 7% 70px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 34,
    fontWeight: 950,
  },
  sectionText: {
    marginTop: 10,
    color: "rgba(11,27,42,.66)",
    fontWeight: 650,
    lineHeight: 1.7,
    fontSize: 16,
  },
  grid: {
    marginTop: 28,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 18,
  },
  featureCard: {
    background: "#fff",
    borderRadius: 22,
    padding: 22,
    border: "1px solid rgba(11,27,42,.08)",
    boxShadow: "0 10px 30px rgba(11,27,42,.06)",
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    background: "rgba(10,65,116,.08)",
    color: "#0A4174",
    display: "grid",
    placeItems: "center",
  },
  featureTitle: {
    margin: "16px 0 8px",
    fontWeight: 950,
  },
  featureText: {
    margin: 0,
    color: "rgba(11,27,42,.62)",
    fontWeight: 650,
    lineHeight: 1.5,
  },
  about: {
    margin: "0 7% 60px",
    background: "#fff",
    borderRadius: 28,
    padding: 30,
    border: "1px solid rgba(11,27,42,.08)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  steps: {
    display: "grid",
    gap: 12,
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    background: "rgba(10,65,116,.06)",
    color: "#0A4174",
    fontWeight: 900,
  },
  footer: {
    padding: "24px 7%",
    background: "#0A4174",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
};