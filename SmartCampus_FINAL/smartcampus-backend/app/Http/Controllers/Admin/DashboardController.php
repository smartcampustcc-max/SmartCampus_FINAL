<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\SalaDeAula;
use App\Models\Estudante;
use App\Models\User;
use App\Models\Disciplina;

class DashboardController extends Controller
{
    public function index()
    {
        $escolaId = auth()->user()->escola_id;

        $turmas = SalaDeAula::where('escola_id', $escolaId)
            ->withCount('estudantes')
            ->get();

        $totalVagas = $turmas->sum(function ($turma) {
            return (int) ($turma->limite_alunos ?? 0);
        });

        $vagasOcupadas = $turmas->sum(function ($turma) {
            return (int) ($turma->estudantes_count ?? 0);
        });

        $vagasDisponiveis = max(0, $totalVagas - $vagasOcupadas);

        $turmasLotadas = $turmas->filter(function ($turma) {
            return (int) $turma->estudantes_count >= (int) ($turma->limite_alunos ?? 0);
        })->count();

        $turmasComVagas = $turmas->filter(function ($turma) {
            return (int) $turma->estudantes_count < (int) ($turma->limite_alunos ?? 0);
        })->count();

        return response()->json([
            'cursos' => Curso::where('escola_id', $escolaId)->count(),

            'turmas' => $turmas->count(),

            'alunos' => Estudante::where('escola_id', $escolaId)->count(),

            'professores' => User::where('role', 'professor')
                ->where('escola_id', $escolaId)
                ->count(),

            'disciplinas' => Disciplina::where('escola_id', $escolaId)->count(),

            'avisos' => 0,

            'alunos_sem_turma' => Estudante::where('escola_id', $escolaId)
                ->whereNull('sala_de_aula_id')
                ->count(),

            'turmas_lotadas' => $turmasLotadas,

            'turmas_com_vagas' => $turmasComVagas,

            'total_vagas' => $totalVagas,

            'vagas_ocupadas' => $vagasOcupadas,

            'vagas_disponiveis' => $vagasDisponiveis,
        ]);
    }
}