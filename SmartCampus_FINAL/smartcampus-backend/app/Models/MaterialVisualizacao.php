<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaterialVisualizacao extends Model
{
    protected $table = 'material_visualizacoes';

    protected $fillable = [
        'material_id',
        'aluno_id',
        'opened_at',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
    ];

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function aluno()
    {
        return $this->belongsTo(User::class, 'aluno_id');
    }
}