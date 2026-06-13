<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mensagemchats', function (Blueprint $table) {

            $table->foreignId('turma_id')
                ->nullable()
                ->after('destinatario_id')
                ->constrained('sala_de_aula')
                ->nullOnDelete();

        });
    }

    public function down(): void
    {
        Schema::table('mensagemchats', function (Blueprint $table) {

            $table->dropForeign(['turma_id']);
            $table->dropColumn('turma_id');

        });
    }
};