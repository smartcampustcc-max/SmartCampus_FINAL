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
    Schema::create('faltas', function (Blueprint $table) {
        $table->id();

        $table->foreignId('estudante_id')->constrained('estudantes')->cascadeOnDelete();
        $table->foreignId('professor_id')->constrained('users')->cascadeOnDelete();
        $table->foreignId('turma_id')->constrained('salas_de_aula')->cascadeOnDelete();
        $table->foreignId('disciplina_id')->constrained('disciplinas')->cascadeOnDelete();
        $table->foreignId('escola_id')->constrained('escolas')->cascadeOnDelete();

        $table->date('data');
        $table->string('tempo_aula')->nullable(); // Ex: 1º tempo, 2º tempo
        $table->text('observacao')->nullable();

        $table->timestamps();

        $table->unique([
            'estudante_id',
            'turma_id',
            'disciplina_id',
            'data',
            'tempo_aula'
        ], 'faltas_unicas_por_tempo');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faltas');
    }
};
