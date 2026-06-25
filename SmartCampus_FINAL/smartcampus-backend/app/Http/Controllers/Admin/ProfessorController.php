<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Mail\CredenciaisProfessorMail;
use App\Models\Disciplina;
use App\Models\Escola;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
class ProfessorController extends Controller
{
    public function index()
    {
        $escolaId = auth()->user()->escola_id;
        return User::where('role', 'professor')
            ->where('escola_id', $escolaId)
            ->with('disciplinas:id,nome')
            ->select(
                'id',
                'name',
                'email',
                'username',
                'phone',
                'role',
                'must_change_password',
                'created_at',
                'escola_id',
                'bi',
                'genero',
                'morada',
                'grau_academico',
                'area_formacao',
                'data_admissao',
                'documento_bi',
                'documento_diploma',
                'status'
            )
            ->orderByDesc('id')
            ->get();
    }
    public function store(Request $request)
    {
        $escolaId = auth()->user()->escola_id;
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[\pL\s\'\-]+$/u'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'regex:/^9[1-9][0-9]{7}$/', 'unique:users,phone'],
            'bi' => ['required', 'string', 'max:30', 'unique:users,bi'],
            'genero' => ['required', 'in:Masculino,Feminino'],
            'morada' => ['required', 'string', 'max:255'],
            'grau_academico' => ['required', 'string', 'max:100'],
            'area_formacao' => ['required', 'string', 'max:150'],
            'data_admissao' => ['required', 'date','after_or_equal:2014-01-01','before_or_equal:today'],
            'documento_bi' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'documento_diploma' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'disciplinas' => ['required', 'array', 'min:1', 'max:2'],
            'disciplinas.*' => ['integer', 'exists:disciplinas,id'],
            'username' => ['nullable', 'string', 'max:50', 'unique:users,username'],
            'password' => ['nullable', 'string', 'min:6'],
            'status' => ['nullable', 'in:Ativo,Inativo'],
        ], [
            'name.regex' => 'O nome só pode conter letras, espaços, hífen e apóstrofo.',
            'phone.regex' => 'Número inválido. Use um número angolano válido com 9 dígitos.',
            'disciplinas.required' => 'Selecciona pelo menos uma disciplina.',
            'disciplinas.min' => 'Selecciona pelo menos uma disciplina.',
            'disciplinas.max' => 'Um professor pode ter no máximo 2 disciplinas.',
                   'phone.unique' => 'O número de telefone já está cadastrado.',
            'email.unique' => 'O email já está cadastrado.',
            'bi.unique' => 'O número do BI já está cadastrado.',
            'data_admissao.after_or_equal' => 'A data de admissão deve ser a partir de 01/01/2014.',
            'data_admissao.before_or_equal' => 'A data de admissão não pode ser futura.',
        ]);
        $this->validarNome($data['name']);
        $this->validarTelefone($data['phone']);
        $disciplinasValidas = Disciplina::where('escola_id', $escolaId)
            ->whereIn('id', $data['disciplinas'])
            ->pluck('id');
        if ($disciplinasValidas->count() !== count($data['disciplinas'])) {
            return response()->json([
                'message' => 'Há disciplinas inválidas para esta escola.'
            ], 422);
        }
        if ($request->hasFile('documento_bi')) {
            $data['documento_bi'] = $request
                ->file('documento_bi')
                ->store('documentos/professores/bi', 'public');
        }
        if ($request->hasFile('documento_diploma')) {
            $data['documento_diploma'] = $request
                ->file('documento_diploma')
                ->store('documentos/professores/diplomas', 'public');
        }
        if (empty($data['username'])) {
            do {
                $data['username'] = (string) random_int(10000, 99999);
            } while (User::where('username', $data['username'])->exists());
        }
        $plainPassword = $data['password'] ?? Str::upper(Str::random(8));
        $user = User::create([
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'phone' => trim($data['phone']),
            'username' => trim($data['username']),
            'password' => Hash::make($plainPassword),
            'role' => 'professor',
            'must_change_password' => true,
            'escola_id' => $escolaId,
            'bi' => strtoupper(trim($data['bi'])),
            'genero' => $data['genero'],
            'morada' => trim($data['morada']),
            'grau_academico' => trim($data['grau_academico']),
            'area_formacao' => trim($data['area_formacao']),
            'data_admissao' => $data['data_admissao'],
            'documento_bi' => $data['documento_bi'] ?? null,
            'documento_diploma' => $data['documento_diploma'] ?? null,
            'status' => $data['status'] ?? 'Ativo',
        ]);
        $user->disciplinas()->attach(
            collect($data['disciplinas'])->mapWithKeys(fn ($id) => [
                $id => ['escola_id' => $escolaId]
            ])->toArray()
        );
        return response()->json([
            'message' => 'Professor criado com sucesso. Use o botão Enviar para enviar as credenciais.',
            'user' => $user->load('disciplinas:id,nome'),
        ], 201);
    }
    public function update(Request $request, $id)
    {
        $escolaId = auth()->user()->escola_id;
        $user = User::where('role', 'professor')
            ->where('escola_id', $escolaId)
            ->findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[\pL\s\'\-]+$/u'],
            'email' => ['sometimes', 'required', 'email', 'max:255', "unique:users,email,$id"],
            'phone' => ['sometimes', 'required', 'regex:/^9[1-9][0-9]{7}$/', "unique:users,phone,$id"],
            'bi' => ['sometimes', 'required', 'string', 'max:30', "unique:users,bi,$id"],
            'genero' => ['sometimes', 'required', 'in:Masculino,Feminino'],
            'morada' => ['sometimes', 'required', 'string', 'max:255'],
            'grau_academico' => ['sometimes', 'required', 'string', 'max:100'],
            'area_formacao' => ['sometimes', 'required', 'string', 'max:150'],
            'data_admissao' => ['sometimes', 'required', 'date'],
            'documento_bi' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'documento_diploma' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'disciplinas' => ['sometimes', 'array', 'min:1', 'max:2'],
            'disciplinas.*' => ['integer', 'exists:disciplinas,id'],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', "unique:users,username,$id"],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'status' => ['sometimes', 'nullable', 'in:Ativo,Inativo'],
        ], [
            'name.regex' => 'O nome só pode conter letras, espaços, hífen e apóstrofo.',
            'phone.regex' => 'Número inválido. Use um número angolano válido com 9 dígitos.',
            'disciplinas.min' => 'Selecciona pelo menos uma disciplina.',
            'disciplinas.max' => 'Um professor pode ter no máximo 2 disciplinas.',
        ]);
        if (isset($data['name'])) {
            $this->validarNome($data['name']);
            $data['name'] = trim($data['name']);
        }
        if (isset($data['phone'])) {
            $this->validarTelefone($data['phone']);
            $data['phone'] = trim($data['phone']);
        }
        if (isset($data['bi'])) {
            $data['bi'] = strtoupper(trim($data['bi']));
        }
        if (isset($data['email'])) {
            $data['email'] = trim($data['email']);
        }
        if (isset($data['morada'])) {
            $data['morada'] = trim($data['morada']);
        }
        if (isset($data['grau_academico'])) {
            $data['grau_academico'] = trim($data['grau_academico']);
        }
        if (isset($data['area_formacao'])) {
            $data['area_formacao'] = trim($data['area_formacao']);
        }
        if (isset($data['username'])) {
            $data['username'] = trim($data['username']);
        }
        if (isset($data['disciplinas'])) {
            $disciplinasValidas = Disciplina::where('escola_id', $escolaId)
                ->whereIn('id', $data['disciplinas'])
                ->pluck('id');
            if ($disciplinasValidas->count() !== count($data['disciplinas'])) {
                return response()->json([
                    'message' => 'Há disciplinas inválidas para esta escola.'
                ], 422);
            }
            $user->disciplinas()->sync(
                collect($data['disciplinas'])->mapWithKeys(fn ($id) => [
                    $id => ['escola_id' => $escolaId]
                ])->toArray()
            );
            unset($data['disciplinas']);
        }
        if ($request->hasFile('documento_bi')) {
            $data['documento_bi'] = $request
                ->file('documento_bi')
                ->store('documentos/professores/bi', 'public');
        } else {
            unset($data['documento_bi']);
        }
        if ($request->hasFile('documento_diploma')) {
            $data['documento_diploma'] = $request
                ->file('documento_diploma')
                ->store('documentos/professores/diplomas', 'public');
        } else {
            unset($data['documento_diploma']);
        }
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
            $data['must_change_password'] = true;
        } else {
            unset($data['password']);
        }
        $user->update($data);
        return response()->json([
            'message' => 'Professor actualizado.',
            'user' => $user->load('disciplinas:id,nome'),
        ]);
    }
    public function destroy($id)
    {
        $escolaId = auth()->user()->escola_id;
        $user = User::where('role', 'professor')
            ->where('escola_id', $escolaId)
            ->findOrFail($id);
        $user->disciplinas()->detach();
        $user->delete();
        return response()->json([
            'message' => 'Professor apagado.'
        ]);
    }
    public function enviarCredenciais($id)
    {
        $escolaId = auth()->user()->escola_id;
        $user = User::where('role', 'professor')
            ->where('escola_id', $escolaId)
            ->findOrFail($id);
        $senhaTemporaria = Str::upper(Str::random(8));
        $user->update([
            'password' => Hash::make($senhaTemporaria),
            'must_change_password' => true,
        ]);
        $smsMessage =
            "SmartCampus: Novas credenciais.\n" .
            "Utilizador: {$user->username}\n" .
            "Senha: {$senhaTemporaria}\n" .
            "Altere a senha sempre que desejar.";
        $smsSent = false;
        $emailSent = false;
        try {
            $smsSent = app(SmsService::class)->send($user->phone, $smsMessage);
        } catch (\Throwable $e) {
            $smsSent = false;
        }
        try {
            $escola = Escola::find($escolaId);
            Mail::to($user->email)->send(new CredenciaisProfessorMail([
                'nome' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'senha' => $senhaTemporaria,
                'escola_nome' => $escola?->nome ?? 'SmartCampus',
                'link' => env('FRONTEND_URL', 'http://localhost:3000') . '/login',
            ]));
            $emailSent = true;
        } catch (\Throwable $e) {
            $emailSent = false;
        }
        return response()->json([
            'message' => $smsSent || $emailSent
                ? 'Credenciais enviadas com sucesso.'
                : 'Credenciais geradas, mas não foi possível enviar SMS ou email.',
            'sms_sent' => $smsSent,
            'email_sent' => $emailSent,
        ]);
    }
    private function validarNome(string $nome): void
    {
        $nome = trim($nome);
        $partes = preg_split('/\s+/', $nome);
        if (count(array_filter($partes)) < 2) {
            abort(response()->json([
                'errors' => [
                    'name' => ['Informe pelo menos nome e apelido.']
                ]
            ], 422));
        }
        foreach ($partes as $parte) {
            if (mb_strlen($parte) < 2) {
                abort(response()->json([
                    'errors' => [
                        'name' => ['Cada nome deve ter pelo menos 2 letras.']
                    ]
                ], 422));
            }
        }
        if (preg_match('/(.)\\1{3,}/u', $nome)) {
            abort(response()->json([
                'errors' => [
                    'name' => ['Nome inválido.']
                ]
            ], 422));
        }
    }
    private function validarTelefone(string $telefone): void
    {
        if (preg_match('/(.)\\1{8}/', $telefone)) {
            abort(response()->json([
                'errors' => [
                    'phone' => ['Número inválido.']
                ]
            ], 422));
        }
    }
}