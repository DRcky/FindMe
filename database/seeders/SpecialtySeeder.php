<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Plomero', 'Electricista', 'Carpintero', 'Albañil', 'Pintor',
            'Técnico A/C', 'Soldador', 'Jardinero', 'Cerrajero', 'Técnico Electrodomésticos'
        ];

        $now = now();
        foreach ($names as $n) {
            DB::table('specialties')->updateOrInsert(
                ['name' => $n],
                ['created_at' => $now, 'updated_at' => $now]
            );
        }
    }
}
