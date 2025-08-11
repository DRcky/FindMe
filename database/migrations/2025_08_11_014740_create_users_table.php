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
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Campos personalizados
            $table->string('first_name', 50);
            $table->string('last_name', 50)->nullable();
            $table->string('phone', 15)->nullable();

            // Relación con locations
            $table->foreignId('location_id')
                ->nullable()
                ->constrained('locations')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            // Campos estándar de Laravel Breeze
            $table->string('email', 100)->unique();
            $table->string('password');
            $table->rememberToken();

            // Timestamps estándar
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
