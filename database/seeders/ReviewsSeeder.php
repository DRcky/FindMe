<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Worker;
use App\Models\Review;
use App\Models\User;

class ReviewsSeeder extends Seeder
{
    public function run(): void
    {
        $clients = User::inRandomOrder()->take(10)->get();
        foreach (Worker::inRandomOrder()->take(10)->get() as $idx => $worker) {
            $client = $clients[$idx % max(1, $clients->count())];

            Review::create([
                'user_id'   => $client->id,
                'worker_id' => $worker->id,
                'rating'    => rand(4,5),
                'comment'   => 'Excelente servicio, muy puntual y profesional.',
            ]);
        }
    }
}
