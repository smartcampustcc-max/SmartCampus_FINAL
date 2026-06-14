<?php

namespace App\Http\Controllers;

use App\Models\Mensagemchat;
use Illuminate\Http\Request;
use App\Models\Notificacao;
use App\Models\User;
use App\Models\Atribuicao;
use App\Models\Estudante;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'turma_id' => ['required', 'integer'],
            'disciplina_id' => ['required', 'integer'],
        ]);

      $mensagens = Mensagemchat::with([
    'remetente:id,name,role',
    'material.disciplina:id,nome',
])
            ->where('turma_id', $request->turma_id)
            ->where('disciplina_id', $request->disciplina_id)
            ->orderBy('created_at')
            ->get();

        return response()->json($mensagens);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'turma_id' => ['required', 'integer'],
            'disciplina_id' => ['required', 'integer'],
            'material_id' => ['nullable', 'integer'],
            'mensagem' => ['required', 'string', 'max:1000'],
        ]);

        $mensagem = Mensagemchat::create([
            'remetente_id' => $request->user()->id,
            'turma_id' => $data['turma_id'],
            'disciplina_id' => $data['disciplina_id'],
            'material_id' => $data['material_id'] ?? null,
            'mensagem' => trim($data['mensagem']),
            'lida' => false,
        ]);

        $user = $request->user();

if ($user->role === 'estudante') {
    $atribuicao = Atribuicao::where('turma_id', $data['turma_id'])
        ->where('disciplina_id', $data['disciplina_id'])
        ->with(['disciplina', 'professor'])
        ->first();

    if ($atribuicao && $atribuicao->professor) {
        Notificacao::create([
            'user_id' => $atribuicao->professor->id,
            'titulo' => 'Nova dúvida no chat',
            'mensagem' => $user->name . ' enviou uma mensagem em ' . ($atribuicao->disciplina?->nome ?? 'uma disciplina') . '.',
            'tipo' => 'chat',
            'link' => '/professor/turma/' . $data['turma_id'] . '/disciplina/' . $data['disciplina_id'],
            'lida' => false,
        ]);
    }

    User::where('escola_id', $user->escola_id)
        ->whereIn('role', ['admin_escola', 'admin'])
        ->get()
        ->each(function ($admin) use ($user, $atribuicao) {
            Notificacao::create([
                'user_id' => $admin->id,
                'titulo' => 'Nova mensagem supervisionada',
                'mensagem' => $user->name . ' enviou uma mensagem no chat de ' . ($atribuicao?->disciplina?->nome ?? 'uma disciplina') . '.',
                'tipo' => 'chat',
                'link' => '/admin/chats',
                'lida' => false,
            ]);
        });
}

if ($user->role === 'professor') {
    $estudantes = Estudante::where('sala_de_aula_id', $data['turma_id'])
        ->whereNotNull('user_id')
        ->get();

    $atribuicao = Atribuicao::where('turma_id', $data['turma_id'])
        ->where('disciplina_id', $data['disciplina_id'])
        ->with('disciplina')
        ->first();

    foreach ($estudantes as $estudante) {
        Notificacao::create([
            'user_id' => $estudante->user_id,
            'titulo' => 'Nova resposta no chat',
            'mensagem' => $user->name . ' respondeu no chat de ' . ($atribuicao?->disciplina?->nome ?? 'uma disciplina') . '.',
            'tipo' => 'chat',
            'link' => '/aluno/mensagens?turma_id=' . $data['turma_id'] . '&disciplina_id=' . $data['disciplina_id'],
            'lida' => false,
        ]);
    }

    User::where('escola_id', $user->escola_id)
        ->whereIn('role', ['admin_escola', 'admin'])
        ->get()
        ->each(function ($admin) use ($user, $atribuicao) {
            Notificacao::create([
                'user_id' => $admin->id,
                'titulo' => 'Resposta supervisionada',
                'mensagem' => $user->name . ' respondeu no chat de ' . ($atribuicao?->disciplina?->nome ?? 'uma disciplina') . '.',
                'tipo' => 'chat',
                'link' => '/admin/chats',
                'lida' => false,
            ]);
        });
}

        return response()->json([
  'mensagem' => $mensagem->load([
    'remetente:id,name,role',
    'material.disciplina:id,nome',
]),
        ], 201);
    }
}