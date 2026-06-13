<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('escolas', function (Blueprint $table) {
            $table->dropColumn('codigo');
        });
    }

    public function down(): void
    {
        Schema::table('escolas', function (Blueprint $table) {
            $table->string('codigo')->nullable()->unique();
        });
    }
};