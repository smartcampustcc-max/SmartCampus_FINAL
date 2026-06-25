<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Falta;
use App\Models\Nota;
use App\Models\SalaDeAula;
use App\Models\Disciplina;
use App\Models\Estudante;
use Illuminate\Http\Request;

class RelatoriosController extends Controller
{
    public function filtros()
    {
        $escola_id = auth()->user()->escola_id;

        $turmas = SalaDeAula::where('escola_id', $escola_id)
            ->orderBy('nome')
            ->get(['id', 'nome', 'codigo_turma']);

        $disciplinas = Disciplina::where('escola_id', $escola_id)
            ->orderBy('nome')
            ->get(['id', 'nome']);

        return response()->json(compact('turmas', 'disciplinas'));
    }

    public function faltas(Request $request)
    {
        $escola_id = auth()->user()->escola_id;

        $query = Falta::with(['estudante', 'professor', 'turma', 'disciplina'])
            ->where('escola_id', $escola_id);

        if ($request->filled('turma_id')) {
            $query->where('turma_id', $request->turma_id);
        }

        if ($request->filled('disciplina_id')) {
            $query->where('disciplina_id', $request->disciplina_id);
        }

        return response()->json(
            $query->orderBy('data', 'desc')->get()->map(fn($f) => [
                'id'          => $f->id,
                'estudante'   => $f->estudante?->nome_completo,
                'numero'      => $f->estudante?->numero_aluno,
                'professor'   => $f->professor?->name,
                'turma'       => $f->turma?->codigo_turma ?? $f->turma?->nome,
                'disciplina'  => $f->disciplina?->nome,
                'data'        => $f->data,
                'tempo_aula'  => $f->tempo_aula,
                'justificada' => $f->justificada,
            ])
        );
    }

    public function notas(Request $request)
    {
        $escola_id = auth()->user()->escola_id;

        $query = Nota::with(['estudante', 'turma', 'disciplina'])
            ->where('escola_id', $escola_id);

        if ($request->filled('turma_id')) {
            $query->where('turma_id', $request->turma_id);
        }

        if ($request->filled('disciplina_id')) {
            $query->where('disciplina_id', $request->disciplina_id);
        }

        if ($request->filled('trimestre')) {
            $query->where('trimestre', $request->trimestre);
        }

        if ($request->filled('tipo_avaliacao')) {
            $query->where('tipo_avaliacao', $request->tipo_avaliacao);
        }

        return response()->json(
            $query->orderBy('data_avaliacao', 'desc')->get()->map(fn($n) => [
                'id'             => $n->id,
                'estudante'      => $n->estudante?->nome_completo,
                'numero'         => $n->estudante?->numero_aluno,
                'turma'          => $n->turma?->codigo_turma ?? $n->turma?->nome,
                'disciplina'     => $n->disciplina?->nome,
                'trimestre'      => $n->trimestre,
                'tipo_avaliacao' => $n->tipo_avaliacao,
                'data_avaliacao' => $n->data_avaliacao,
                'nota'           => $n->nota,
            ])
        );
    }

    public function desempenho(Request $request)
    {
        $request->validate([
            'turma_id' => 'required'
        ]);

        $escola_id = auth()->user()->escola_id;
        $turma_id = $request->turma_id;
        $trimestre = $request->trimestre;

        $ids = Nota::where('turma_id', $turma_id)
            ->where('escola_id', $escola_id)
            ->pluck('estudante_id')
            ->merge(
                Falta::where('turma_id', $turma_id)
                    ->where('escola_id', $escola_id)
                    ->pluck('estudante_id')
            )
            ->unique();

        $resultado = Estudante::whereIn('id', $ids)
            ->orderBy('nome_completo')
            ->get()
            ->map(function ($estudante) use ($turma_id, $trimestre, $escola_id) {
                $notasQuery = Nota::where('estudante_id', $estudante->id)
                    ->where('turma_id', $turma_id)
                    ->where('escola_id', $escola_id)
                    ->with('disciplina');

                if ($trimestre) {
                    $notasQuery->where('trimestre', $trimestre);
                }

                $notas = $notasQuery->get();

                $mediaGeral = $notas->count() > 0 ? round($notas->avg('nota'), 1) : null;

                $faltasTotal = Falta::where('estudante_id', $estudante->id)
                    ->where('turma_id', $turma_id)
                    ->where('escola_id', $escola_id)
                    ->count();

                $notasPorDisciplina = $notas
                    ->groupBy('disciplina_id')
                    ->map(fn($g) => [
                        'disciplina' => $g->first()?->disciplina?->nome,
                        'media'      => round($g->avg('nota'), 1),
                    ])
                    ->values();

                return [
                    'id'                   => $estudante->id,
                    'nome'                 => $estudante->nome_completo,
                    'numero'               => $estudante->numero_aluno,
                    'media_geral'          => $mediaGeral,
                    'total_faltas'         => $faltasTotal,
                    'notas_por_disciplina' => $notasPorDisciplina,
                    'status'               => ($faltasTotal >= 3 || ($mediaGeral !== null && $mediaGeral < 10))
                        ? 'Atenção'
                        : 'Regular',
                ];
            });

        return response()->json($resultado);
    }
}