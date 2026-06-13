<?php

namespace App\Http\Controllers;

use App\Models\Mensagemchat;
use Illuminate\Http\Request;

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

        return response()->json([
            'message' => 'Mensagem enviada com sucesso.',
            'mensagem' => $mensagem->load([
    'remetente:id,name,role',
    'material.disciplina:id,nome',
]),
        ], 201);
    }
}