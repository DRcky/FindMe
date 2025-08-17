<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // $this->call(UserSeeder::class); // si tuvieras uno
        $this->call([
            SpecialtySeeder::class,
            UsersSeeder::class,
            WorkersSeeder::class,
            ReviewsSeeder::class, // opcional
        ]);
    }
}
