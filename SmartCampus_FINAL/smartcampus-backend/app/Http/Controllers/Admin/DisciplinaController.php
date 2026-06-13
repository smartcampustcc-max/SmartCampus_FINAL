<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Disciplina;
use Illuminate\Http\Request;

class DisciplinaController extends Controller
{
    private function gerarCodigo($nome)
    {
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

        return substr($codigo, 0, 10);
    }

    public function index()
    {
        $escolaId = auth()->user()->escola_id;

        return Disciplina::where('escola_id', $escolaId)
            ->orderByDesc('id')
            ->get();
    }

    public function store(Request $request)
    {
        $escolaId = auth()->user()->escola_id;

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255', 'regex:/^[\pL\s]+$/u'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'carga_horaria' => ['required', 'integer', 'min:1'],
        ], [
            'nome.required' => 'Nome obrigatório.',
            'nome.regex' => 'O nome da disciplina deve conter apenas letras e espaços.',
            'carga_horaria.required' => 'Carga horária obrigatória.',
            'carga_horaria.integer' => 'Carga horária deve ser numérica.',
            'carga_horaria.min' => 'Carga horária deve ser no mínimo 1.',
        ]);

        $data['nome'] = trim($data['nome']);
        $data['codigo'] = !empty($data['codigo']) 
        ? strtoupper(trim($data['codigo']))
        : $this->gerarCodigo($data['nome']);
        $data['escola_id'] = $escolaId;

        $nomeNormalizado = trim(mb_strtolower($data['nome']));

        $duplicadaPorNome = Disciplina::where('escola_id', $escolaId)
            ->get()
            ->first(function ($d) use ($nomeNormalizado) {
                return trim(mb_strtolower($d->nome)) === $nomeNormalizado;
            });

        if ($duplicadaPorNome) {
            return response()->json([
                'message' => 'Já existe uma disciplina com este nome nesta escola.',
                'errors' => [
                    'nome' => ['Já existe uma disciplina com este nome nesta escola.']
                ]
            ], 422);
        }

        if (
            Disciplina::where('codigo', $data['codigo'])
                ->where('escola_id', $escolaId)
                ->exists()
        ) {
            return response()->json([
                'message' => 'Já existe uma disciplina com este código nesta escola.',
                'errors' => [
                    'nome' => ['Já existe uma disciplina com este código nesta escola.']
                ]
            ], 422);
        }

        $disciplina = Disciplina::create($data);

        return response()->json($disciplina, 201);
    }

    public function show($id)
    {
        $escolaId = auth()->user()->escola_id;

        return Disciplina::where('escola_id', $escolaId)
            ->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $escolaId = auth()->user()->escola_id;

        $disciplina = Disciplina::where('escola_id', $escolaId)
            ->findOrFail($id);

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255', 'regex:/^[\pL\s]+$/u'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'carga_horaria' => ['required', 'integer', 'min:1'],
        ], [
            'nome.required' => 'Nome obrigatório.',
            'nome.regex' => 'O nome da disciplina deve conter apenas letras e espaços.',
            'carga_horaria.required' => 'Carga horária obrigatória.',
            'carga_horaria.integer' => 'Carga horária deve ser numérica.',
            'carga_horaria.min' => 'Carga horária deve ser no mínimo 1.',
        ]);

        $data['nome'] = trim($data['nome']);
        $data['codigo'] = !empty($data['codigo'])
            ? strtoupper(trim($data['codigo']))
            : $this->gerarCodigo($data['nome']);

        $nomeNormalizado = trim(mb_strtolower($data['nome']));

        $duplicadaPorNome = Disciplina::where('escola_id', $escolaId)
            ->where('id', '!=', $id)
            ->get()
            ->first(function ($d) use ($nomeNormalizado) {
                return trim(mb_strtolower($d->nome)) === $nomeNormalizado;
            });

        if ($duplicadaPorNome) {
            return response()->json([
                'message' => 'Já existe uma disciplina com este nome nesta escola.',
                'errors' => [
                    'nome' => ['Já existe uma disciplina com este nome nesta escola.']
                ]
            ], 422);
        }

        if (
            Disciplina::where('codigo', $data['codigo'])
                ->where('escola_id', $escolaId)
                ->where('id', '!=', $id)
                ->exists()
        ) {
            return response()->json([
                'message' => 'Já existe uma disciplina com este código nesta escola.',
                'errors' => [
                    'nome' => ['Já existe uma disciplina com este código nesta escola.']
                ]
            ], 422);
        }

        $disciplina->update($data);

        return response()->json($disciplina);
    }

    public function destroy($id)
    {
        $escolaId = auth()->user()->escola_id;

        $disciplina = Disciplina::where('escola_id', $escolaId)
            ->with('professores')
            ->findOrFail($id);

        if ($disciplina->professores()->exists()) {
            return response()->json([
                'message' => 'Não é possível apagar esta disciplina porque já está associada a professores.'
            ], 422);
        }

        $disciplina->delete();

        return response()->json([
            'message' => 'Disciplina apagada.'
        ]);
    }
}