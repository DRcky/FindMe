<?php

namespace App\Http\Controllers;

use App\Models\Hire;
use App\Models\Review;
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

    public function show(Request $request, Worker $worker)
    {
        // Carga relaciones mínimas para el perfil
        $worker->load([
            'user:id,first_name,last_name,phone,email,city,province',
            'specialty:id,name',
        ]);
        // Asegúrate de poder leer user_id en el front
        $worker->makeVisible('user_id');

        // Usuario actual (o null si invitado)
        $userId = Auth::id();

        // Contratación actual del usuario hacia este worker (si hay sesión)
        $currentHire = null;
        if ($userId) {
            $currentHire = Hire::where('worker_id', $worker->id)
                ->where('client_id', $userId)
                ->latest('id')
                ->first(['id','status','created_at','accepted_at','rejected_at','worker_id']);
        }

        // Métricas de reseñas
        $stats = Review::where('worker_id', $worker->id)
            ->selectRaw('COUNT(*) as total, AVG(rating) as avg_rating')
            ->first();

        // Reseñas paginadas (con autor)
        $reviews = Review::with(['user:id,first_name,last_name'])
            ->where('worker_id', $worker->id)
            ->latest('id') // usa created_at si lo tienes
            ->paginate(10)
            ->through(function ($r) {
                return [
                    'id'         => $r->id,
                    'rating'     => (int) $r->rating,
                    'comment'    => $r->comment,
                    'author'     => trim(($r->user->first_name ?? '').' '.($r->user->last_name ?? '')),
                    'created_at' => optional($r->created_at)->toDateString(),
                ];
            });

        return Inertia::render('Workers/Profile', [
            'worker'      => $worker,
            'stats'       => [
                'total'      => (int) ($stats->total ?? 0),
                'avg_rating' => $stats->avg_rating ? round($stats->avg_rating, 2) : null,
            ],
            'reviews'     => $reviews,
            'isOwner'     => $userId ? $userId === $worker->user_id : false,
            'client_hire' => $currentHire, // {id,status,...} o null
        ]);
    }
}
