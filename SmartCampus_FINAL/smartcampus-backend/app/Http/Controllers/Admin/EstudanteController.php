<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\Estudante;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;


class EstudanteController extends Controller
{
    public function index()
    {
        $escolaId = auth()->user()->escola_id;

        return response()->json(
            Estudante::where('escola_id', $escolaId)
                ->with('curso')
                ->orderBy('nome_completo')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $escolaId = auth()->user()->escola_id;

        $data = $request->validate([
            'nome_completo' => ['required', 'string', 'max:255'],
            'numero_bi' => ['required', 'string', 'max:30', 'unique:estudantes,numero_bi'],
            'sexo' => ['required', 'in:Masculino,Feminino'],
            'data_nascimento' => ['required', 'date', 'before:today'],
            'naturalidade' => ['required', 'string', 'max:255'],
            'morada' => ['required', 'string', 'max:255'],
            'nome_pai' => ['required', 'string', 'max:255'],
            'nome_mae' => ['required', 'string', 'max:255'],
            'contacto_encarregado' => ['required', 'string', 'max:20'],
            'telefone' => ['required', 'string', 'max:20', 'unique:estudantes,telefone'],
            'ano_letivo' => ['required', 'regex:/^\d{4}\/\d{4}$/'],
            'classe' => ['required', 'in:10,11,12'],
            'curso_id' => ['required', 'integer'],
            'turno_preferido' => ['nullable', 'in:Manhã,Tarde'],
            'status_matricula' => ['nullable', 'in:Ativo,Pendente,Transferido,Cancelado'],
            'tipo_matricula' => ['required', 'in:Novo ingresso,Transferência'],
            'documento_certificado' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'documento_transferencia' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $this->validarNomeCompleto($data['nome_completo']);
        $this->validarBI($data['numero_bi']);
        $this->validarIdade($data['data_nascimento']);
        $this->validarTextoSimples($data['naturalidade'], 'naturalidade', 'Naturalidade inválida.');
        $this->validarMorada($data['morada']);
        $this->validarNomePessoa($data['nome_pai'], 'nome_pai', 'Nome do pai inválido.');
        $this->validarNomePessoa($data['nome_mae'], 'nome_mae', 'Nome da mãe inválido.');
        $this->validarTelefone($data['telefone']);
        $this->validarTelefone($data['contacto_encarregado'], 'contacto_encarregado');

        Curso::where('escola_id', $escolaId)->findOrFail($data['curso_id']);

        if ($data['tipo_matricula'] === 'Novo ingresso' && !$request->hasFile('documento_certificado')) {
            throw ValidationException::withMessages([
                'documento_certificado' => 'O certificado da 9ª classe é obrigatório para novo ingresso.',
            ]);
        }

        if ($data['tipo_matricula'] === 'Transferência' && !$request->hasFile('documento_transferencia')) {
            throw ValidationException::withMessages([
                'documento_transferencia' => 'O documento de transferência é obrigatório.',
            ]);
        }

        if ($request->hasFile('documento_certificado')) {
            $data['documento_certificado'] = $request
                ->file('documento_certificado')
                ->store('documentos/estudantes/certificados', 'public');
        }

        if ($request->hasFile('documento_transferencia')) {
            $data['documento_transferencia'] = $request
                ->file('documento_transferencia')
                ->store('documentos/estudantes/transferencias', 'public');
        }

        $data['escola_id'] = $escolaId;
        $data['numero_aluno'] = $this->gerarNumeroAluno();
        $data['status_matricula'] = 'Pendente';

        $aluno = Estudante::create($data);

        return response()->json([
            'message' => 'Matrícula criada com sucesso.',
            'aluno' => $aluno->load('curso'),
        ], 201);
    }

    public function show($id)
    {
        $escolaId = auth()->user()->escola_id;

        $aluno = Estudante::where('escola_id', $escolaId)
            ->with('curso')
            ->findOrFail($id);

        return response()->json($aluno);
    }

    public function update(Request $request, $id)
    {
        $escolaId = auth()->user()->escola_id;

        $aluno = Estudante::where('escola_id', $escolaId)->findOrFail($id);

        $data = $request->validate([
            'nome_completo' => ['sometimes', 'required', 'string', 'max:255'],
            'numero_bi' => ['sometimes', 'required', 'string', 'max:30', 'unique:estudantes,numero_bi,' . $id],
            'sexo' => ['sometimes', 'required', 'in:Masculino,Feminino'],
            'data_nascimento' => ['sometimes', 'required', 'date', 'before:today'],
            'naturalidade' => ['sometimes', 'required', 'string', 'max:255'],
            'morada' => ['sometimes', 'required', 'string', 'max:255'],
            'nome_pai' => ['sometimes', 'required', 'string', 'max:255'],
            'nome_mae' => ['sometimes', 'required', 'string', 'max:255'],
            'contacto_encarregado' => ['sometimes', 'required', 'string', 'max:20'],
            'telefone' => ['sometimes', 'required', 'string', 'max:20', 'unique:estudantes,telefone,' . $id],
            'ano_letivo' => ['sometimes', 'required', 'regex:/^\d{4}\/\d{4}$/'],
            'classe' => ['sometimes', 'required', 'in:10,11,12'],
            'curso_id' => ['sometimes', 'required', 'integer'],
            'turno_preferido' => ['sometimes', 'nullable', 'in:Manhã,Tarde'],
            'status_matricula' => ['sometimes', 'nullable', 'in:Ativo,Pendente,Transferido,Cancelado'],
            'tipo_matricula' => ['sometimes', 'required', 'in:Novo ingresso,Transferência'],
            'documento_certificado' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'documento_transferencia' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        if (isset($data['nome_completo'])) {
            $this->validarNomeCompleto($data['nome_completo']);
        }

        if (isset($data['numero_bi'])) {
            $this->validarBI($data['numero_bi']);
        }

        if (isset($data['data_nascimento'])) {
            $this->validarIdade($data['data_nascimento']);
        }

        if (isset($data['naturalidade'])) {
            $this->validarTextoSimples($data['naturalidade'], 'naturalidade', 'Naturalidade inválida.');
        }

        if (isset($data['morada'])) {
            $this->validarMorada($data['morada']);
        }

        if (isset($data['nome_pai'])) {
            $this->validarNomePessoa($data['nome_pai'], 'nome_pai', 'Nome do pai inválido.');
        }

        if (isset($data['nome_mae'])) {
            $this->validarNomePessoa($data['nome_mae'], 'nome_mae', 'Nome da mãe inválido.');
        }

        if (isset($data['telefone'])) {
            $this->validarTelefone($data['telefone']);
        }

        if (isset($data['contacto_encarregado'])) {
            $this->validarTelefone($data['contacto_encarregado'], 'contacto_encarregado');
        }

        if (!empty($data['curso_id'])) {
            Curso::where('escola_id', $escolaId)->findOrFail($data['curso_id']);
        }

        if ($request->hasFile('documento_certificado')) {
            $data['documento_certificado'] = $request
                ->file('documento_certificado')
                ->store('documentos/estudantes/certificados', 'public');
        }

        if ($request->hasFile('documento_transferencia')) {
            $data['documento_transferencia'] = $request
                ->file('documento_transferencia')
                ->store('documentos/estudantes/transferencias', 'public');
        }

        $aluno->update($data);

        return response()->json([
            'message' => 'Matrícula atualizada com sucesso.',
            'aluno' => $aluno->load('curso'),
        ]);
    }

    public function destroy($id)
    {
        $escolaId = auth()->user()->escola_id;

        $aluno = Estudante::where('escola_id', $escolaId)->findOrFail($id);
        $aluno->delete();

        return response()->json([
            'message' => 'Aluno removido com sucesso.',
        ]);
    }

    private function validarNomeCompleto(string $nome): void
    {
        $nome = trim($nome);

        if (str_word_count($nome) < 2) {
            throw ValidationException::withMessages([
                'nome_completo' => 'Informe o nome completo do aluno.',
            ]);
        }

        if (!preg_match('/^[\pL\s]+$/u', $nome)) {
            throw ValidationException::withMessages([
                'nome_completo' => 'O nome deve conter apenas letras e espaços.',
            ]);
        }

        if (preg_match('/(.)\1{3,}/u', $nome)) {
            throw ValidationException::withMessages([
                'nome_completo' => 'Nome inválido.',
            ]);
        }
    }

    private function validarNomePessoa(string $valor, string $campo, string $mensagem): void
    {
        $valor = trim($valor);

        if (mb_strlen($valor) < 3 || !preg_match('/^[\pL\s\-]+$/u', $valor)) {
            throw ValidationException::withMessages([
                $campo => $mensagem,
            ]);
        }

        if (preg_match('/(.)\1{3,}/u', $valor)) {
            throw ValidationException::withMessages([
                $campo => $mensagem,
            ]);
        }
    }

    private function validarTextoSimples(string $valor, string $campo, string $mensagem): void
    {
        $valor = trim($valor);

        if (mb_strlen($valor) < 3 || !preg_match('/[\pL]{3,}/u', $valor)) {
            throw ValidationException::withMessages([
                $campo => $mensagem,
            ]);
        }

        if (!preg_match('/^[\pL\s\-]+$/u', $valor)) {
            throw ValidationException::withMessages([
                $campo => $mensagem,
            ]);
        }
    }

    private function validarMorada(string $morada): void
    {
        $morada = trim($morada);

        if (mb_strlen($morada) < 5 || !preg_match('/[\pL]{3,}/u', $morada)) {
            throw ValidationException::withMessages([
                'morada' => 'Morada inválida.',
            ]);
        }

        if (!preg_match('/^[\pL0-9\s,\.\-ºª\/]+$/u', $morada)) {
            throw ValidationException::withMessages([
                'morada' => 'Morada inválida.',
            ]);
        }
    }

    private function validarBI(string $bi): void
    {
        $bi = strtoupper(trim($bi));

        if (!preg_match('/^[0-9]{9}(LA|ME|ZE|BE|BA|BO|CA|CC|CN|CS|CE|HO|HA|LN|LS|MO|NE|UE)[0-9]{3}$/', $bi)) {
            throw ValidationException::withMessages([
                'numero_bi' => 'Número do BI inválido. Ex: 001132566LA039.',
            ]);
        }
    }

    private function validarIdade(string $dataNascimento): void
    {
        $idade = Carbon::parse($dataNascimento)->age;

        if ($idade < 14 || $idade > 30) {
            throw ValidationException::withMessages([
                'data_nascimento' => 'A idade do aluno deve estar entre 14 e 30 anos.',
            ]);
        }
    }

    private function validarTelefone(string $telefone, string $campo = 'telefone'): void
    {
        $telefone = preg_replace('/\D+/', '', $telefone);

        if (!preg_match('/^9[1-9][0-9]{7}$/', $telefone)) {
            throw ValidationException::withMessages([
                $campo => 'Número inválido. Ex: 923456789.',
            ]);
        }

        if (preg_match('/^(.)\1{8}$/', $telefone)) {
            throw ValidationException::withMessages([
                $campo => 'Número inválido.',
            ]);
        }
    }

 private function gerarNumeroAluno(): string
{
    $escolaId = auth()->user()->escola_id;

    $ultimo = Estudante::where('escola_id', $escolaId)
        ->whereNotNull('numero_aluno')
        ->orderByDesc('id')
        ->value('numero_aluno');

    $ultimoNumero = (int) preg_replace('/\D+/', '', $ultimo ?? '');

    if ($ultimoNumero < 1534) {
        $ultimoNumero = 1533;
    }

    return (string) ($ultimoNumero + 1);
}
}