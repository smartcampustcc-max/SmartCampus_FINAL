<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
            $table->integer('numero_turma')->nullable()->after('sala_de_aula_id');
        });
    }

    public function down(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
            $table->dropColumn('numero_turma');
        });
    }
};