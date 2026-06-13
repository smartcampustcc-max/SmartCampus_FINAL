<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessorEvento extends Model
{
    protected $table = 'professor_eventos';

    protected $fillable = [
        'professor_id',
        'escola_id',
        'turma_id',
        'disciplina_id',
        'titulo',
        'tipo',
        'data',
        'hora_inicio',
        'hora_fim',
        'descricao',
    ];

    public function turma()
    {
        return $this->belongsTo(SalaDeAula::class, 'turma_id');
    }

    public function disciplina()
    {
        return $this->belongsTo(Disciplina::class, 'disciplina_id');
    }
}