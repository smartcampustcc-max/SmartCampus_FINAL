<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salas_de_aula', function (Blueprint $table) {
            $table->string('letra', 1)->nullable()->after('classe');
        });
    }

    public function down(): void
    {
        Schema::table('salas_de_aula', function (Blueprint $table) {
            $table->dropColumn('letra');
        });
    }
};