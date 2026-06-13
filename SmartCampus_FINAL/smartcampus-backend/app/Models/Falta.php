<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Falta extends Model
{
    use HasFactory;

    protected $fillable = [
        'estudante_id',
        'professor_id',
        'turma_id',
        'disciplina_id',
        'escola_id',
        'data',
        'tempo_aula',
        'observacao',
         'justificada',
          'motivo_justificacao',
           'justificada_em',
    ];

    public function estudante()
    {
        return $this->belongsTo(Estudante::class);
    }

    public function professor()
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    public function turma()
    {
        return $this->belongsTo(SalaDeAula::class, 'turma_id');
    }

    public function disciplina()
    {
        return $this->belongsTo(Disciplina::class);
    }
}