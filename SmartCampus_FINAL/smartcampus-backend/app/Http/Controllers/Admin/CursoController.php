<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Curso;
use App\Models\Disciplina;

class CursoController extends Controller
{
    private function gerarCodigo($nome)
    {
        $nome = trim($nome);
        $nome = mb_strtoupper($nome, 'UTF-8');
        $nome = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $nome);
        $nome = preg_replace('/[^A-Z0-9 ]/', '', $nome);

        $partes = preg_split('/\s+/', $nome);

        $codigo = '';
        foreach ($partes as $parte) {
            if (!empty($parte)) {
                $codigo .= substr($parte, 0, 3);
            }
        }

        return substr($codigo, 0, 12);
    }

    private function validarNomeCurso(string $nome): ?string
    {
        $nome = trim($nome);

        if ($nome === '') {
            return 'Nome obrigatório.';
        }

        if (mb_strlen($nome) < 3) {
            return 'Nome do curso demasiado curto.';
        }

        if (!preg_match('/^[\pL0-9\s\-]+$/u', $nome)) {
            return 'O nome do curso só pode conter letras, números, espaços e hífen.';
        }

        if (preg_match('/(.)\1{3,}/u', $nome)) {
            return 'Nome inválido.';
        }

        if (!preg_match('/[\pL]{3,}/u', $nome)) {
            return 'Nome inválido.';
        }

        return null;
    }

    private function validarDescricaoCurso(string $descricao): ?string
    {
        $descricao = trim($descricao);

        if ($descricao === '') {
            return 'Descrição obrigatória.';
        }

        if (mb_strlen($descricao) < 10) {
            return 'Descrição demasiado curta.';
        }

        if (!preg_match('/[\pL]{4,}/u', $descricao)) {
            return 'Descrição inválida.';
        }

        return null;
    }

    public function index()
    {
        $escolaId = auth()->user()->escola_id;

        return Curso::where('escola_id', $escolaId)
            ->orderBy('nome')
            ->get();
    }

    public function store(Request $request)
    {
        $escolaId = auth()->user()->escola_id;

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'descricao' => ['required', 'string', 'max:1000'],
            'duracao' => ['required', 'in:3 anos'],
            'nivel_classe' => ['required', 'in:10ª - 12ª'],
            'status' => ['required', 'in:Ativo,Inativo'],
        ], [
            'nome.required' => 'Nome obrigatório.',
            'descricao.required' => 'Descrição obrigatória.',
            'duracao.required' => 'Duração obrigatória.',
            'duracao.in' => 'Duração inválida.',
            'nivel_classe.required' => 'Nível / Classe obrigatório.',
            'nivel_classe.in' => 'Nível / Classe inválido.',
            'status.required' => 'Status obrigatório.',
            'status.in' => 'Status inválido.',
        ]);

        $erroNome = $this->validarNomeCurso($data['nome']);
        if ($erroNome) {
            return response()->json([
                'message' => $erroNome,
                'errors' => [
                    'nome' => [$erroNome],
                ]
            ], 422);
        }

        $erroDescricao = $this->validarDescricaoCurso($data['descricao']);
        if ($erroDescricao) {
            return response()->json([
                'message' => $erroDescricao,
                'errors' => [
                    'descricao' => [$erroDescricao],
                ]
            ], 422);
        }

        $data['nome'] = trim($data['nome']);
        $data['descricao'] = trim($data['descricao']);
        $data['codigo'] = strtoupper(trim($data['nome']));
        $data['nivel_classe'] = '10ª - 12ª';
        $data['escola_id'] = $escolaId;

        $nomeNormalizado = mb_strtolower(trim($data['nome']));

        $duplicadoPorNome = Curso::where('escola_id', $escolaId)
            ->get()
            ->first(function ($curso) use ($nomeNormalizado) {
                return mb_strtolower(trim($curso->nome)) === $nomeNormalizado;
            });

        if ($duplicadoPorNome) {
            return response()->json([
                'message' => 'Já existe um curso com este nome.',
                'errors' => [
                    'nome' => ['Já existe um curso com este nome.']
                ]
            ], 422);
        }

        if (
            Curso::where('codigo', $data['codigo'])
                ->where('escola_id', $escolaId)
                ->exists()
        ) {
            return response()->json([
                'message' => 'Já existe um curso com este código.',
                'errors' => [
                    'nome' => ['Já existe um curso com este código.']
                ]
            ], 422);
        }

        $curso = Curso::create($data);

        return response()->json([
            'message' => 'Curso criado com sucesso.',
            'curso' => $curso,
        ], 201);
    }

    public function show($id)
    {
        $escolaId = auth()->user()->escola_id;

        return Curso::where('escola_id', $escolaId)
            ->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $escolaId = auth()->user()->escola_id;

        $curso = Curso::where('escola_id', $escolaId)
            ->findOrFail($id);

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'codigo' => ['require', 'string', 'max:10'],
            'descricao' => ['required', 'string', 'max:1000'],
            'duracao' => ['required', 'in:3 anos'],
            'nivel_classe' => ['required', 'in:10ª - 12ª'],
            'status' => ['required', 'in:Ativo,Inativo'],
        ], [
            'nome.required' => 'Nome obrigatório.',
            'descricao.required' => 'Descrição obrigatória.',
            'duracao.required' => 'Duração obrigatória.',
            'duracao.in' => 'Duração inválida.',
            'nivel_classe.required' => 'Nível / Classe obrigatório.',
            'nivel_classe.in' => 'Nível / Classe inválido.',
            'status.required' => 'Status obrigatório.',
            'status.in' => 'Status inválido.',
        ]);

        $erroNome = $this->validarNomeCurso($data['nome']);
        if ($erroNome) {
            return response()->json([
                'message' => $erroNome,
                'errors' => [
                    'nome' => [$erroNome],
                ]
            ], 422);
        }

        $erroDescricao = $this->validarDescricaoCurso($data['descricao']);
        if ($erroDescricao) {
            return response()->json([
                'message' => $erroDescricao,
                'errors' => [
                    'descricao' => [$erroDescricao],
                ]
            ], 422);
        }

        $data['nome'] = trim($data['nome']);
        $data['descricao'] = trim($data['descricao']);
        $data['codigo'] = strtoupper(trim($data['nome']));
        $data['nivel_classe'] =  '10ª - 12ª';

        $nomeNormalizado = mb_strtolower(trim($data['nome']));

        $duplicadoPorNome = Curso::where('escola_id', $escolaId)
            ->where('id', '!=', $id)
            ->get()
            ->first(function ($curso) use ($nomeNormalizado) {
                return mb_strtolower(trim($curso->nome)) === $nomeNormalizado;
            });

        if ($duplicadoPorNome) {
            return response()->json([
                'message' => 'Já existe um curso com este nome.',
                'errors' => [
                    'nome' => ['Já existe um curso com este nome.']
                ]
            ], 422);
        }

        if (
            Curso::where('codigo', $data['codigo'])
                ->where('escola_id', $escolaId)
                ->where('id', '!=', $id)
                ->exists()
        ) {
            return response()->json([
                'message' => 'Já existe um curso com este código.',
                'errors' => [
                    'nome' => ['Já existe um curso com este código.']
                ]
            ], 422);
        }

        $curso->update($data);

        return response()->json([
            'message' => 'Curso atualizado com sucesso.',
            'curso' => $curso,
        ]);
    }

    public function destroy($id)
    {
        $escolaId = auth()->user()->escola_id;

        $curso = Curso::where('escola_id', $escolaId)
            ->with('disciplinas')
            ->findOrFail($id);

        if ($curso->disciplinas()->exists()) {
            return response()->json([
                'message' => 'Não é possível apagar este curso porque já possui disciplinas associadas.',
            ], 422);
        }

        $curso->delete();

        return response()->json([
            'message' => 'Curso apagado com sucesso.',
        ]);
    }

    public function disciplinas($id)
    {
        $escolaId = auth()->user()->escola_id;

        $curso = Curso::where('escola_id', $escolaId)
            ->with(['disciplinas' => function ($query) use ($escolaId) {
                $query->where('escola_id', $escolaId);
            }])
            ->findOrFail($id);

        return response()->json($curso->disciplinas);
    }

    public function syncDisciplinas(Request $request, $id)
    {
        $escolaId = auth()->user()->escola_id;

        $curso = Curso::where('escola_id', $escolaId)
            ->findOrFail($id);

        $data = $request->validate([
            'disciplinas' => ['required', 'array'],
            'disciplinas.*' => ['integer'],
        ]);

        $disciplinasIds = Disciplina::where('escola_id', $escolaId)
            ->whereIn('id', $data['disciplinas'])
            ->pluck('id')
            ->toArray();

        if (count($disciplinasIds) !== count($data['disciplinas'])) {
            return response()->json([
                'message' => 'Uma ou mais disciplinas não pertencem à tua escola.',
            ], 422);
        }

        $curso->disciplinas()->sync($disciplinasIds);

        return response()->json([
            'message' => 'Disciplinas do curso atualizadas com sucesso.',
            'curso' => $curso->load(['disciplinas' => function ($query) use ($escolaId) {
                $query->where('escola_id', $escolaId);
            }]),
        ]);
    }
}