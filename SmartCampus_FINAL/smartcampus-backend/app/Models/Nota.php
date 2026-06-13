<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nota extends Model
{
    protected $fillable = [
        'estudante_id',
        'professor_id',
        'turma_id',
        'disciplina_id',
        'escola_id',
        'trimestre',
        'tipo_avaliacao',
        'data_avaliacao',
        'nota',
        'observacao',
    ];

    public function estudante()
    {
        return $this->belongsTo(Estudante::class, 'estudante_id');
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
        return $this->belongsTo(Disciplina::class, 'disciplina_id');
    }
}