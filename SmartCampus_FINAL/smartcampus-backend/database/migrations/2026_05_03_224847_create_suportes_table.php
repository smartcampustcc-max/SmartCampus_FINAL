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
    Schema::create('suportes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('escola_id')->constrained('escolas')->cascadeOnDelete();
        $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

        $table->string('perfil'); // est ou prof
        $table->string('categoria');
        $table->text('mensagem');

        $table->string('status')->default('Aberto');
        $table->text('resposta_admin')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suportes');
    }
};
