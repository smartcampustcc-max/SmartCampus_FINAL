<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminAviso extends Model
{
    protected $table = 'admin_avisos';

    protected $fillable = [
        'escola_id',
        'admin_id',
        'titulo',
        'texto',
    ];
}