<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendStudentCredentialsSms;
use App\Models\Curso;
use App\Models\Estudante;
use App\Models\SalaDeAula;
use App\Models\User;
use App\Models\Disciplina;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SalaDeAulaController extends Controller
{
    public function index(Request $request)
    {
        $escolaId = $request->user()->escola_id;

        $turmas = SalaDeAula::with('curso','estudantes')
            ->withCount('estudantes')
            ->where('escola_id', $escolaId)
            ->orderByDesc('id')
            ->get();

        return response()->json($turmas);
    }

    public function store(Request $request)
    {
        $escolaId = $request->user()->escola_id;

        $data = $request->validate([
            'curso_id' => ['required', 'integer'],
            'nome' => ['nullable', 'string', 'max:255'],
            'classe' => ['required', 'string', 'in:10,11,12'],
            'turno' => ['required', 'string', 'in:Manhã,Tarde'],
            'ano_letivo' => ['nullable', 'string', 'max:50'],
            'codigo_turma' => ['nullable', 'string', 'max:100'],
            'limite_alunos' => ['required', 'integer', 'min:15', 'max:35'],
            'status' => ['nullable', 'in:Ativo,Inativo'],
        ],
        [
            'limite_alunos.max' => 'A capacidade máxima permitida é dde 35 alunos.',
            'limite_alunos.min' => 'A capacidade mínima permitida é de 15 alunos.',
        ]);

        if ((int) $data['limite_alunos'] < 15 || (int) $data['limite_alunos'] > 35) {
            return response()->json([
                'message' => 'A capacidade máxima permitida é 35 alunos.',
                'errors' => [
                    'limite_alunos' => ['A capacidade deve estar entre 15 e 35 alunos.'],
                ],
            ], 422);
        }

        $curso = Curso::where('id', $data['curso_id'])
            ->where('escola_id', $escolaId)
            ->firstOrFail();

        $existe = SalaDeAula::where('escola_id', $escolaId)
            ->where('curso_id', $curso->id)
            ->where('classe', $data['classe'])
            ->where('turno', $data['turno'])
            ->exists();

        if ($existe) {
            return response()->json([
                'message' => 'Já existe uma turma para esta classe neste turno.',
                'errors' => [
                    'classe' => ['Já existe uma turma para esta classe neste turno.'],
                    'turno' => ['Escolha outro turno ou edite a turma existente.'],
                ],
            ], 422);
        }

        $codigoGerado = $this->gerarCodigoTurma($curso->nome, $data['classe'], $data['turno']);
        $nomeGerado = $this->gerarNomeTurma($curso->nome, $data['classe'], $data['turno']);

        $turma = SalaDeAula::create([
            'curso_id' => $curso->id,
            'nome' => $nomeGerado,
            'classe' => $data['classe'],
            'letra' => null,
            'turno' => $data['turno'],
            'ano_letivo' => $data['ano_letivo'] ?? null,
            'codigo_turma' => $codigoGerado,
            'escola_id' => $escolaId,
            'limite_alunos' => $data['limite_alunos'],
            'status' => $data['status'] ?? 'Ativo',
        ]);

        return response()->json([
            'message' => 'Turma criada com sucesso.',
            'turma' => $turma->load('curso'),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        $turma = SalaDeAula::with(['curso', 'estudantes.curso', 'estudantes.user'])
            ->where('escola_id', $escolaId)
            ->findOrFail($id);

        return response()->json($turma);
    }

    public function update(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        $turma = SalaDeAula::where('escola_id', $escolaId)->findOrFail($id);

        $data = $request->validate([
            'curso_id' => ['required', 'integer'],
            'nome' => ['nullable', 'string', 'max:255'],
            'classe' => ['required', 'string', 'in:10,11,12'],
            'turno' => ['required', 'string', 'in:Manhã,Tarde'],
            'ano_letivo' => ['nullable', 'string', 'max:50'],
            'codigo_turma' => ['nullable', 'string', 'max:100'],
            'limite_alunos' => ['required', 'integer', 'min:15', 'max:35'],
            'status' => ['nullable', 'in:Ativo,Inativo'],
            
        ],
        [
            'limite_alunos.max' => 'A capacidade máxima permitida é dde 35 alunos.',
            'limite_alunos.min' => 'A capacidade mínima permitida é de 15 alunos.',
        ]);

        if ((int) $data['limite_alunos'] < 15 || (int) $data['limite_alunos'] > 35) {
            return response()->json([
                'message' => 'A capacidade máxima permitida é 35 alunos.',
                'errors' => [
                    'limite_alunos' => ['A capacidade deve estar entre 15 e 35 alunos.'],
                ],
            ], 422);
        }

        $curso = Curso::where('id', $data['curso_id'])
            ->where('escola_id', $escolaId)
            ->firstOrFail();

        $existe = SalaDeAula::where('escola_id', $escolaId)
            ->where('curso_id', $curso->id)
            ->where('classe', $data['classe'])
            ->where('turno', $data['turno'])
            ->where('id', '!=', $turma->id)
            ->exists();

        if ($existe) {
            return response()->json([
                'message' => 'Já existe uma turma para esta classe neste turno.',
                'errors' => [
                    'classe' => ['Já existe uma turma para esta classe neste turno.'],
                    'turno' => ['Escolha outro turno ou edite a turma existente.'],
                ],
            ], 422);
        }

        $codigoGerado = $this->gerarCodigoTurma($curso->nome, $data['classe'], $data['turno']);
        $nomeGerado = $this->gerarNomeTurma($curso->nome, $data['classe'], $data['turno']);

        $turma->update([
            'curso_id' => $curso->id,
            'nome' => $nomeGerado,
            'classe' => $data['classe'],
            'letra' => null,
            'turno' => $data['turno'],
            'ano_letivo' => $data['ano_letivo'] ?? null,
            'codigo_turma' => $codigoGerado,
            'limite_alunos' => $data['limite_alunos'],
            'status' => $data['status'] ?? $turma->status,
        ]);

        return response()->json([
            'message' => 'Turma atualizada com sucesso.',
            'turma' => $turma->load('curso'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        $turma = SalaDeAula::where('escola_id', $escolaId)->findOrFail($id);
        $turma->delete();

        return response()->json([
            'message' => 'Turma apagada com sucesso.',
        ]);
    }

    public function alunosElegiveis(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        $turma = SalaDeAula::where('escola_id', $escolaId)->findOrFail($id);

        $alunos = Estudante::with('user')
            ->where('escola_id', $escolaId)
            ->where('curso_id', $turma->curso_id)
            ->where(function ($q) use ($id) {
                $q->whereNull('sala_de_aula_id')
                    ->orWhere('sala_de_aula_id', $id);
            })
            ->orderBy('nome_completo')
            ->get();

        return response()->json($alunos);
    }

    public function adicionarAlunos(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        $turma = SalaDeAula::where('escola_id', $escolaId)
            ->with('curso')
            ->findOrFail($id);

        $data = $request->validate([
            'alunos_ids' => ['required', 'array', 'min:1'],
            'alunos_ids.*' => ['integer'],
        ]);

        $alunosIds = $data['alunos_ids'];

        $alunos = Estudante::where('escola_id', $escolaId)
            ->where('curso_id', $turma->curso_id)
            ->whereIn('id', $alunosIds)
            ->get();

        if ($alunos->count() !== count($alunosIds)) {
            return response()->json([
                'message' => 'Há alunos inválidos ou de outro curso/escola.',
            ], 422);
        }

        $totalAtual = Estudante::where('sala_de_aula_id', $turma->id)->count();
        $novosAlunos = $alunos->whereNull('sala_de_aula_id')->count();
        $totalDepois = $totalAtual + $novosAlunos;

        if ($totalDepois > ($turma->limite_alunos ?? 35)) {
            return response()->json([
                'message' => 'Limite de alunos por turma excedido.',
            ], 422);
        }

        $credenciaisGeradas = [];

        foreach ($alunos as $aluno) {
            $aluno->update([
                'sala_de_aula_id' => $turma->id,
                'status_matricula'=>'Ativo',
            ]);

            $resultado = $this->criarContaEEnviarCredenciaisSeNecessario($aluno, $turma, $escolaId);

            if ($resultado) {
                $credenciaisGeradas[] = $resultado;
            }
        }
      $this->reorganizarNumerosDaTurma($turma->id);
        return response()->json([
            'message' => 'Alunos adicionados à turma com sucesso.',
            'credenciais_geradas' => $credenciaisGeradas,
        ]);
    }

    public function removerAluno(Request $request, $turmaId, $alunoId)
    {
        $escolaId = $request->user()->escola_id;

        $turma = SalaDeAula::where('escola_id', $escolaId)->findOrFail($turmaId);

        $aluno = Estudante::where('escola_id', $escolaId)
            ->where('sala_de_aula_id', $turma->id)
            ->findOrFail($alunoId);

        $aluno->update([
            'sala_de_aula_id' => null,
            'numero_turma' =>null,
             'status_matricula'=>'Pendente',
        ]);
      $this->reorganizarNumerosDaTurma($turma->id);
        return response()->json([
            'message' => 'Aluno removido da turma com sucesso.',
        ]);
    }

    public function preencherAutomatico(Request $request, $id)
    {
        $escolaId = $request->user()->escola_id;

        $turma = SalaDeAula::where('escola_id', $escolaId)
            ->with('curso')
            ->findOrFail($id);

        $totalAtual = Estudante::where('sala_de_aula_id', $turma->id)->count();

        $limite = $turma->limite_alunos ?? 35;
        $vagas = $limite - $totalAtual;

        if ($vagas <= 0) {
            return response()->json([
                'message' => 'Turma já está cheia.',
            ], 422);
        }

        $alunos = Estudante::where('escola_id', $escolaId)
            ->where('curso_id', $turma->curso_id)
            ->whereNull('sala_de_aula_id')
            ->inRandomOrder()
            ->limit($vagas)
            ->get();

        if ($alunos->isEmpty()) {
            return response()->json([
                'message' => 'Sem alunos disponíveis para adicionar.',
            ], 422);
        }

        $credenciaisGeradas = [];

        foreach ($alunos as $aluno) {
            $aluno->update([
                'sala_de_aula_id' => $turma->id,
                 'status_matricula'=>'Ativo',
            ]);

            $resultado = $this->criarContaEEnviarCredenciaisSeNecessario($aluno, $turma, $escolaId);

            if ($resultado) {
                $credenciaisGeradas[] = $resultado;
            }
        }
$this->reorganizarNumerosDaTurma($turma->id);
        return response()->json([
            'message' => 'Turma preenchida  com sucesso.',
            'adicionados' => $alunos->count(),
            'credenciais_geradas' => $credenciaisGeradas,
        ]);
    }

    private function criarContaEEnviarCredenciaisSeNecessario(Estudante $aluno, SalaDeAula $turma, int $escolaId): ?array
    {
        if ($aluno->user_id) {
            return null;
        }

        $username = $this->gerarUsername($turma->codigo_turma, $aluno->numero_aluno);
        $emailTemporario = $this->gerarEmailTemporario($username);

        $userExistente = User::where('email', $emailTemporario)
            ->orWhere('username', $username)
            ->first();

        if ($userExistente) {
            return null;
        }

        $senhaPlana = $this->gerarSenhaAleatoria();

        $user = User::create([
            'name' => $aluno->nome_completo,
            'email' => $emailTemporario,
            'username' => $username,
            'password' => Hash::make($senhaPlana),
            'phone' => $aluno->telefone,
            'must_change_password' => true,
            'role' => 'estudante',
            'escola_id' => $escolaId,
        ]);

        $aluno->update([
            'user_id' => $user->id,
        ]);

        SendStudentCredentialsSms::dispatchSync(
            $aluno->id,
            $username,
            $senhaPlana,
            $turma->codigo_turma ?? $turma->nome
        );

        return [
            'aluno_id' => $aluno->id,
            'nome' => $aluno->nome_completo,
            'username' => $username,
        ];
    }

    private function gerarUsername(?string $codigoTurma, string $numeroAluno): string
    {
        $codigo = strtoupper(trim($codigoTurma ?: 'TURMA'));
        $codigo = preg_replace('/[^A-Z0-9\-]/', '', $codigo);

        return $codigo . '-' . strtoupper($numeroAluno);
    }

    private function gerarSenhaAleatoria(): string
    {
        return Str::random(8);
    }

    private function gerarEmailTemporario(string $username): string
    {
        return strtolower($username) . '@smartcampus.local';
    }

    private function abreviarCurso(string $nomeCurso): string
    {
        $curso = Str::upper(trim($nomeCurso));
        $curso = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $curso);
        $curso = preg_replace('/[^A-Z0-9 ]/', '', $curso);

        if (str_contains($curso, 'ECONOMICAS') || str_contains($curso, 'JURIDICAS')) {
            return 'CEJ';
        }

        if (str_contains($curso, 'FISICAS') || str_contains($curso, 'BIOLOGICAS')) {
            return 'CFB';
        }

        $palavras = preg_split('/\s+/', $curso);

        if (count($palavras) === 1) {
            return substr($palavras[0], 0, 4);
        }

        return substr(collect($palavras)->map(fn ($p) => substr($p, 0, 1))->implode(''), 0, 4);
    }

    private function abreviarTurno(string $turno): string
    {
        return $turno === 'Manhã' ? 'M' : 'T';
    }

    private function gerarCodigoTurma(string $nomeCurso, string $classe, string $turno): string
    {
        return $this->abreviarCurso($nomeCurso)
            . trim($classe)
            . $this->abreviarTurno($turno);
    }

    private function gerarNomeTurma(string $nomeCurso, string $classe, string $turno): string
    {
        return trim($classe) . 'ª ' . trim($nomeCurso) . ' - ' . trim($turno);
    }
    public function disciplinas(Request $request, $id)
{
    $escolaId = $request->user()->escola_id;

    $turma = SalaDeAula::where('escola_id', $escolaId)
        ->with('disciplinas')
        ->findOrFail($id);

    return response()->json($turma->disciplinas);
}
public function syncDisciplinas(Request $request, $id)
{
    $escolaId = $request->user()->escola_id;

    $turma = SalaDeAula::where('escola_id', $escolaId)->findOrFail($id);

    $data = $request->validate([
        'disciplinas' => ['required', 'array', 'min:2'],
        'disciplinas.*' => ['required', 'integer'],
    ], [
        'disciplinas.required' => 'Seleciona no mínimo 2 disciplinas para esta turma.',
        'disciplinas.array' => 'As disciplinas devem ser enviadas em formato de lista.',
        'disciplinas.min' => 'Seleciona no mínimo 2 disciplinas para esta turma.',
        'disciplinas.*.integer' => 'Uma ou mais disciplinas são inválidas.',
    ]);

    $disciplinasIds = Disciplina::where('escola_id', $escolaId)
        ->whereIn('id', $data['disciplinas'])
        ->pluck('id')
        ->toArray();

    if (count($disciplinasIds) !== count($data['disciplinas'])) {
        return response()->json([
            'message' => 'Uma ou mais disciplinas são inválidas.',
        ], 422);
    }

    $turma->disciplinas()->sync($disciplinasIds);

    return response()->json([
        'message' => 'Disciplinas da turma atualizadas com sucesso.',
        'disciplinas' => $turma->disciplinas()->get(),
    ]);
}
private function reorganizarNumerosDaTurma(int $turmaId): void
{
    $alunos = Estudante::where('sala_de_aula_id', $turmaId)
        ->orderBy('nome_completo')
        ->get();

    foreach ($alunos as $index => $aluno) {
        $aluno->update([
            'numero_turma' => $index + 1,
        ]);
    }
}
}