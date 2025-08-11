<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:50'],
            'last_name'  => ['nullable', 'string', 'max:50'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'email'      => ['required', 'string', 'lowercase', 'email', 'max:100', 'unique:users,email'],
            'password'   => ['required', 'confirmed', Rules\Password::defaults()],
            // ubicación
            'country'    => ['nullable', 'string', 'max:100'],
            'province'   => ['nullable', 'string', 'max:100'],
            'city'       => ['nullable', 'string', 'max:120'],
            'latitude'   => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'  => ['nullable', 'numeric', 'between:-180,180'],
            'accuracy_m' => ['nullable', 'numeric', 'min:0'],
        ]);

        // Si hay coords pero faltan textos, hacemos reverse geocoding (servidor)
        if (($validated['latitude'] ?? null) && ($validated['longitude'] ?? null)
            && (empty($validated['country']) || empty($validated['province']) || empty($validated['city']))
        ) {

            try {
                $res = Http::withHeaders([
                    'User-Agent' => 'FindMeApp/1.0 (contacto@tudominio.test)',
                ])
                    ->timeout(10)
                    ->get('https://nominatim.openstreetmap.org/reverse', [
                        'format' => 'jsonv2',
                        'lat' => $validated['latitude'],
                        'lon' => $validated['longitude'],
                        'addressdetails' => 1,
                    ]);

                if ($res->ok()) {
                    $addr = $res->json('address') ?? [];
                    $validated['country']  = $validated['country']  ?: ($addr['country'] ?? null);
                    $validated['province'] = $validated['province'] ?: ($addr['state'] ?? ($addr['region'] ?? null));
                    $validated['city']     = $validated['city']     ?: ($addr['city'] ?? ($addr['town'] ?? ($addr['village'] ?? null)));
                }
            } catch (\Throwable $e) {
                // silenciar error de geocoding; sigue el registro
            }
        }

        $user = User::create([
            'first_name'  => $validated['first_name'],
            'last_name'   => $validated['last_name'] ?? null,
            'phone'       => $validated['phone'] ?? null,
            'email'       => $validated['email'],
            'password'    => $validated['password'],
            'country'     => $validated['country'] ?? null,
            'province'    => $validated['province'] ?? null,
            'city'        => $validated['city'] ?? null,
            'latitude'    => $validated['latitude'] ?? null,
            'longitude'   => $validated['longitude'] ?? null,
            'accuracy_m'  => $validated['accuracy_m'] ?? null,
            'last_seen_at' => ($validated['latitude'] ?? null) && ($validated['longitude'] ?? null) ? now() : null,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
