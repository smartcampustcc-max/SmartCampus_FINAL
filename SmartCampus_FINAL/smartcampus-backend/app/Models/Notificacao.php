<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Notificacao extends Model
{
    protected $table = 'notificacoes';
    
    protected $fillable = [
        'user_id',
        'titulo',
        'mensagem',
        'lida',
        'tipo',
        'link',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
}
}