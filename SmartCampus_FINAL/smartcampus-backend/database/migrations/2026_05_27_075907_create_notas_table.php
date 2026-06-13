<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up(): void
{
    Schema::create('notas', function (Blueprint $table) {
        $table->id();

        $table->unsignedBigInteger('estudante_id');
        $table->unsignedBigInteger('professor_id');
        $table->unsignedBigInteger('turma_id');
        $table->unsignedBigInteger('disciplina_id');

        $table->unsignedBigInteger('escola_id')->nullable();

        $table->string('trimestre');
        $table->string('tipo_avaliacao');

        $table->decimal('nota', 5, 2);

        $table->text('observacao')->nullable();

        $table->timestamps();
    });
}
};
