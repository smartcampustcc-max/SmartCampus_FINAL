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
        Schema::create('tarefas_do_professor', function (Blueprint $table) {
    $table->id();

    $table->foreignId('professor_id')
        ->constrained('professores')
        ->cascadeOnDelete();

    $table->foreignId('disciplina_id')
        ->constrained('disciplinas')
        ->cascadeOnDelete();

    $table->foreignId('sala_de_aula_id')
        ->constrained('salas_de_aula')
        ->cascadeOnDelete();

    $table->unique(['professor_id', 'disciplina_id', 'sala_de_aula_id'],'uq_tarefas_do_professor'
    );
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tarefas_do_professors');
    }
};
