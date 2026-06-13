<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\SalaDeAula;

class Curso extends Model
{
    protected $table = 'cursos';

    protected $fillable = [
        'nome',
        'codigo',
        'descricao',
        'duracao',
        'nivel_classe',
        'status',
        'escola_id',
    ];

    public function disciplinas()
    {
        return $this->belongsToMany(Disciplina::class, 'curso_disciplina')
            ->withTimestamps();
    }

    public function turmas()
    {
        return $this->hasMany(SalaDeAula::class, 'curso_id');
    }
}