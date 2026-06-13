<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Atribuicao;
use App\Models\SalaDeAula;
use App\Models\User;
use Illuminate\Http\Request;

class AtribuicaoController extends Controller
{
    public function index(Request $request)
    {
        $escolaId = $request->user()->escola_id;

        return Atribuicao::with([
                'professor:id,name,email,username,phone',
                'turma:id,nome,codigo_turma,classe,turno,ano_letivo,curso_id',
                'turma.curso:id,nome',
                'disciplina:id,nome,codigo',
            ])
            ->where('escola_id', $escolaId)
            ->orderByDesc('id')
            ->get();
    }

    public function store(Request $request)
    {
        $escolaId = $request->user()->escola_id;

        $data = $request->validate([
            'professor_id' => ['required', 'integer', 'exists:users,id'],
            'turma_id' => ['required', 'integer', 'exists:salas_de_aula,id'],
            'disciplina_id' => ['required', 'integer', 'exists:disciplinas,id'],
        ]);

        $professor = User::where('id', $data['professor_id'])
            ->where('escola_id', $escolaId)
            ->where('role', 'professor')
            ->first();

        if (!$professor) {
            return response()->json([
                'message' => 'O utilizador selecionado não é professor.',
            ], 422);
        }

        $turma = SalaDeAula::where('id', $data['turma_id'])
            ->where('escola_id', $escolaId)
            ->firstOrFail();

        $disciplinaPertenceTurma = $turma->disciplinas()
            ->where('disciplinas.id', $data['disciplina_id'])
            ->exists();

        if (!$disciplinaPertenceTurma) {
            return response()->json([
                'message' => 'Esta disciplina não pertence à turma selecionada.',
            ], 422);
        }

        $professorLecionaDisciplina = $professor->disciplinas()
            ->where('disciplinas.id', $data['disciplina_id'])
            ->exists();

        if (!$professorLecionaDisciplina) {
            return response()->json([
                'message' => 'Este professor não lecciona esta disciplina.',
            ], 422);
        }

        $existeTurmaDisciplina = Atribuicao::where('escola_id', $escolaId)
            ->where('turma_id', $data['turma_id'])
            ->where('disciplina_id', $data['disciplina_id'])
            ->exists();

        if ($existeTurmaDisciplina) {
            return response()->json([
                'message' => 'Já existe uma atribuição para esta turma e disciplina.',
            ], 422);
        }

        $turmasDoProfessor = Atribuicao::where('escola_id', $escolaId)
            ->where('professor_id', $data['professor_id'])
            ->distinct()
            ->pluck('turma_id');

        if (
            !$turmasDoProfessor->contains((int) $data['turma_id']) &&
            $turmasDoProfessor->count() >= 2
        ) {
            return response()->json([
                'message' => 'Este professor já está associado ao limite máximo de 2 turmas.',
            ], 422);
        }
       $existeMesmaAtribuicao = Atribuicao::where('professor_id', $data['professor_id'])
    ->where('turma_id', $data['turma_id'])
    ->where('disciplina_id', $data['disciplina_id'])
    ->exists();

if ($existeMesmaAtribuicao) {
    return response()->json([
        'message' => 'Esta atribuição já existe para este professor, turma e disciplina.',
    ], 422);
}
        $atrib = Atribuicao::create([
            'professor_id' => $data['professor_id'],
            'turma_id' => $data['turma_id'],
            'disciplina_id' => $data['disciplina_id'],
            'escola_id' => $escolaId,
        ]);

        return response()->json([
            'message' => 'Atribuição criada com sucesso.',
            'atrib' => $atrib->load(['professor', 'turma.curso', 'disciplina']),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        return Atribuicao::with(['professor', 'turma.curso', 'disciplina'])
            ->where('escola_id', $escolaId)
            ->findOrFail($id);
    }

    public function destroy(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        $a = Atribuicao::where('escola_id', $escolaId)->findOrFail($id);
        $a->delete();

        return response()->json([
            'message' => 'Atribuição removida.',
        ]);
    }

    public function byTurma(Request $request, $turmaId)
    {
        $escolaId = $request->user()->escola_id;

        return Atribuicao::with(['professor', 'disciplina'])
            ->where('escola_id', $escolaId)
            ->where('turma_id', $turmaId)
            ->get();
    }

    public function byProfessor(Request $request, $professorId)
    {
        $escolaId = $request->user()->escola_id;

        return Atribuicao::with(['turma.curso', 'disciplina'])
            ->where('escola_id', $escolaId)
            ->where('professor_id', $professorId)
            ->get();
    }
}