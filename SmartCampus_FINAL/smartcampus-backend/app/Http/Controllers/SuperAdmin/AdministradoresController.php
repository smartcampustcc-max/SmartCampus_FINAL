<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;

class AdministradoresController extends Controller
{
    public function index(): JsonResponse
    {
        $admins = User::with('escola')
            ->where('role', 'admin_escola')
            ->orderBy('name')
            ->get();

        return response()->json($admins);
    }

    public function reenviar(int $id, SmsService $sms): JsonResponse
    {
        $admin = User::with('escola')
            ->where('role', 'admin_escola')
            ->findOrFail($id);

        if (empty($admin->phone)) {
            return response()->json([
                'message' => 'O administrador não tem telefone registado.'
            ], 422);
        }

        $mensagem = "SmartCampus: Olá, {$admin->name}. "
            . "As suas credenciais de acesso estão associadas ao email {$admin->email}. "
            . "Caso tenha esquecido a senha, contacte o super administrador.";

        $sms->send($admin->phone, $mensagem);

        return response()->json([
            'message' => 'Credenciais reenviadas com sucesso.'
        ]);
    }
}