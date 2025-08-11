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

            // Datos personales
            $table->string('first_name', 50);
            $table->string('last_name', 50)->nullable();
            $table->string('phone', 20)->nullable(); // pon unique() si lo quieres único

            // Autenticación
            $table->string('email', 100)->unique();
            $table->string('password');
            $table->rememberToken();

            // Ubicación exacta (inline)
            $table->string('country', 100)->nullable();
            $table->string('province', 100)->nullable();   // estado/provincia
            $table->string('city', 120)->nullable();

            // Coordenadas precisas (≈10 cm con 7 decimales)
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('accuracy_m', 8, 2)->nullable(); // precisión reportada por el GPS
            $table->timestamp('last_seen_at')->nullable();

            // Índices útiles
            $table->index(['latitude', 'longitude']);              // para consultas por cercanía
            $table->index(['country', 'province', 'city']);        // filtros por texto

            $table->timestamps(); // created_at, updated_at
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
