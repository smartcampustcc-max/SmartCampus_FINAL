import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";

import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";

/* ================= SUPERADMIN ================= 
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import DashboardSuperAdmin from "./pages/SuperAdmin/DashboardSuperAdmin";
import Administradores from "./pages/SuperAdmin/Administradores";
import Escolas from "./pages/SuperAdmin/Escolas"; */

/* ================= ADMIN ESCOLA ================= */

import AdminLayout from "./layouts/AdminLayout";
import DashboardAdmin from "./pages/admin/Dashboard";
import Turmas from "./pages/admin/Turmas";
import Horarios from "./pages/admin/Horarios";
import Alunos from "./pages/admin/Alunos";
import Professores from "./pages/admin/Professores";
import Disciplinas from "./pages/admin/Disciplinas";
import Atribuicoes from "./pages/admin/Atribuicoes";
import Cursos from "./pages/admin/Cursos";
import Informacoes from "./pages/shared/Informacoes";
import Chats from "./pages/admin/Chats";

/* ================= PROFESSOR ================= */
import ProfessorLayout from "./layouts/ProfessorLayout";
import DashboardProfessor from "./pages/teacher/Dashboard";
import TurmasDisciplinas from "./pages/teacher/TurmasDisciplinas";
import Materiais from "./pages/teacher/Materiais";
import Notas from "./pages/teacher/Notas";
import Mensagens from "./pages/teacher/Mensagens";
import TurmaDisciplinadetalhe from "./pages/teacher/TurmaDisciplinadetalhe";

/* ================= ALUNO ================= */
import StudentLayout from "./layouts/StudentLayout";
import DashboardAluno from "./pages/student/Dashboard";
import DisciplinasAluno from "./pages/student/Disciplinas";
import HorarioAluno from "./pages/student/Horario";
import MateriaisAluno from "./pages/student/Materiais";
import NotasAluno from "./pages/student/Notas";
import FaltasAluno from "./pages/student/Faltas";
import MensagensAluno from "./pages/student/Mensagens";
import NotificacoesAluno from "./pages/student/Notificacoes";
import AgendaAluno from "./pages/student/Agenda";
import PomodoroAluno from "./pages/student/Pomodoro";
import GerirAlunosTurma from "./pages/admin/GerirAlunosTurma";
import AlterarSenha from "./pages/AlterarSenha";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
       {/*
        <Route element={<RequireRole role="superadmin" />}>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<DashboardSuperAdmin />} />
            <Route path="escolas" element={<Escolas />} />
            <Route path="administradores" element={<Administradores />} />
          </Route>
        </Route>*/}

    <Route element={<RequireRole role={["admin_escola", "admin"]} />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<DashboardAdmin />} />
    <Route path="turmas" element={<Turmas />} />
    <Route path="turmas/:turmaId/alunos" element={<GerirAlunosTurma />} />
    <Route path="alunos" element={<Alunos />} />
    <Route path="/admin/horarios" element={<Horarios />} />
    <Route path="professores" element={<Professores />} />
    <Route path="disciplinas" element={<Disciplinas />} />
     <Route path="chats" element={<Chats/>} />
    <Route path="atribuicoes" element={<Atribuicoes />} />
    <Route path="cursos" element={<Cursos />} />
    <Route path="informacoes" element={<Informacoes />} />
  </Route>
</Route>

      <Route element={<RequireRole role="professor" />}>
  <Route path="/professor" element={<ProfessorLayout />}>
    <Route index element={<Navigate to="/professor/dashboard" replace />} />
    <Route path="dashboard" element={<DashboardProfessor />} />
    <Route path="turmas-disciplinas" element={<TurmasDisciplinas />} />
    <Route path="materiais" element={<Materiais />} />
    <Route path="notas" element={<Notas />} />
    <Route path="mensagens" element={<Mensagens />} />
    <Route path="informacoes" element={<Informacoes />} />
    <Route
      path="turma/:turmaId/disciplina/:disciplinaId"
      element={<TurmaDisciplinadetalhe />}
    />
  </Route>
</Route>

        <Route element={<RequireRole role="estudante" />}>
          <Route path="/aluno" element={<StudentLayout />}>
            <Route index element={<Navigate to="/aluno/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAluno />} />
            <Route path="disciplinas" element={<DisciplinasAluno />} />
            <Route path="horario" element={<HorarioAluno />} />
            <Route path="materiais" element={<MateriaisAluno />} />
            <Route path="notas" element={<NotasAluno />} />
            <Route path="faltas" element={<FaltasAluno />} />
            <Route path="mensagens" element={<MensagensAluno />} />
            <Route path="agenda" element={<AgendaAluno />} />
            <Route path="pomodoro" element={<PomodoroAluno />} />
            <Route path="notificacoes" element={<NotificacoesAluno />} />
            <Route path="informacoes" element={<Informacoes />} />
          </Route>
        </Route>
      </Route>
 <Route path="/alterar-senha" element={<AlterarSenha />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}