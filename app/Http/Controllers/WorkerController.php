<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WorkerController extends Controller
{
    // Muestra el formulario con el listado de especialidades
    public function create()
    {
        $user = Auth::user();

        if ($user->worker) {
            return redirect()->route('dashboard')->with('status', 'Ya eres trabajador.');
        }

        return Inertia::render('Workers/Become', [
            'specialties' => Specialty::orderBy('name')->get(['id', 'name']),
        ]);
    }

    // Crea el registro de Worker
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->worker) {
            return redirect()->route('dashboard')->with('status', 'Ya eres trabajador.');
        }

        $data = $request->validate([
            'specialty_id' => ['nullable', Rule::exists('specialties', 'id')],
        ]);

        Worker::create([
            'user_id'      => $user->id,
            'status'       => 'Active',
            'specialty_id' => $data['specialty_id'] ?? null,
            // si tu tabla workers tiene coords/otros campos, puedes copiar desde users aquí
        ]);

        return redirect()->route('dashboard')->with('status', '¡Listo! Te convertiste en trabajador.');
    }
}
