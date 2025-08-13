<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('hires', function (Blueprint $table) {
            $table->id();
            
            // Cliente que contrata
            $table->foreignId('client_id')
                ->constrained('users')
                ->cascadeOnDelete();
            
            // Trabajador contratado
            $table->foreignId('worker_id')
                ->constrained('workers')
                ->cascadeOnDelete();
            
            // Estado de la solicitud
            $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled'])
                ->default('pending');

            // Mensaje opcional o nota
            $table->text('message')->nullable();

            $table->timestamps();

            // 🔒 Si quieres evitar solicitudes duplicadas activas, puedes dejar este unique:
            // $table->unique(['client_id', 'worker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hires');
    }
};
