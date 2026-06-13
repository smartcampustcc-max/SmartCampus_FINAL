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
    Schema::create('disciplina_sala_de_aula', function (Blueprint $table) {
        $table->id();
        $table->foreignId('sala_de_aula_id')->constrained('salas_de_aula')->cascadeOnDelete();
        $table->foreignId('disciplina_id')->constrained('disciplinas')->cascadeOnDelete();
        $table->timestamps();

        $table->unique(['sala_de_aula_id', 'disciplina_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disciplina_sala_de_aula');
    }
};
