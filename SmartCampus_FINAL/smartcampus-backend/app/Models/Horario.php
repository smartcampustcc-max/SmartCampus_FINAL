<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\SaladeAula;
use App\Models\Disciplina;
use App\Models\User;

class Horario extends Model
{
    protected $table = 'horarios';
    protected $fillable = [
        'escola_id',
        'turma_id',
        'disciplina_id',
        'professor_id',
        'dia_semana',
        'hora_inicio',
        'hora_fim',
        'tempo',
        'sala',
    ];

    public function turma()
    {
        return $this->belongsTo(SalaDeAula::class, 'turma_id');
    }

    public function disciplina()
    {
        return $this->belongsTo(Disciplina::class, 'disciplina_id');
    }

    public function professor()
    {
        return $this->belongsTo(User::class, 'professor_id');
    }
}