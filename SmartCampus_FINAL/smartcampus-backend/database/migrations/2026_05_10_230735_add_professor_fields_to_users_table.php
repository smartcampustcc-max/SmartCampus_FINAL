<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('bi')->nullable()->after('phone');
            $table->string('genero')->nullable()->after('bi');
            $table->string('morada')->nullable()->after('genero');

            $table->string('grau_academico')->nullable()->after('morada');
            $table->string('area_formacao')->nullable()->after('grau_academico');
            $table->date('data_admissao')->nullable()->after('area_formacao');

            $table->string('documento_bi')->nullable()->after('data_admissao');
            $table->string('documento_diploma')->nullable()->after('documento_bi');

            $table->string('status')->default('Ativo')->after('documento_diploma');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bi',
                'genero',
                'morada',
                'grau_academico',
                'area_formacao',
                'data_admissao',
                'documento_bi',
                'documento_diploma',
                'status',
            ]);
        });
    }
};