<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $table = 'materiais';

    protected $fillable = [
        'professor_id',
        'turma_id',
        'disciplina_id',
        'escola_id',
        'titulo',
        'tipo',
        'url',
        'ficheiro_path',
        'descricao',
    ];

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

    public function visualizacoes()
    {
        return $this->hasMany(MaterialVisualizacao::class);
    }
}