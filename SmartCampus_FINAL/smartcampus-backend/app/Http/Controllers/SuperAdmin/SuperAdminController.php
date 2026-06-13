<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdministradoresController extends Controller
{
    public function index()
    {
        return User::where('role', 'admin_escola')
            ->with('escola:id,nome')
            ->select('id', 'name', 'email', 'escola_id')
            ->orderByDesc('id')
            ->get();
    }

    public function reenviar($id)
    {
        $user = User::where('role', 'admin_escola')->findOrFail($id);

        $senha = Str::upper(Str::random(8));

        $user->update([
            'password' => Hash::make($senha),
            'must_change_password' => true,
        ]);

        
        
        return response()->json([
            'message' => 'Credenciais redefinidas com sucesso.',
            'senha_temp' => $senha
        ]);
    }
}