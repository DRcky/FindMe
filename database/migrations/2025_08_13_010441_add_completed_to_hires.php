<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Agrega el nuevo valor 'completed' al ENUM
        DB::statement("ALTER TABLE hires MODIFY COLUMN status 
            ENUM('pending','accepted','rejected','cancelled','completed') NOT NULL DEFAULT 'pending'");

        Schema::table('hires', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable()->after('rejected_at');
            $table->index('status');
        });
    }

    public function down(): void
    {
        // Si haces rollback, quita 'completed' del enum (vuelve al original)
        DB::statement("ALTER TABLE hires MODIFY COLUMN status 
            ENUM('pending','accepted','rejected','cancelled') NOT NULL DEFAULT 'pending'");

        Schema::table('hires', function (Blueprint $table) {
            $table->dropColumn('completed_at');
            $table->dropIndex(['status']);
        });
    }
};
