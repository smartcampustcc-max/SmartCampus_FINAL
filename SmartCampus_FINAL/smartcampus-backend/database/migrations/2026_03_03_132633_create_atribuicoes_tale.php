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
    Schema::create('atribuicoes', function (Blueprint $table) {
        $table->id();

        // professor é um user com role='professor'
        $table->foreignId('professor_id')->constrained('users')->cascadeOnDelete();

        // turma: ajusta a tabela conforme o teu projeto
        // Se tua tabela for "salas_de_aula", troca abaixo
        $table->foreignId('turma_id')->constrained('salas_de_aula')->cascadeOnDelete();

        // disciplina
        $table->foreignId('disciplina_id')->constrained('disciplinas')->cascadeOnDelete();

        $table->timestamps();

        // evita duplicar a mesma atribuição
        $table->unique(['professor_id', 'turma_id', 'disciplina_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atribuicoes');
    }
};
