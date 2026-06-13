<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

   protected $fillable = [
    'name',
    'email',
    'username',
    'password',
    'phone',
    'must_change_password',
    'role',
    'bi',
    'genero',
    'morada',
    'grau_academico',
    'area_formacao',
    'data_admissao',
    'documento_bi',
    'documento_diploma',
    'status',
    'escola_id',
];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function escola()
    {
        return $this->belongsTo(Escola::class, 'escola_id');
    }

    public function disciplinas()
{
    return $this->belongsToMany(
        \App\Models\Disciplina::class,
        'professor_disciplina',
        'user_id',
        'disciplina_id'
    )->withTimestamps();
}

}

