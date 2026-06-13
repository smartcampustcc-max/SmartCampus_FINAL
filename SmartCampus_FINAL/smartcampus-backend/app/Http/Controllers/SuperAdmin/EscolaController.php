<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Mail\CredenciaisEscolaMail;
use App\Models\Escola;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EscolaController extends Controller
{
    public function index()
    {
        return Escola::orderBy('nome')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255', 'unique:escolas,nome'],
            'email' => ['nullable', 'email', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'localizacao' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'string'],
            'admin_nome' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255'],
            'status' => ['required', 'in:Ativo,Inativo'],
        ]);

        $emailJaExiste = User::where('email', $data['admin_email'])->exists();

        if ($emailJaExiste) {
            return response()->json([
                'message' => 'Já existe um utilizador com este email.',
                'errors' => [
                    'admin_email' => ['Já existe um utilizador com este email.']
                ]
            ], 422);
        }

        $escola = Escola::create($data);

        return response()->json([
            'message' => 'Escola criada com sucesso.',
            'escola' => $escola,
        ], 201);
    }

    public function show($id)
    {
        return Escola::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $escola = Escola::findOrFail($id);

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255', "unique:escolas,nome,$id"],
            'email' => ['nullable', 'email', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'localizacao' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'string'],
            'admin_nome' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255'],
            'status' => ['required', 'in:Ativo,Inativo'],
        ]);

        $adminAtual = User::where('escola_id', $escola->id)
            ->where('role', 'admin_escola')
            ->first();

        $emailEmOutroUtilizador = User::where('email', $data['admin_email'])
            ->when($adminAtual, function ($query) use ($adminAtual) {
                $query->where('id', '!=', $adminAtual->id);
            })
            ->exists();

        if ($emailEmOutroUtilizador) {
            return response()->json([
                'message' => 'Este email já está a ser usado por outro utilizador.',
                'errors' => [
                    'admin_email' => ['Este email já está a ser usado por outro utilizador.']
                ]
            ], 422);
        }

        $escola->update($data);

        if ($adminAtual) {
            $adminAtual->update([
                'name' => $data['admin_nome'],
                'email' => $data['admin_email'],
            ]);
        }

        return response()->json([
            'message' => 'Escola atualizada com sucesso.',
            'escola' => $escola,
        ]);
    }

    public function destroy($id)
    {
        $escola = Escola::findOrFail($id);

        $admin = User::where('escola_id', $escola->id)
            ->where('role', 'admin_escola')
            ->first();

        if ($admin) {
            $admin->delete();
        }

        $escola->delete();

        return response()->json([
            'message' => 'Escola apagada com sucesso.',
        ]);
    }

    public function enviarCredenciais($id)
{
    $escola = Escola::findOrFail($id);

    if (!$escola->admin_email) {
        return response()->json([
            'message' => 'A escola não possui email do administrador.'
        ], 422);
    }

    if (!$escola->admin_nome) {
        return response()->json([
            'message' => 'A escola não possui nome do administrador.'
        ], 422);
    }

    $adminExistenteDaEscola = User::where('escola_id', $escola->id)
        ->where('role', 'admin_escola')
        ->first();

    // BLOQUEAR 2 admins na mesma escola
    if ($adminExistenteDaEscola && $adminExistenteDaEscola->email !== $escola->admin_email) {
        return response()->json([
            'message' => 'Esta escola já tem um administrador. Edita a escola para alterar o email do administrador.'
        ], 422);
    }

    $userComMesmoEmailNoutraEscola = User::where('email', $escola->admin_email)
        ->when($adminExistenteDaEscola, function ($query) use ($adminExistenteDaEscola) {
            $query->where('id', '!=', $adminExistenteDaEscola->id);
        })
        ->first();

    if ($userComMesmoEmailNoutraEscola) {
        return response()->json([
            'message' => 'Este email já pertence a outro utilizador.'
        ], 422);
    }

    $senhaTemporaria = Str::upper(Str::random(8));

    if ($adminExistenteDaEscola) {
        $adminExistenteDaEscola->update([
            'name' => $escola->admin_nome,
            'email' => $escola->admin_email,
            'password' => Hash::make($senhaTemporaria),
        ]);
        $user = $adminExistenteDaEscola;
    } else {
        $user = User::create([
            'name' => $escola->admin_nome,
            'email' => $escola->admin_email,
            'password' => Hash::make($senhaTemporaria),
            'role' => 'admin_escola',
            'escola_id' => $escola->id,
            'must_change_password' => true,
        ]);
    }

    $dados = [
        'admin_nome' => $escola->admin_nome,
        'escola_nome' => $escola->nome,
        'email' => $escola->admin_email,
        'senha' => $senhaTemporaria,
        'link' => env('FRONTEND_URL', 'http://localhost:3000') . '/login',
    ];

    Mail::to($escola->admin_email)->send(new CredenciaisEscolaMail($dados));

    return response()->json([
        'message' => 'Credenciais enviadas com sucesso para o email do administrador.',
        'user_id' => $user->id,
    ]);
}
    public function estatisticas()
{
    $totalEscolas = \App\Models\Escola::count();
    $totalAdmins = \App\Models\User::where('role', 'admin_escola')->count();
    $totalProfessores = \App\Models\User::where('role', 'professor')->count();
    $totalAlunos = \App\Models\User::where('role', 'estudante')->count();

    return response()->json([
        'escolas' => $totalEscolas,
        'admins' => $totalAdmins,
        'professores' => $totalProfessores,
        'alunos' => $totalAlunos,
    ]);
}

public function enviarAvisoGeral(Request $request)
{
    $request->validate([
        'mensagem' => ['required', 'string', 'min:10'],
    ]);

    $admins = User::where('role', 'admin_escola')->get();

    foreach ($admins as $admin) {
        try {
            Mail::to($admin->email)->send(
                new \App\Mail\AvisoGeralMail([
                    'nome' => $admin->name,
                    'mensagem' => $request->mensagem,
                ])
            );
        } catch (\Throwable $e) {}
    }

    return response()->json([
        'message' => 'Aviso enviado a ' . $admins->count() . ' administradores.'
    ]);
}

}