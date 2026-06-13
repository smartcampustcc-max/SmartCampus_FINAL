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
    Schema::table('mensagemchats', function (Blueprint $table) {
        if (Schema::hasColumn('mensagemchats', 'destinatario_id')) {
            $table->dropForeign(['destinatario_id']);
            $table->dropColumn('destinatario_id');
        }

        $table->foreignId('turma_id')->after('remetente_id')->constrained('salas_de_aula')->onDelete('cascade');
        $table->foreignId('material_id')->nullable()->after('disciplina_id')->constrained('materiais')->nullOnDelete();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
