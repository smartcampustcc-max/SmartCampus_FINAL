<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('disciplinas', function (Blueprint $table) {
            $table->foreignId('curso_id')->nullable()->constrained('cursos')->nullOnDelete();
            $table->integer('carga_horaria')->default(1);
            $table->string('status')->default('Ativa');
        });
    }

    public function down(): void
    {
        Schema::table('disciplinas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('curso_id');
            $table->dropColumn(['carga_horaria', 'status']);
        });
    }
};
