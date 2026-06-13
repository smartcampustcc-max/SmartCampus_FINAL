<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Professor;
use App\Models\Estudante;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // =========================
        // ADMIN
        // =========================
        User::updateOrCreate(
            ['email' => 'admin@smartcampus.ao'],
            [
                'name' => 'Administrador',
                'username' => 'admin',
                'phone' => '900000000',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'must_change_password' => false,
            ]
        );

        // =========================
        // PROFESSOR
        // =========================
        $profUser = User::updateOrCreate(
            ['email' => 'professor@smartcampus.ao'],
            [
                'name' => 'Professor Demo',
                'username' => '10452', //numero de funcionario
                'phone' => '911111111',
                'password' => Hash::make('10452'), //senha inicial
                'role' => 'professor',
                'must_change_password' => true,
            ]
        );

        Professor::updateOrCreate(
            ['user_id' => $profUser->id],
            [
                'numero_professor' => '10452',
            ]
        );

        // =========================
        // ESTUDANTE
        // =========================
        $estUser = User::updateOrCreate(
            ['email' => 'aluno@smartcampus.ao'],
            [
                'name' => 'Aluno Demo',
                'username' => 'IG13A2526-1234',
                'phone' => '922222222',
                'password' => Hash::make('password'),
                'role' => 'estudante',
                'must_change_password' => false,
            ]
        );

        Estudante::updateOrCreate(
            ['user_id' => $estUser->id],
            [
                'numero_aluno' => '1234',
                'sala_de_aula_id' => null, // depois vocês ligam a turma
            ]
        );
    }
}
