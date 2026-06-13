<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
{
    Schema::table('horarios', function (Blueprint $table) {
        $table->unsignedBigInteger('escola_id')->nullable()->after('id');
    });
}

public function down(): void
{
    Schema::table('horarios', function (Blueprint $table) {
        $table->dropColumn('escola_id');
    });
}
};
