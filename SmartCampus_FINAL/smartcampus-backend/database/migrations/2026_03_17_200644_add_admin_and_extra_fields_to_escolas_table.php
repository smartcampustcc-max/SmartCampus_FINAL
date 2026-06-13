<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('escolas', function (Blueprint $table) {
            $table->string('localizacao')->nullable()->after('telefone');
            $table->string('logo')->nullable()->after('localizacao');
            $table->string('admin_nome')->nullable()->after('logo');
            $table->string('admin_email')->nullable()->after('admin_nome');
        });
    }

    public function down(): void
    {
        Schema::table('escolas', function (Blueprint $table) {
            $table->dropColumn([
                'localizacao',
                'logo',
                'admin_nome',
                'admin_email',
            ]);
        });
    }
};