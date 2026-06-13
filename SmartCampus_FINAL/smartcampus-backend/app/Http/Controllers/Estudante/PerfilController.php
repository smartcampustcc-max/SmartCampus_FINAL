<?php

namespace App\Http\Controllers\Estudante;

use App\Http\Controllers\Controller;
use App\Models\Estudante;
use App\Models\Aviso;
use App\Models\Mensagemchat;
use App\Models\Disciplina;
use App\Models\Material;
use App\Models\Falta;
use App\Models\Nota;
use App\Models\Atribuicao;
use App\Models\Notificacao;
use App\Models\Horario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class PerfilController extends Controller
{
    public function perfil(Request $request)
    {
        $user = $request->user();

        $estudante = Estudante::with(['turma', 'curso'])
            ->where('user_id', $user->id)
            ->first();

        if (!$estudante) {
            return response()->json(['message' => 'Perfil não encontrado.'], 404);
        }

        return response()->json($estudante);
    }
    
    public function avisos(Request $request)
{
    $user = $request->user();
    $estudante = \App\Models\Estudante::where('user_id', $user->id)->first();

    if (!$estudante) return response()->json([]);

    return \App\Models\Aviso::where('escola_id', $estudante->escola_id)
        ->whereIn('destino', ['Todos', 'Alunos'])
        ->orderByDesc('id')
        ->get();
}
public function disciplinas()
{
    $user = Auth::user();

    $estudante = \App\Models\Estudante::where('user_id', $user->id)->first();

    if (!$estudante || !$estudante->sala_de_aula_id) {
        return response()->json([]);
    }

    $atribuicoes = Atribuicao::with([
        'disciplina',
        'professor',
        'turma'
    ])
    ->where('turma_id', $estudante->sala_de_aula_id)
    ->get();

    return response()->json(
        $atribuicoes->map(function ($a) {
            return [
                'id' => $a->id,

                'disciplina' => [
                    'id' => $a->disciplina?->id,
                    'nome' => $a->disciplina?->nome,
                ],

                'professor' => [
                    'id' => $a->professor?->id,
                    'name' => $a->professor?->name,
                ],

                'turma' => [
                    'id' => $a->turma?->id,
                    'nome' => $a->turma?->nome,
                ],

                'aulas_semana' => $a->aulas_semana,
            ];
        })
    );
}
public function notificacoes(Request $request)
{
    $user = $request->user();

    $notificacoes = Notificacao::where('user_id', $user->id)
        ->orderByDesc('created_at')
        ->get();

    return response()->json($notificacoes);
}

public function minhasFaltas(Request $request)
{
    $user = $request->user();

    $estudante = Estudante::where('user_id', $user->id)->first();

    if (!$estudante) {
        return response()->json([]);
    }

    $faltas = Falta::with([
            'disciplina:id,nome',
            'professor:id,name',
        ])
        ->where('estudante_id', $estudante->id)
        ->orderByDesc('data')
        ->get()
        ->map(function ($falta) {
            return [
                'id' => $falta->id,
                'data' => $falta->data,
                'tempo_aula' => $falta->tempo_aula,
                'observacao' => $falta->observacao,
                'disciplina' => $falta->disciplina?->nome,
                'professor' => $falta->professor?->name,
            ];
        });

    return response()->json($faltas);
}
public function notas(Request $request)
{
    $user = $request->user();

    $estudante = Estudante::where('user_id', $user->id)->first();

    if (!$estudante) {
        return response()->json([]);
    }

    $notas = Nota::with([
            'disciplina:id,nome',
            'professor:id,name',
        ])
        ->where('estudante_id', $estudante->id)
        ->orderByDesc('id')
        ->get()
        ->map(function ($nota) {
            return [
                'id' => $nota->id,
                'disciplina' => $nota->disciplina?->nome ?? '-',
                'professor' => $nota->professor?->name ?? '-',
                'trimestre' => $nota->trimestre,
                'tipo_avaliacao' => $nota->tipo_avaliacao,
                'nota' => $nota->nota,
            ];
        });

    return response()->json($notas);
}
public function horarios(Request $request)
{
    $user = $request->user();

    $estudante = Estudante::where('user_id', $user->id)->first();

    if (!$estudante || !$estudante->sala_de_aula_id) {
        return response()->json([]);
    }

    $horarios = Horario::with([
            'disciplina:id,nome',
            'professor:id,name',
            'turma:id,nome,codigo_turma',
        ])
        ->where('escola_id', $estudante->escola_id)
        ->where('turma_id', $estudante->sala_de_aula_id)
        ->orderBy('dia_semana')
        ->orderBy('hora_inicio')
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'dia' => $item->dia_semana,
                'tempo' => $item->tempo,
                'hora_inicio' => substr($item->hora_inicio, 0, 5),
                'hora_fim' => substr($item->hora_fim, 0, 5),
                'disciplina' => $item->disciplina?->nome,
                'professor' => $item->professor?->name ?? 'Sem docente atribuído',
                'sala' => $item->sala,
                'turma' => $item->turma?->codigo_turma ?? $item->turma?->nome,
            ];
        })
        ->values();

    return response()->json($horarios);
}
}