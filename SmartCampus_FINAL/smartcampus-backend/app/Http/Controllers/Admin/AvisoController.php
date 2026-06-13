<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aviso;
use Illuminate\Http\Request;

class AvisoController extends Controller
{
    public function index(Request $request)
    {
        $escolaId = $request->user()->escola_id;

        return Aviso::where('escola_id', $escolaId)
            ->orderByDesc('id')
            ->get();
    }

    public function store(Request $request)
    {
        $escolaId = $request->user()->escola_id;

        $data = $request->validate([
            'titulo'   => ['required', 'string', 'max:255'],
            'mensagem' => ['required', 'string', 'min:5'],
            'destino'  => ['required', 'in:Todos,Alunos,Professores'],
        ]);

        $aviso = Aviso::create([
            'escola_id'  => $escolaId,
            'criado_por' => $request->user()->id,
            'titulo'     => $data['titulo'],
            'mensagem'   => $data['mensagem'],
            'destino'    => $data['destino'],
        ]);

        return response()->json([
            'message' => 'Aviso publicado com sucesso.',
            'aviso'   => $aviso,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        $aviso = Aviso::where('escola_id', $escolaId)->findOrFail($id);
        $aviso->delete();

        return response()->json(['message' => 'Aviso removido.']);
    }
}