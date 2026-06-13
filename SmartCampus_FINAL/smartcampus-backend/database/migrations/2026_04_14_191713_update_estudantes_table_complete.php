<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
            if (!Schema::hasColumn('estudantes', 'curso_id')) {
                $table->foreignId('curso_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('cursos')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('estudantes', 'nome_completo')) {
                $table->string('nome_completo')->after('numero_aluno');
            }

            if (!Schema::hasColumn('estudantes', 'sexo')) {
                $table->string('sexo', 20)->nullable()->after('nome_completo');
            }

            if (!Schema::hasColumn('estudantes', 'data_nascimento')) {
                $table->date('data_nascimento')->nullable()->after('sexo');
            }

            if (!Schema::hasColumn('estudantes', 'ano_letivo')) {
                $table->string('ano_letivo', 20)->nullable()->after('data_nascimento');
            }

            if (!Schema::hasColumn('estudantes', 'escola_id')) {
                $table->unsignedBigInteger('escola_id')->nullable()->after('ano_letivo');
            }

            if (!Schema::hasColumn('estudantes', 'telefone')) {
                $table->string('telefone', 20)->nullable()->after('escola_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
            if (Schema::hasColumn('estudantes', 'curso_id')) {
                $table->dropConstrainedForeignId('curso_id');
            }

            if (Schema::hasColumn('estudantes', 'telefone')) {
                $table->dropColumn('telefone');
            }

            if (Schema::hasColumn('estudantes', 'escola_id')) {
                $table->dropColumn('escola_id');
            }

            if (Schema::hasColumn('estudantes', 'ano_letivo')) {
                $table->dropColumn('ano_letivo');
            }

            if (Schema::hasColumn('estudantes', 'data_nascimento')) {
                $table->dropColumn('data_nascimento');
            }

            if (Schema::hasColumn('estudantes', 'sexo')) {
                $table->dropColumn('sexo');
            }

            if (Schema::hasColumn('estudantes', 'nome_completo')) {
                $table->dropColumn('nome_completo');
            }
        });
    }
};