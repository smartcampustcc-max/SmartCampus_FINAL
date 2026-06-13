<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Disciplina;
use App\Models\Material;
use App\Models\SalaDeAula;

class Mensagemchat extends Model
{
    use HasFactory;

    protected $fillable = [
        'remetente_id',
        'turma_id',
         'material_id',
        'disciplina_id',
        'mensagem',
        'lida',
    ];

   public function remetente()
{
    return $this->belongsTo(User::class, 'remetente_id');
}

public function turma()
{
    return $this->belongsTo(SalaDeAula::class, 'turma_id');
}

public function disciplina()
{
    return $this->belongsTo(Disciplina::class, 'disciplina_id');
}

public function material()
{
    return $this->belongsTo(Material::class, 'material_id');
}
}