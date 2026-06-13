<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materiais', function (Blueprint $table) {
            // Substituir o enum antigo pelo novo com mais tipos
            $table->dropColumn('tipo');
        });

        Schema::table('materiais', function (Blueprint $table) {
            $table->enum('tipo', ['PDF', 'Link', 'Imagem', 'Video', 'YouTube', 'Documento'])
                  ->after('titulo');
            // Para uploads locais — null se for URL/YouTube
            $table->string('ficheiro_path')->nullable()->after('url');
        });
    }

    public function down(): void
    {
        Schema::table('materiais', function (Blueprint $table) {
            $table->dropColumn('ficheiro_path');
            $table->dropColumn('tipo');
        });

        Schema::table('materiais', function (Blueprint $table) {
            $table->enum('tipo', ['PDF', 'Link', 'Imagem'])->after('titulo');
        });
    }
};