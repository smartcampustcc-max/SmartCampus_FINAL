<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Curso;

class CursoSeeder extends Seeder
{
    public function run(): void
    {
             $cursos = [
            ['nome' => 'Técnico de Gestão de Sistemas Informáticos', 'sigla' => 'IG'],
            ['nome' => 'Técnico de Informática', 'sigla' => 'II'],
            ['nome' => 'Química Industrial', 'sigla' => 'QI'],
          
        ];

        foreach ($cursos as $c) {
            Curso::updateOrCreate(
                ['sigla' => $c['sigla']],
                ['nome' => $c['nome']]
            );
        }
    }
}
