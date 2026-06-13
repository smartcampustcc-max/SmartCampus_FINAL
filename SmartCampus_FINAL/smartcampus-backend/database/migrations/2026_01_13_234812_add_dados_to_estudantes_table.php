<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
    $table->string('nome_completo')->nullable()->after('id');
    $table->string('sexo', 1)->nullable()->after('nome_completo');
    $table->date('data_nascimento')->nullable()->after('sexo');
    $table->string('contacto_encarregado')->nullable()->after('data_nascimento');
    $table->string('observacoes')->nullable()->after('contacto_encarregado');
    $table->string('ano_letivo')->nullable()->after('observacoes');
    $table->string('curso')->nullable()->after('ano_letivo');
});

    }

    public function down(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
            $table->dropColumn([
                'nome_completo',
                'sexo',
                'data_nascimento',
                'contacto_encarregado',
                'observacoes',
                'ano_letivo',
                'curso',
            ]);
        });
    }
};
