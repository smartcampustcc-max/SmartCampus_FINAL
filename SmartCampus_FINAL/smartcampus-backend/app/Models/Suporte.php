<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Suporte extends Model
{
    protected $fillable = [
        'escola_id',
        'user_id',
        'perfil',
        'categoria',
        'mensagem',
        'status',
        'resposta_admin',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function escola()
    {
        return $this->belongsTo(Escola::class);
    }
}