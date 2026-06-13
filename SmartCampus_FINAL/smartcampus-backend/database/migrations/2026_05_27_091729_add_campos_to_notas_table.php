<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    Schema::table('notas', function (Blueprint $table) {
        $table->unsignedBigInteger('estudante_id')->after('id');
        $table->unsignedBigInteger('professor_id')->after('estudante_id');
        $table->unsignedBigInteger('turma_id')->after('professor_id');
        $table->unsignedBigInteger('disciplina_id')->after('turma_id');
        $table->unsignedBigInteger('escola_id')->nullable()->after('disciplina_id');
        $table->string('trimestre')->after('escola_id');
        $table->string('tipo_avaliacao')->after('trimestre');
        $table->decimal('nota', 5, 2)->after('tipo_avaliacao');
        $table->text('observacao')->nullable()->after('nota');
    });
}

public function down(): void
{
    Schema::table('notas', function (Blueprint $table) {
        $table->dropColumn([
            'estudante_id',
            'professor_id',
            'turma_id',
            'disciplina_id',
            'escola_id',
            'trimestre',
            'tipo_avaliacao',
            'nota',
            'observacao',
        ]);
    });
}
};
