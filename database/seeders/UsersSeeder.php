<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Centro: 19°13'57.2"N 70°30'39.1"W
        $baseLat = 19.232556;
        $baseLng = -70.510861;

        // Faker en español (RD)
        $faker = \Faker\Factory::create('es_DO');

        $now = now();
        $total = 25; // cantidad de usuarios a crear

        for ($i = 0; $i < $total; $i++) {
            // Jitter pequeño (~0.003–0.010 grados ≈ 0.3–1.1 km)
            $deltaLat = (mt_rand(3, 10) / 1000.0) * (mt_rand(0, 1) ? 1 : -1);
            $deltaLng = (mt_rand(3, 10) / 1000.0) * (mt_rand(0, 1) ? 1 : -1);

            $lat = round($baseLat + $deltaLat, 7);
            $lng = round($baseLng + $deltaLng, 7);

            $first = $faker->firstName();
            $last  = $faker->lastName();

            DB::table('users')->insert([
                // Datos personales
                'first_name'   => $first,
                'last_name'    => $last,
                'phone'        => $faker->optional()->e164PhoneNumber(),

                // Autenticación
                'email'             => 'user'.$i.'@example.com', // o $faker->unique()->safeEmail()
                'password'          => Hash::make('password'),    // cambia si quieres
                'remember_token'    => Str::random(10),

                // Ubicación textual
                'country'   => 'República Dominicana',
                'province'  => 'Puerto Plata',
                'city'      => 'San Felipe de Puerto Plata',

                // Coordenadas y precisión
                'latitude'   => $lat,
                'longitude'  => $lng,
                'accuracy_m' => mt_rand(5, 50), // precisión reportada 5–50 m

                // Última vez visto (distribución aleatoria en las últimas 48h)
                'last_seen_at' => $now->copy()->subHours(mt_rand(0, 48))->subMinutes(mt_rand(0, 59)),

                // Timestamps
                'created_at' => $now->copy()->subDays(mt_rand(0, 10))->subHours(mt_rand(0, 23)),
                'updated_at' => $now,
            ]);
        }

        // Usuario de prueba fijo (útil para login)
        DB::table('users')->insert([
            'first_name'      => 'Ricky',
            'last_name'       => 'Demo',
            'phone'           => $faker->e164PhoneNumber(),
            'email'           => 'ricky.demo@example.com',
            'password'        => Hash::make('password'),
            'remember_token'  => Str::random(10),
            'country'         => 'República Dominicana',
            'province'        => 'Puerto Plata',
            'city'            => 'San Felipe de Puerto Plata',
            'latitude'        => $baseLat,
            'longitude'       => $baseLng,
            'accuracy_m'      => 8.50,
            'last_seen_at'    => now(),
            'created_at'      => now()->subDay(),
            'updated_at'      => now(),
        ]);
    }
}
