<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\SmsService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $login = $request->input('login');
        $password = $request->input('password');

        $user = User::with('escola')
            ->where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Login ou password inválidos.'],
            ]);
        }

        $user->tokens()->delete();

        $token = $user->createToken('smartcampus')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user),
            'must_change_password' => (bool) $user->must_change_password,
            'role' => $user->role,
        ]);
    }

    public function setPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'token', 'password', 'password_confirmation'),
            function ($user) use ($request) {
                $user->password = Hash::make($request->password);
                $user->must_change_password = false;
                $user->save();
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 422);
        }

        return response()->json(['message' => 'Senha definida com sucesso. Faça login.']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('escola');

        return response()->json([
            'user' => $this->formatUser($user)
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout feito com sucesso.'
        ]);
    }

    public function firstChangePassword(Request $request)
{
    $request->validate([
        'new_password' => ['required', 'string', 'min:6', 'confirmed'],
    ]);

    $user = $request->user();

    $user->password = \Illuminate\Support\Facades\Hash::make($request->new_password);
    $user->must_change_password = false;
    $user->save();

    return response()->json([
        'message' => 'Password alterada com sucesso.'
    ]);
}

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password atual incorreta.'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->must_change_password = false;
        $user->save();

        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password alterada com sucesso. Faça login novamente.'
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'phone' => $user->phone,
            'role' => $user->role,
            'bi' => $user->bi,
            'must_change_password' => (bool) $user->must_change_password,
            'escola_id' => $user->escola_id,
            'escola' => $user->escola ? [
                'id' => $user->escola->id,
                'nome' => $user->escola->nome,
                'email' => $user->escola->email,
                'telefone' => $user->escola->telefone,
                'localizacao' => $user->escola->localizacao,
                'logo' => $user->escola->logo,
                'status' => $user->escola->status,
            ] : null,
        ];
    }

    public function recuperarPassword(Request $request)
{
    $request->validate([
        'telefone' => ['required', 'string'],
    ]);

    $telefone = preg_replace('/\D+/', '', $request->telefone);

    $user = User::where('phone', $telefone)
        ->whereIn('role', ['estudante', 'professor'])
        ->first();

    if (!$user) {
        return response()->json([
            'message' => 'Nenhuma conta encontrada com este número.'
        ], 404);
    }

    $novaSenha = Str::random(8);

    $user->update([
    'password' => Hash::make($novaSenha),
    'must_change_password' => false,
]);

$enviado = app(SmsService::class)->send(
    $telefone,
    "SmartCampus: A sua nova senha é {$novaSenha}. " .
    "Utilizador: {$user->username}. " .
    "Pode alterar a sua senha no sistema se desejar."
);

if (!$enviado) {
    return response()->json([
        'message' => 'Conta encontrada mas falha ao enviar SMS.'
    ], 500);
}

return response()->json([
    'message' => 'Nova senha enviada por SMS com sucesso.'
]);
}
}