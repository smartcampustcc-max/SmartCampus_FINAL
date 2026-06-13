<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_visualizacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')
                  ->constrained('materiais')
                  ->cascadeOnDelete();
            $table->foreignId('aluno_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->timestamp('opened_at')->useCurrent();
            // Garante que o mesmo aluno só regista uma vez por material
            $table->unique(['material_id', 'aluno_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_visualizacoes');
    }
};