<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aviso extends Model
{
    protected $table = 'avisos';

    protected $fillable = [
        'escola_id',
        'criado_por',
        'titulo',
        'mensagem',
        'destino',
    ];

    public function autor()
    {
        return $this->belongsTo(User::class, 'criado_por');
    }
}