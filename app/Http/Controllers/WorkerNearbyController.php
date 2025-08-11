<?php

// app/Http/Controllers/WorkerNearbyController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Worker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WorkerNearbyController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'lat'          => ['required', 'numeric', 'between:-90,90'],
            'lng'          => ['required', 'numeric', 'between:-180,180'],
            'radius'       => ['nullable', 'numeric', 'min:0'],
            'specialty_id' => ['nullable', 'integer', 'exists:specialties,id'],
        ]);

        $lat = (float) $request->lat;
        $lng = (float) $request->lng;
        $radiusKm = (float) ($request->radius ?? 5);
        $specialtyId = $request->specialty_id;

        $haversine = "(6371 * acos(
        cos(radians(?)) * cos(radians(users.latitude)) *
        cos(radians(users.longitude) - radians(?)) +
        sin(radians(?)) * sin(radians(users.latitude))
    ))";

        $q = \App\Models\Worker::query()
            ->join('users', 'users.id', '=', 'workers.user_id')
            ->leftJoin('specialties', 'specialties.id', '=', 'workers.specialty_id')
            ->whereNotNull('users.latitude')
            ->whereNotNull('users.longitude');

        if ($specialtyId) {
            $q->where('workers.specialty_id', $specialtyId);
        }

        $workers = $q->select([
            'workers.id as worker_id',
            'workers.status',
            'users.id as user_id',
            'users.first_name',
            'users.last_name',
            'users.phone',
            'users.email',
            'users.city',
            'users.province',
            'users.country',
            'users.latitude',
            'users.longitude',
            'specialties.name as specialty',
        ])
            ->selectRaw("$haversine AS distance", [$lat, $lng, $lat])
            ->having('distance', '<=', $radiusKm)
            ->orderBy('distance')
            ->limit(400)
            ->get();

        return response()->json($workers);
    }
}
