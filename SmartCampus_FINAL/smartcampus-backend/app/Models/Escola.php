<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Escola extends Model
{
    protected $table = 'escolas';

    protected $fillable = [
        'nome',
        'email',
        'telefone',
        'localizacao',
        'logo',
        'admin_nome',
        'admin_email',
        'status',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'escola_id');
    }
}