<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
            Schema::table('salas_de_aula', function (Blueprint $table) {
        $table->foreignId('curso_id')
            ->nullable()
            ->constrained('cursos')
            ->nullOnDelete()
            ->after('id');

        $table->string('ano_letivo')->nullable()->after('turno'); // 2025/2026
        $table->string('codigo_turma')->nullable()->unique()->after('ano_letivo'); // IG12A2526
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salas_de_aula', function (Blueprint $table) {
        $table->dropForeign(['curso_id']);
        $table->dropColumn(['curso_id','ano_letivo','codigo_turma']);
        });
    }
};
