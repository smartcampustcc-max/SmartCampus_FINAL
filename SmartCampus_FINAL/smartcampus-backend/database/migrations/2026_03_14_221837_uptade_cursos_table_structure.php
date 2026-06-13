<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cursos', function (Blueprint $table) {

            if (!Schema::hasColumn('cursos', 'codigo')) {
                $table->string('codigo')->nullable()->after('nome');
            }

            if (!Schema::hasColumn('cursos', 'descricao')) {
                $table->text('descricao')->nullable()->after('codigo');
            }

            if (!Schema::hasColumn('cursos', 'duracao')) {
                $table->string('duracao')->nullable()->after('descricao');
            }

            if (!Schema::hasColumn('cursos', 'nivel_classe')) {
                $table->string('nivel_classe')->nullable()->after('duracao');
            }

            if (!Schema::hasColumn('cursos', 'status')) {
                $table->string('status')->default('Ativo')->after('nivel_classe');
            }
        });
    }

    public function down(): void
    {
        // opcional
    }
};