<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cities', function (Blueprint $table): void {
            $table->dropUnique(['country_id', 'slug']);
            $table->dropIndex(['slug']);
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('cities', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->unique(['country_id', 'slug']);
            $table->index('slug');
        });
    }
};
