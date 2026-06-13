<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Horario;
use App\Models\SalaDeAula;
use App\Models\Disciplina;
use App\Models\User;
use Illuminate\Http\Request;

class HorarioController extends Controller
{
    public function index(Request $request)
    {
        $escolaId = $request->user()->escola_id;

        return Horario::with([
                'turma:id,nome,codigo_turma,turno,classe',
                'disciplina:id,nome',
                'professor:id,name',
            ])
            ->where('escola_id', $escolaId)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();
    }

public function store(Request $request)
{
    $escolaId = $request->user()->escola_id;

    $data = $request->validate([
        'turma_id' => ['required', 'integer'],
        'disciplina_id' => ['required', 'integer'],
        'professor_id' => ['nullable', 'integer'],
        'dia_semana' => ['required', 'string', 'max:30'],
        'tempo' => ['required', 'string', 'max:50'],
        'sala' => ['required', 'string', 'max:50'],
        'quantidade_tempos' => ['nullable', 'integer', 'in:1,2'],
    ]);

    $quantidade = $data['quantidade_tempos'] ?? 1;

    $tempos = [
        '1º Tempo' => ['inicio' => '07:30', 'fim' => '08:15', 'proximo' => '2º Tempo'],
        '2º Tempo' => ['inicio' => '08:20', 'fim' => '09:05', 'proximo' => '3º Tempo'],
        '3º Tempo' => ['inicio' => '09:10', 'fim' => '09:55', 'proximo' => '4º Tempo'],
        '4º Tempo' => ['inicio' => '10:05', 'fim' => '10:50', 'proximo' => '5º Tempo'],
        '5º Tempo' => ['inicio' => '10:55', 'fim' => '11:40', 'proximo' => '6º Tempo'],
        '6º Tempo' => ['inicio' => '11:45', 'fim' => '12:30', 'proximo' => null],
    ];

    if (!isset($tempos[$data['tempo']])) {
        return response()->json([
            'message' => 'Tempo inválido.'
        ], 422);
    }

    if ($quantidade === 2 && !$tempos[$data['tempo']]['proximo']) {
        return response()->json([
            'message' => 'Não é possível criar 2 tempos a partir do último tempo.'
        ], 422);
    }

    $turma = SalaDeAula::where('id', $data['turma_id'])
        ->where('escola_id', $escolaId)
        ->firstOrFail();

    Disciplina::where('id', $data['disciplina_id'])
        ->where('escola_id', $escolaId)
        ->firstOrFail();

    if (!empty($data['professor_id'])) {
        User::where('id', $data['professor_id'])
            ->where('escola_id', $escolaId)
            ->where('role', 'professor')
            ->firstOrFail();
    }

    $disciplinaJaExisteNoDia = Horario::where('escola_id', $escolaId)
        ->where('turma_id', $turma->id)
        ->where('disciplina_id', $data['disciplina_id'])
        ->where('dia_semana', $data['dia_semana'])
        ->exists();

    if ($disciplinaJaExisteNoDia) {
        return response()->json([
            'message' => 'Esta disciplina já foi lançada neste dia para esta turma.'
        ], 422);
    }

    $temposParaCriar = [$data['tempo']];

    if ($quantidade === 2) {
        $temposParaCriar[] = $tempos[$data['tempo']]['proximo'];
    }

    foreach ($temposParaCriar as $tempoNome) {
        $inicio = $tempos[$tempoNome]['inicio'];
        $fim = $tempos[$tempoNome]['fim'];

        $conflitoTurma = Horario::where('escola_id', $escolaId)
            ->where('turma_id', $turma->id)
            ->where('dia_semana', $data['dia_semana'])
            ->where('tempo', $tempoNome)
            ->exists();

        if ($conflitoTurma) {
            return response()->json([
                'message' => "Esta turma já tem aula no {$tempoNome}."
            ], 422);
        }

        if (!empty($data['professor_id'])) {
            $conflitoProfessor = Horario::where('escola_id', $escolaId)
                ->where('professor_id', $data['professor_id'])
                ->where('dia_semana', $data['dia_semana'])
                ->where('tempo', $tempoNome)
                ->exists();

            if ($conflitoProfessor) {
                return response()->json([
                    'message' => "Este professor já tem aula no {$tempoNome}."
                ], 422);
            }
        }
    }

    $criados = [];

    foreach ($temposParaCriar as $tempoNome) {
        $criados[] = Horario::create([
            'escola_id' => $escolaId,
            'turma_id' => $data['turma_id'],
            'disciplina_id' => $data['disciplina_id'],
            'professor_id' => $data['professor_id'] ?? null,
            'dia_semana' => $data['dia_semana'],
            'hora_inicio' => $tempos[$tempoNome]['inicio'],
            'hora_fim' => $tempos[$tempoNome]['fim'],
            'tempo' => $tempoNome,
            'sala' => $data['sala'],
        ]);
    }

    return response()->json([
        'message' => $quantidade === 2
            ? 'Bloco de 2 tempos criado com sucesso.'
            : 'Horário criado com sucesso.',
        'horarios' => collect($criados)->map->load(['turma', 'disciplina', 'professor']),
    ], 201);
}

    public function update(Request $request, $id)
{
    $user = auth()->user();

    $horario = Horario::where('escola_id', $user->escola_id)
        ->findOrFail($id);

    $data = $request->validate([
        'turma_id' => 'required|exists:sala_de_aulas,id',
        'disciplina_id' => 'required|exists:disciplinas,id',
        'professor_id' => 'nullable|exists:users,id',
        'dia_semana' => 'required|string|max:40',
        'tempo' => 'nullable|string|max:40',
        'hora_inicio' => 'required',
        'hora_fim' => 'required',
        'sala' => 'required|string|max:50',
    ]);

    $conflitoTurma = Horario::where('escola_id', $user->escola_id)
        ->where('id', '!=', $id)
        ->where('turma_id', $data['turma_id'])
        ->where('dia_semana', $data['dia_semana'])
        ->where('hora_inicio', $data['hora_inicio'])
        ->exists();

    if ($conflitoTurma) {
        return response()->json([
            'message' => 'Esta turma já tem aula neste horário.'
        ], 422);
    }

    if (!empty($data['professor_id'])) {
        $conflitoProfessor = Horario::where('escola_id', $user->escola_id)
            ->where('id', '!=', $id)
            ->where('professor_id', $data['professor_id'])
            ->where('dia_semana', $data['dia_semana'])
            ->where('hora_inicio', $data['hora_inicio'])
            ->exists();

        if ($conflitoProfessor) {
            return response()->json([
                'message' => 'Este professor já tem aula neste horário.'
            ], 422);
        }
    }
$disciplinaJaExisteNoDia = Horario::where('escola_id', $user->escola_id)
    ->where('id', '!=', $id)
    ->where('turma_id', $data['turma_id'])
    ->where('disciplina_id', $data['disciplina_id'])
    ->where('dia_semana', $data['dia_semana'])
    ->exists();

if ($disciplinaJaExisteNoDia) {
    return response()->json([
        'message' => 'Esta disciplina já foi atribuída nesta turma neste dia.'
    ], 422);
}
    $horario->update($data);

    return response()->json(
        $horario->load(['turma', 'disciplina', 'professor'])
    );
}

    public function destroy(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        $horario = Horario::where('escola_id', $escolaId)->findOrFail($id);
        $horario->delete();

        return response()->json([
            'message' => 'Horário removido com sucesso.',
        ]);
    }
}