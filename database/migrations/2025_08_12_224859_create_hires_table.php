<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('hires', function (Blueprint $t) {
      $t->id();
      $t->foreignId('worker_id')->constrained()->cascadeOnDelete();
      $t->foreignId('client_id')->constrained('users')->cascadeOnDelete(); // quién contrata
      $t->enum('status', ['pending','accepted','rejected','cancelled'])->default('pending');
      $t->timestamp('accepted_at')->nullable();
      $t->timestamp('rejected_at')->nullable();
      $t->timestamps();

      $t->unique(['worker_id','client_id','status']); // evita múltiples pending iguales
    });
  }
  public function down(): void { Schema::dropIfExists('hires'); }
};
