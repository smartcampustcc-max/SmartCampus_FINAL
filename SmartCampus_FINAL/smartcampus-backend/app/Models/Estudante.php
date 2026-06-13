<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estudante extends Model
{
    protected $table = 'estudantes';

   protected $fillable = [
    'user_id',
    'curso_id',
    'sala_de_aula_id',
    'numero_aluno',
    'nome_completo',
    'sexo',
    'data_nascimento',
    'ano_letivo',
    'classe',
    'numero_turma',
    'turno_preferido',
    'status_matricula',
    'escola_id',
    'telefone',
    'numero_bi',
'naturalidade',
'morada',
'nome_pai',
'nome_mae',
'contacto_encarregado',
'tipo_matricula',
'documento_certificado',
'documento_transferencia',
];

    public function turma()
    {
        return $this->belongsTo(\App\Models\SalaDeAula::class, 'sala_de_aula_id');
    }

    public function curso()
    {
        return $this->belongsTo(\App\Models\Curso::class, 'curso_id');
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}