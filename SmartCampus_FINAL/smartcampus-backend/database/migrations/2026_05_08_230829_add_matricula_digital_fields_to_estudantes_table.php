<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
            if (!Schema::hasColumn('estudantes', 'numero_bi')) {
                $table->string('numero_bi', 30)->nullable()->after('nome_completo');
            }

            if (!Schema::hasColumn('estudantes', 'naturalidade')) {
                $table->string('naturalidade')->nullable()->after('data_nascimento');
            }

            if (!Schema::hasColumn('estudantes', 'morada')) {
                $table->string('morada')->nullable()->after('naturalidade');
            }

            if (!Schema::hasColumn('estudantes', 'nome_pai')) {
                $table->string('nome_pai')->nullable()->after('morada');
            }

            if (!Schema::hasColumn('estudantes', 'nome_mae')) {
                $table->string('nome_mae')->nullable()->after('nome_pai');
            }

            if (!Schema::hasColumn('estudantes', 'contacto_encarregado')) {
                $table->string('contacto_encarregado', 20)->nullable()->after('nome_mae');
            }

            if (!Schema::hasColumn('estudantes', 'tipo_matricula')) {
                $table->string('tipo_matricula', 50)->default('Novo ingresso')->after('status_matricula');
            }

            if (!Schema::hasColumn('estudantes', 'documento_certificado')) {
                $table->string('documento_certificado')->nullable()->after('tipo_matricula');
            }

            if (!Schema::hasColumn('estudantes', 'documento_transferencia')) {
                $table->string('documento_transferencia')->nullable()->after('documento_certificado');
            }
        });
    }

    public function down(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
            $table->dropColumn([
                'numero_bi',
                'naturalidade',
                'morada',
                'nome_pai',
                'nome_mae',
                'contacto_encarregado',
                'tipo_matricula',
                'documento_certificado',
                'documento_transferencia',
            ]);
        });
    }
};