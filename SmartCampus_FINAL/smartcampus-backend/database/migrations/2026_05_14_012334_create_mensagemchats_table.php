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
    Schema::create('mensagemchats', function (Blueprint $table) {
        $table->id();

        $table->foreignId('remetente_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('destinatario_id')->constrained('users')->onDelete('cascade');

        $table->foreignId('disciplina_id')->nullable()->constrained()->nullOnDelete();

        $table->text('mensagem');

        $table->boolean('lida')->default(false);

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensagemchats');
    }
};
