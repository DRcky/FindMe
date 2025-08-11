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
        Schema::create('workers', function (Blueprint $table) {
            $table->id();

            // Relación con usuario
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->unique();

            // Estado del trabajador
            $table->string('status', 50)->default('Active');

            // Especialidad
            $table->foreignId('specialty_id')->nullable()->constrained()->nullOnDelete();

            // (Opcional) Ubicación precisa si quieres guardarla aquí
            // $table->decimal('latitude', 10, 7)->nullable();
            // $table->decimal('longitude', 10, 7)->nullable();

            // Marcas de tiempo
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
