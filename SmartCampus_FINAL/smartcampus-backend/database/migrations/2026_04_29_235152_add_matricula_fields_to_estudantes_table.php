<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
            if (!Schema::hasColumn('estudantes', 'classe')) {
                $table->string('classe', 50)->nullable()->after('curso_id');
            }

            if (!Schema::hasColumn('estudantes', 'turno_preferido')) {
                $table->string('turno_preferido', 50)->nullable()->after('classe');
            }

            if (!Schema::hasColumn('estudantes', 'status_matricula')) {
                $table->string('status_matricula', 50)->default('Ativo')->after('turno_preferido');
            }
        });
    }

    public function down(): void
    {
        Schema::table('estudantes', function (Blueprint $table) {
            if (Schema::hasColumn('estudantes', 'classe')) {
                $table->dropColumn('classe');
            }

            if (Schema::hasColumn('estudantes', 'turno_preferido')) {
                $table->dropColumn('turno_preferido');
            }

            if (Schema::hasColumn('estudantes', 'status_matricula')) {
                $table->dropColumn('status_matricula');
            }
        });
    }
};