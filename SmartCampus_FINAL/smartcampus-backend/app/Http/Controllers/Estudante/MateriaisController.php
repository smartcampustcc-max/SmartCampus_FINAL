<?php

namespace App\Http\Controllers\Estudante;

use App\Http\Controllers\Controller;
use App\Models\Estudante;
use App\Models\Material;
use App\Models\MaterialVisualizacao;
use Illuminate\Http\Request;

class MateriaisController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $estudante = Estudante::where('user_id', $user->id)->first();

        if (!$estudante || !$estudante->sala_de_aula_id) {
            return response()->json([]);
        }

        $materiais = Material::with(['professor:id,name', 'disciplina:id,nome'])
            ->where('turma_id', $estudante->sala_de_aula_id)
            ->orderByDesc('id')
            ->get()
            ->map(function ($m) use ($user) {
                $visto = MaterialVisualizacao::where('material_id', $m->id)
                    ->where('aluno_id', $user->id)
                    ->exists();
                return array_merge($m->toArray(), ['visto' => $visto]);
            });

        return response()->json($materiais);
    }

    public function abrir(Request $request, $id)
    {
        $user      = $request->user();
        $estudante = Estudante::where('user_id', $user->id)->first();

        if (!$estudante) {
            return response()->json(['message' => 'Estudante não encontrado.'], 404);
        }

        $material = Material::where('turma_id', $estudante->sala_de_aula_id)
            ->findOrFail($id);

        
        MaterialVisualizacao::updateOrCreate([
            'material_id' => $material->id,
            'aluno_id'    => $user->id,
        ], [
            'opened_at' => now(),
        ]);

        return response()->json([
            'material' => $material,
            'url'      => $material->ficheiro_path
                ? asset('storage/' . $material->ficheiro_path)
                : $material->url,
        ]);
    }
}