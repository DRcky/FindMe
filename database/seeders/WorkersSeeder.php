<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Worker;

class WorkersSeeder extends Seeder
{
    public function run(): void
    {
        $specialtyIds = DB::table('specialties')->pluck('id')->all();
        if (empty($specialtyIds)) {
            $this->call(SpecialtySeeder::class);
            $specialtyIds = DB::table('specialties')->pluck('id')->all();
        }

        // Toma 12 usuarios aleatorios para convertirlos en workers
        $users = User::inRandomOrder()->take(12)->get();

        foreach ($users as $u) {
            // Evita duplicado por unique(user_id) en workers
            $exists = Worker::where('user_id', $u->id)->exists();
            if ($exists) continue;

            Worker::create([
                'user_id'       => $u->id,
                'specialty_id'  => $specialtyIds[array_rand($specialtyIds)],
                'status'        => 'active', // tu Worker::$fillable incluye 'status'
                // Si tu tabla workers tuviera 'is_available' o 'rate', puedes añadirlos aquí.
            ]);
        }
    }
}
