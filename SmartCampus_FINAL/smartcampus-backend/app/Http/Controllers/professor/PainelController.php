<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use App\Models\Atribuicao;
use App\Models\AdminAviso;
use App\Models\Nota;
use App\Models\ProfessorLembrete;
use App\Models\ProfessorEvento;
use App\Models\Disciplina;
use App\Models\Estudante;
use App\Models\Horario;
use App\Models\Falta;
use App\Models\Notificacao;

class PainelController extends Controller
{
    public function minhasAtribuicoes(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'professor') {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $atribuicoes = Atribuicao::with([
            'turma',
            'disciplina'
        ])
        ->where('professor_id', $user->id)
        ->orderByDesc('id')
        ->get();

        $avisosAdmin = collect();
        if (Schema::hasTable('admin_avisos')) {
            $avisosAdmin = AdminAviso::where('escola_id', $user->escola_id)
                ->orderByDesc('id')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'titulo' => $item->titulo,
                        'texto' => $item->texto,
                        'created_at' => $item->created_at,
                        'created_at_formatado' => optional($item->created_at)->format('d/m/Y H:i'),
                    ];
                })
                ->values();
        }

        $meusLembretes = collect();
        if (Schema::hasTable('professor_lembretes')) {
            $meusLembretes = ProfessorLembrete::where('professor_id', $user->id)
                ->where('escola_id', $user->escola_id)
                ->orderByDesc('id')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'texto' => $item->texto,
                        'created_at' => $item->created_at,
                        'created_at_formatado' => optional($item->created_at)->format('d/m/Y H:i'),
                    ];
                })
                ->values();
        }

        $eventos = collect();
        if (Schema::hasTable('professor_eventos')) {
            $eventos = ProfessorEvento::with(['turma:id,nome,name', 'disciplina:id,nome,name'])
                ->where('professor_id', $user->id)
                ->where('escola_id', $user->escola_id)
                ->orderBy('data')
                ->orderBy('hora_inicio')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'titulo' => $item->titulo,
                        'tipo' => $item->tipo,
                        'data' => $item->data,
                        'hora_inicio' => $item->hora_inicio,
                        'hora_fim' => $item->hora_fim,
                        'descricao' => $item->descricao,
                        'turma_id' => $item->turma_id,
                        'disciplina_id' => $item->disciplina_id,
                        'turma_nome' => $item->turma->nome ?? $item->turma->name ?? null,
                        'disciplina_nome' => $item->disciplina->nome ?? $item->disciplina->name ?? null,
                    ];
                })
                ->values();
        }
        $totalMateriais = \App\Models\Material::where('professor_id', $user->id)
    ->where('escola_id', $user->escola_id)
    ->count();
    
      $proximasAulas = Horario::with([
        'turma:id,nome,codigo_turma',
        'disciplina:id,nome',
    ])
    ->where('professor_id', $user->id)
    ->where('escola_id', $user->escola_id)
    ->orderBy('dia_semana')
    ->orderBy('hora_inicio')
    ->get()
    ->map(function ($item) {
       return [
    'id' => $item->id,
    'turma_id' => $item->turma_id,
    'disciplina_id' => $item->disciplina_id,
    'dia' => $item->dia_semana,
    'hora' => substr($item->hora_inicio, 0, 5),
    'hora_fim' => substr($item->hora_fim, 0, 5),
    'turma' => $item->turma?->codigo_turma ?? $item->turma?->nome,
    'disciplina' => $item->disciplina?->nome,
    'sala' => $item->sala,
    'tempo' => $item->tempo,
];
    })
    ->values();

        return response()->json([
            'professor' => $user->only('id', 'name', 'email'),
            'total_turmas' => $atribuicoes->pluck('turma_id')->unique()->count(),
            'total_disciplinas' => $atribuicoes->pluck('disciplina_id')->unique()->count(),
            'atribuicoes' => $atribuicoes,
            'avisos_admin' => $avisosAdmin,
             'total_materiais' => $totalMateriais,
            'meus_lembretes' => $meusLembretes,
            'eventos' => $eventos,
            'proximas_aulas' => $proximasAulas,
        ]);
    }
    

    public function storeMeuLembrete(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'professor') {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validate([
            'texto' => ['required', 'string', 'max:500'],
        ]);

        $lembrete = ProfessorLembrete::create([
            'professor_id' => $user->id,
            'escola_id' => $user->escola_id,
            'texto' => $data['texto'],
        ]);

        return response()->json([
            'message' => 'Lembrete criado com sucesso.',
            'lembrete' => [
                'id' => $lembrete->id,
                'texto' => $lembrete->texto,
                'created_at' => $lembrete->created_at,
                'created_at_formatado' => optional($lembrete->created_at)->format('d/m/Y H:i'),
            ],
        ], 201);
    }

    public function destroyMeuLembrete(Request $request, $id)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'professor') {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $lembrete = ProfessorLembrete::where('id', $id)
            ->where('professor_id', $user->id)
            ->where('escola_id', $user->escola_id)
            ->firstOrFail();

        $lembrete->delete();

        return response()->json([
            'message' => 'Lembrete apagado com sucesso.'
        ]);
    }

    public function storeEvento(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'professor') {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }
  
        if (!$user->escola_id) {
    return response()->json([
        'message' => 'O professor autenticado não está associado a nenhuma escola.'
    ], 422);
}


        $data = $request->validate([
            'titulo' => ['required', 'string', 'max:150'],
            'tipo' => ['required', 'string', 'max:50'],
            'data' => ['required', 'date'],
            'hora_inicio' => ['nullable', 'date_format:H:i'],
            'hora_fim' => ['nullable', 'date_format:H:i'],
            'turma_id' => ['nullable', 'integer'],
            'disciplina_id' => ['nullable', 'integer'],
            'descricao' => ['nullable', 'string'],
        ]);

        $evento = ProfessorEvento::create([
            'professor_id' => $user->id,
            'escola_id' => $user->escola_id,
            'turma_id' => $data['turma_id'] ?? null,
            'disciplina_id' => $data['disciplina_id'] ?? null,
            'titulo' => $data['titulo'],
            'tipo' => $data['tipo'],
            'data' => $data['data'],
            'hora_inicio' => $data['hora_inicio'] ?? null,
            'hora_fim' => $data['hora_fim'] ?? null,
            'descricao' => $data['descricao'] ?? null,
        ]);

        return response()->json([
            'message' => 'Evento agendado com sucesso.',
            'evento' => [
                'id' => $evento->id,
                'titulo' => $evento->titulo,
                'tipo' => $evento->tipo,
                'data' => $evento->data,
                'hora_inicio' => $evento->hora_inicio,
                'hora_fim' => $evento->hora_fim,
                'descricao' => $evento->descricao,
                'turma_id' => $evento->turma_id,
                'disciplina_id' => $evento->disciplina_id,
            ],
        ], 201);
    }

    public function destroyEvento(Request $request, $id)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'professor') {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $evento = ProfessorEvento::where('id', $id)
            ->where('professor_id', $user->id)
            ->where('escola_id', $user->escola_id)
            ->firstOrFail();

        $evento->delete();

        return response()->json([
            'message' => 'Evento removido com sucesso.'
        ]);
    }

    public function avisos(Request $request)
{
    $escolaId = $request->user()->escola_id;

    return \App\Models\Aviso::where('escola_id', $escolaId)
        ->whereIn('destino', ['Todos', 'Professores'])
        ->orderByDesc('id')
        ->get();
}
public function alunosDaTurma(Request $request, $turmaId)
{
    $user = $request->user();

    $temAtribuicao = \App\Models\Atribuicao::where('professor_id', $user->id)
        ->where('turma_id', $turmaId)
        ->exists();

    if (!$temAtribuicao) {
        return response()->json([
            'message' => 'Não tens permissão para ver alunos desta turma.'
        ], 403);
    }

    $disciplinaId = $request->query('disciplina_id');

$alunos = \App\Models\Estudante::where('sala_de_aula_id', $turmaId)
    ->orderBy('nome_completo')
    ->get([
        'id',
        'nome_completo',
        'numero_aluno',
        'telefone',
    ])
    ->map(function ($aluno) use ($turmaId, $disciplinaId, $user) {
        $totalFaltas = Falta::where('estudante_id', $aluno->id)
            ->where('turma_id', $turmaId)
            ->where('disciplina_id', $disciplinaId)
            ->where('professor_id', $user->id)
            ->where('justificada', false)
            ->count();

        return [
            'id' => $aluno->id,
            'nome_completo' => $aluno->nome_completo,
            'numero_aluno' => $aluno->numero_aluno,
            'telefone' => $aluno->telefone,
            'faltas' => $totalFaltas,
            'estado_faltas' => $totalFaltas >= 3 ? 'Reprovado por faltas' : 'Regular',
        ];
    });

return response()->json($alunos);
}

public function marcarFalta(Request $request)
{
    $user = $request->user();

    $data = $request->validate([
        'estudante_id' => ['required', 'integer'],
        'turma_id' => ['required', 'integer'],
        'disciplina_id' => ['required', 'integer'],
        'data' => ['required', 'date'],
        'tempo_aula' => ['nullable', 'string', 'max:50'],
        'observacao' => ['nullable', 'string'],
    ]);

    $falta = Falta::firstOrCreate(
        [
            'estudante_id' => $data['estudante_id'],
            'turma_id' => $data['turma_id'],
            'disciplina_id' => $data['disciplina_id'],
            'data' => $data['data'],
            'tempo_aula' => $data['tempo_aula'] ?? null,
        ],
        [
            'professor_id' => $user->id,
            'escola_id' => $user->escola_id,
            'observacao' => $data['observacao'] ?? null,
        ]
    );

   $estudante = Estudante::find($data['estudante_id']);
$disciplina = Disciplina::find($data['disciplina_id']);

if ($falta->wasRecentlyCreated && $estudante && $estudante->user_id) {
    $dataFormatada = \Carbon\Carbon::parse($data['data'])->format('d/m/Y');

    Notificacao::create([
        'user_id' => $estudante->user_id,
        'titulo' => 'Falta registada',
        'mensagem' => 'Foi registada uma falta em ' . ($disciplina?->nome ?? 'uma disciplina') . ' no dia ' . $dataFormatada . '.',
        'tipo' => 'falta',
        'link' => '/aluno/notas',
        'lida' => false,
    ]);
}

$totalFaltas = Falta::where('estudante_id', $data['estudante_id'])
    ->where('disciplina_id', $data['disciplina_id'])
    ->where(function ($q) {
        $q->whereNull('justificada')
          ->orWhere('justificada', false);
    })
    ->count();

if ($falta->wasRecentlyCreated && $totalFaltas >= 3 && $estudante && $estudante->user_id) {
    Notificacao::create([
        'user_id' => $estudante->user_id,
        'titulo' => 'Alerta de faltas',
        'mensagem' => 'Atingiste ' . $totalFaltas . ' faltas em ' . ($disciplina?->nome ?? 'uma disciplina') . '.',
        'tipo' => 'alerta_faltas',
        'link' => '/aluno/notas',
        'lida' => false,
    ]);
}

    return response()->json([
        'message' => 'Falta registada com sucesso.',
        'falta' => $falta,
    ]);
}


public function removerFalta(Request $request, $id)
{
    $user = $request->user();

    $falta = Falta::where('id', $id)
        ->where('professor_id', $user->id)
        ->firstOrFail();

    $falta->delete();

    return response()->json([
        'message' => 'Falta removida com sucesso.'
    ]);
}
public function historicoFaltas(Request $request, $estudanteId)
{
    $user = $request->user();

    $faltas = Falta::with(['disciplina:id,nome'])
        ->where('estudante_id', $estudanteId)
        ->where('professor_id', $user->id)
        ->orderByDesc('data')
        ->orderByDesc('id')
        ->get()
        ->map(function ($falta) {
            return [
                'id' => $falta->id,
                'data' => $falta->data,
                'tempo_aula' => $falta->tempo_aula,
                'observacao' => $falta->observacao,
                'justificada' => $falta->justificada,
                'motivo_justificacao' => $falta->motivo_justificacao,
                'disciplina' => $falta->disciplina->nome ?? 'Disciplina',
            ];
        });

    return response()->json($faltas);
}

public function justificarFalta(Request $request, $id)
{
    $user = $request->user();

    $data = $request->validate([
        'motivo_justificacao' => ['required', 'string', 'max:500'],
    ]);

    $falta = Falta::where('id', $id)
        ->where('professor_id', $user->id)
        ->firstOrFail();

    $falta->update([
        'justificada' => true,
        'motivo_justificacao' => $data['motivo_justificacao'],
        'justificada_em' => now(),
    ]);

    return response()->json([
        'message' => 'Falta justificada com sucesso.'
    ]);
}
public function notificacoes(Request $request)
{
    $user = $request->user();

    $notificacoes = Notificacao::where('user_id', $user->id)
        ->orderByDesc('created_at')
        ->get();

    return response()->json($notificacoes);
}
public function notas(Request $request)
{
    $user = $request->user();

    $data = $request->validate([
        'turma_id' => ['required', 'integer'],
        'disciplina_id' => ['required', 'integer'],
        'trimestre' => ['required', 'string'],
        'tipo_avaliacao' => ['required', 'string'],
    ]);

    $temAtribuicao = Atribuicao::where('professor_id', $user->id)
        ->where('turma_id', $data['turma_id'])
        ->where('disciplina_id', $data['disciplina_id'])
        ->exists();

    if (!$temAtribuicao) {
        return response()->json([
            'message' => 'Não tens permissão para lançar notas nesta turma/disciplina.'
        ], 403);
    }

    $notas = Nota::where('professor_id', $user->id)
        ->where('turma_id', $data['turma_id'])
        ->where('disciplina_id', $data['disciplina_id'])
        ->where('trimestre', $data['trimestre'])
        ->where('tipo_avaliacao', $data['tipo_avaliacao'])
        ->get();

    return response()->json($notas);
}

public function guardarNotas(Request $request)
{
    $user = $request->user();

    $data = $request->validate([
        'turma_id' => ['required', 'integer'],
        'disciplina_id' => ['required', 'integer'],
        'trimestre' => ['required', 'string'],
        'tipo_avaliacao' => ['required', 'string'],
        'data_avaliacao' => ['required', 'date'],
        'notas' => ['required', 'array', 'min:1'],
        'notas.*.estudante_id' => ['required', 'integer'],
        'notas.*.nota' => ['required', 'numeric', 'min:0', 'max:20'],
    ]);

    $temAtribuicao = Atribuicao::where('professor_id', $user->id)
        ->where('turma_id', $data['turma_id'])
        ->where('disciplina_id', $data['disciplina_id'])
        ->exists();

    if (!$temAtribuicao) {
        return response()->json([
            'message' => 'Não tens permissão para lançar notas nesta turma/disciplina.'
        ], 403);
    }

    foreach ($data['notas'] as $item) {
        Nota::updateOrCreate(
            [
                'estudante_id' => $item['estudante_id'],
                'turma_id' => $data['turma_id'],
                'disciplina_id' => $data['disciplina_id'],
                'trimestre' => $data['trimestre'],
                'tipo_avaliacao' => $data['tipo_avaliacao'],
                'data_avaliacao' => $data['data_avaliacao'],
            ],
            [
                'professor_id' => $user->id,
                'escola_id' => $user->escola_id,
                'nota' => $item['nota'],
                'data_avaliacao' => $data['data_avaliacao'],
            ]
        );
    }

    return response()->json([
        'message' => 'Notas guardadas com sucesso.'
    ]);
}
public function historicoNotas(Request $request)
{
    $user = $request->user();

    $historico = \App\Models\Nota::query()
        ->join('salas_de_aula', 'notas.turma_id', '=', 'salas_de_aula.id')
        ->join('disciplinas', 'notas.disciplina_id', '=', 'disciplinas.id')
        ->where('notas.professor_id', $user->id)
        ->selectRaw('
            notas.turma_id,
            notas.disciplina_id,
            salas_de_aula.codigo_turma as turma,
            disciplinas.nome as disciplina,
            notas.trimestre,
            notas.tipo_avaliacao,
            notas.data_avaliacao,
            COUNT(notas.id) as total_alunos
        ')
        ->groupBy(
            'notas.turma_id',
            'notas.disciplina_id',
            'salas_de_aula.codigo_turma',
            'disciplinas.nome',
            'notas.trimestre',
            'notas.tipo_avaliacao',
            'notas.data_avaliacao',
        )
        ->orderByDesc('notas.id')
        ->get();

    return response()->json($historico);
}
public function detalhesNotas(Request $request)
{
    $request->validate([
        'turma_id' => 'required',
        'disciplina_id' => 'required',
        'trimestre' => 'required',
        'tipo_avaliacao' => 'required',
        'data_avaliacao' => 'nullable|date',
    ]);

    $notas = \App\Models\Nota::query()
        ->join('estudantes', 'notas.estudante_id', '=', 'estudantes.id')
        ->where('notas.turma_id', $request->turma_id)
        ->where('notas.disciplina_id', $request->disciplina_id)
        ->where('notas.trimestre', $request->trimestre)
        ->where('notas.tipo_avaliacao', $request->tipo_avaliacao)
        ->when($request->data_avaliacao, function ($q) use ($request) {
    $q->where('notas.data_avaliacao', $request->data_avaliacao);
})
        ->select(
            'estudantes.nome_completo as nome',
            'estudantes.numero_aluno as numero',
            'notas.data_avaliacao',
            'notas.nota'

        )
        ->orderBy('estudantes.nome_completo')
        ->get();

    return response()->json($notas);
}
}