<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Models\Atribuicao;
use App\Models\Material;
use App\Models\MaterialVisualizacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Disciplina;
use App\Models\Estudante;
use App\Models\Notificacao;

class MateriaisController extends Controller
{
    public function index(Request $request)
    {
        $professorId = $request->user()->id;

        $materiais = Material::with(['turma', 'disciplina'])
            ->where('professor_id', $professorId)
            ->orderByDesc('id')
            ->get();

        return response()->json($materiais);
    }

    public function store(Request $request)
    {
        $professorId = $request->user()->id;
        $escolaId    = $request->user()->escola_id;

        $data = $request->validate([
            'turma_id'     => ['required', 'integer', 'exists:salas_de_aula,id'],
            'disciplina_id'=> ['required', 'integer', 'exists:disciplinas,id'],
            'titulo'       => ['required', 'string', 'max:255'],
            'tipo'         => ['required', 'in:PDF,Link,Imagem,Video,YouTube,Documento'],
            'url'          => ['nullable', 'string', 'max:500'],
            'descricao'    => ['nullable', 'string', 'max:500'],
            'ficheiro'     => ['nullable', 'file', 'max:51200'], // 50MB
        ]);

        $atribuicao = Atribuicao::where('professor_id', $professorId)
            ->where('turma_id', $data['turma_id'])
            ->where('disciplina_id', $data['disciplina_id'])
            ->first();

        if (!$atribuicao) {
            return response()->json([
                'message' => 'Não tens permissão para adicionar material nesta turma/disciplina.'
            ], 403);
        }
$ficheiroPatch = null;

if ($request->hasFile('ficheiro')) {
    $file = $request->file('ficheiro');
    $nome = time() . '_' . $file->getClientOriginalName();

    $file->move(public_path('materiais'), $nome);

    $ficheiroPatch = 'materiais/' . $nome;
}

        $material = Material::create([
            'turma_id'      => $data['turma_id'],
            'disciplina_id' => $data['disciplina_id'],
            'titulo'        => $data['titulo'],
            'tipo'          => $data['tipo'],
            'url'           => $data['url'] ?? '',
            'ficheiro_path' => $ficheiroPatch,
            'descricao'     => $data['descricao'] ?? null,
            'professor_id'  => $professorId,
            'escola_id'     => $escolaId,
        ]);

        return response()->json([
            'message'  => 'Material adicionado com sucesso.',
            'material' => $material->load(['turma', 'disciplina']),
        ], 201);
        
        $estudantes = Estudante::where('sala_de_aula_id', $material->turma_id)->get();

foreach ($estudantes as $estudante) {

    if (!$estudante->user_id) {
        continue;
    }

    Notificacao::create([
        'user_id' => $estudante->user_id,
        'titulo' => 'Novo material disponível',
        'mensagem' => 'O professor publicou material em ' . ($material->disciplina->nome ?? 'disciplina'),
        'tipo' => 'material',
        'link' => '/aluno/materiais',
    ]);
}
    }

    public function visualizacoes(Request $request, $id)
    {
        $material = Material::where('professor_id', $request->user()->id)
            ->findOrFail($id);

        $visualizacoes = MaterialVisualizacao::with('aluno:id,name')
            ->where('material_id', $id)
            ->orderByDesc('opened_at')
            ->get()
            ->map(fn($v) => [
                'aluno'     => $v->aluno->name ?? 'Desconhecido',
                'opened_at' => $v->opened_at,
            ]);

        $totalAlunos = \App\Models\Estudante::where('sala_de_aula_id', $material->turma_id)->count();

        return response()->json([
            'total_alunos'      => $totalAlunos,
            'total_visualizacoes'=> $visualizacoes->count(),
            'visualizacoes'     => $visualizacoes,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $material = Material::where('professor_id', $request->user()->id)
            ->findOrFail($id);

        if ($material->ficheiro_path) {
            Storage::disk('public')->delete($material->ficheiro_path);
        }

        $material->delete();

        return response()->json(['message' => 'Material removido com sucesso.']);
    }
    public function abrir($id)
{
    $material = Material::findOrFail($id);

    if (!$material->ficheiro_path) {
        return response()->json(['message' => 'Este material não possui ficheiro.'], 404);
    }

    if (!Storage::disk('public')->exists($material->ficheiro_path)) {
        return response()->json(['message' => 'Ficheiro não encontrado.'], 404);
    }

    return Storage::disk('public')->response($material->ficheiro_path);
}
}