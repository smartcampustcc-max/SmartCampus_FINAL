<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Disciplina extends Model
{
    protected $table = 'disciplinas';

    protected $fillable = [
        'nome',
        'codigo',
        'curso_id',
        'carga_horaria',
        'escola_id',
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }
    public function cursos()
{
    return $this->belongsToMany(Curso::class, 'curso_disciplina')
        ->withTimestamps();
}
    public function professores()
{
    return $this->belongsToMany(User::class, 'professor_disciplina', 'disciplina_id', 'user_id')
                ->withTimestamps();
}

public function turmas()
{
    return $this->belongsToMany(
        SalaDeAula::class,
        'disciplina_sala_de_aula',
        'disciplina_id',
        'sala_de_aula_id'
    )->withTimestamps();
}
}