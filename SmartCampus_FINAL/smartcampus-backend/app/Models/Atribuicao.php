<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Atribuicao extends Model
{
    protected $table = 'atribuicoes';
    protected $fillable = [
        'professor_id',
        'turma_id',
        'disciplina_id',
        'escola_id',
    ];

    // Relação com Professor (User com role professor)
    public function professor()
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    // Relação com Turma
    public function turma()
    {
        return $this->belongsTo(SalaDeAula::class, 'turma_id');
    }

    // Relação com Disciplina
    public function disciplina()
    {
        return $this->belongsTo(Disciplina::class, 'disciplina_id');
    }
}