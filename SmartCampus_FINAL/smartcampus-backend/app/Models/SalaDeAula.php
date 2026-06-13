<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaDeAula extends Model
{
    protected $table = 'salas_de_aula';

    protected $fillable = [
        'curso_id',
        'nome',
        'classe',
        'letra',
        'turno',
        'ano_letivo',
        'codigo_turma',
        'escola_id',
        'limite_alunos',
        'status'
    ];

    protected $attributes = [
        'limite_alunos' => 15,
        'status' => 'Ativo'
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'curso_id');
    }

    public function estudantes()
    {
        return $this->hasMany(Estudante::class, 'sala_de_aula_id');
    }

    public function alunos()
{
    return $this->hasMany(Estudante::class, 'sala_de_aula_id')
                ->with('user:id,name,email,phone');
}

    public function escola()
    {
        return $this->belongsTo(Escola::class, 'escola_id');
    }

    public function getTotalAlunosAttribute()
    {
        return $this->estudantes()->count();
    }

    public function getVagasDisponiveisAttribute()
    {
        return max(0, ($this->limite_alunos ?? 15) - $this->estudantes()->count());
    }
    public function disciplinas()
{
    return $this->belongsToMany(
        Disciplina::class,
        'disciplina_sala_de_aula',
        'sala_de_aula_id',
        'disciplina_id'
    )->withTimestamps();
}
}