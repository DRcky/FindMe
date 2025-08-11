<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeoController extends Controller
{
    public function reverse(Request $request)
    {
        $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $res = Http::withHeaders([
            // Cambia el contacto por uno tuyo real
            'User-Agent' => 'FindMeApp/1.0 (contacto@tudominio.test)',
        ])
            ->timeout(10)
            ->get('https://nominatim.openstreetmap.org/reverse', [
                'format' => 'jsonv2',
                'lat' => $request->lat,
                'lon' => $request->lng,
                'addressdetails' => 1,
            ]);

        if (!$res->ok()) {
            return response()->json(['message' => 'Reverse geocoding failed'], 422);
        }

        $json = $res->json();
        $addr = $json['address'] ?? [];

        return [
            'country'  => $addr['country'] ?? null,
            'province' => $addr['state'] ?? ($addr['region'] ?? null),
            'city'     => $addr['city'] ?? ($addr['town'] ?? ($addr['village'] ?? null)),
        ];
    }
}
