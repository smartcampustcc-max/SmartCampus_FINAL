<?php

namespace App\Http\Controllers;

use App\Models\Suporte;
use Illuminate\Http\Request;

class SuporteController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['estudante', 'professor'])) {
            return response()->json([
                'message' => 'Apenas alunos e professores podem enviar pedidos de suporte.'
            ], 403);
        }

        $data = $request->validate([
            'categoria' => ['required', 'string', 'max:100'],
            'mensagem' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $suporte = Suporte::create([
            'escola_id' => $user->escola_id,
            'user_id' => $user->id,
            'perfil' => $user->role,
            'categoria' => $data['categoria'],
            'mensagem' => $data['mensagem'],
            'status' => 'aberto',
        ]);

        return response()->json([
            'message' => 'Pedido de suporte enviado com sucesso.',
            'suporte' => $suporte,
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $pedidos = Suporte::with('user:id,name,email,username,phone,role')
            ->where('escola_id', $user->escola_id)
            ->orderByDesc('id')
            ->get();

        return response()->json($pedidos);
    }

    public function responder(Request $request, $id)
    {
        $user = $request->user();

        $data = $request->validate([
            'resposta_admin' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'in:aberto,em_analise,resolvido,encaminhado'],
        ]);

        $suporte = Suporte::where('escola_id', $user->escola_id)
            ->findOrFail($id);

        $suporte->update([
            'resposta_admin' => $data['resposta_admin'] ?? $suporte->resposta_admin,
            'status' => $data['status'],
        ]);

        return response()->json([
            'message' => 'Pedido de suporte atualizado com sucesso.',
            'suporte' => $suporte,
        ]);
    }
}