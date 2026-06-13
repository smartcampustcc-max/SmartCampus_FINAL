<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessorLembrete extends Model
{
    protected $table = 'professor_lembretes';

    protected $fillable = [
        'professor_id',
        'escola_id',
        'texto',
    ];
}