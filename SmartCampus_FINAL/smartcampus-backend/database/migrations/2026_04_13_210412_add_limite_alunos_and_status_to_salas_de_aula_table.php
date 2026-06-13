<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
{
    Schema::table('salas_de_aula', function (Blueprint $table) {

        if (!Schema::hasColumn('salas_de_aula', 'limite_alunos')) {
            $table->unsignedInteger('limite_alunos')
                  ->default(15)
                  ->after('escola_id');
        }

        if (!Schema::hasColumn('salas_de_aula', 'status')) {
            $table->string('status')
                  ->default('Ativo')
                  ->after('limite_alunos');
        }

    });
}

    public function down(): void
{
    Schema::table('salas_de_aula', function (Blueprint $table) {

        if (Schema::hasColumn('salas_de_aula', 'status')) {
            $table->dropColumn('status');
        }

        if (Schema::hasColumn('salas_de_aula', 'limite_alunos')) {
            $table->dropColumn('limite_alunos');
        }

    });
}
};