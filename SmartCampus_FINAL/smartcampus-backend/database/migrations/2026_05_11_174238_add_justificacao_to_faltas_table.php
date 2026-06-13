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
    Schema::table('faltas', function (Blueprint $table) {
        $table->boolean('justificada')->default(false);
        $table->text('motivo_justificacao')->nullable();
        $table->timestamp('justificada_em')->nullable();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faltas', function (Blueprint $table) {
            //
        });
    }
};
