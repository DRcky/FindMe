<?php

namespace App\Http\Controllers;

use App\Models\Hire;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Notifications\HireRequested;
use App\Notifications\HireAccepted;

class HireController extends Controller
{


    // Crear solicitud (cliente -> worker)
    public function store(Request $request, Worker $worker)
    {
        $client = Auth::user();
        if ($worker->user_id === $client->id) {
            return back()->withErrors(['hire' => 'No puedes contratarte a ti mismo.']);
        }

        $existing = Hire::where('worker_id', $worker->id)
            ->where('client_id', $client->id)
            ->where('status', 'pending')->first();

        if ($existing) {
            return redirect()->route('workers.show', $worker->id)
                ->with('status', 'Ya tienes una solicitud pendiente.');
        }

        $hire = Hire::create([
            'worker_id' => $worker->id,
            'client_id' => $client->id,
            'status'    => 'pending',
        ]);

        // Notifica
        $worker->user->notify(new \App\Notifications\HireRequested($hire));

        //  Regresa al perfil para que se recargue con client_hire=pendiente
        return redirect()->route('workers.show', $worker->id)
            ->with('status', 'Solicitud enviada. El especialista fue notificado.');
    }

    // Aceptar (solo el especialista dueño del worker)
    public function accept(Hire $hire)
    {
        $user = Auth::user();
        if ($hire->worker->user_id !== $user->id) {
            abort(403);
        }
        if ($hire->status !== 'pending') {
            return back()->with('status', 'Esta solicitud ya no está pendiente.');
        }

        $hire->update([
            'status' => 'accepted',
            'accepted_at' => now(),
            'rejected_at' => null,
        ]);

        // Notificar al cliente
        $hire->client->notify(new HireAccepted($hire));

        return back()->with('status', 'Solicitud aceptada.');
    }

    // Rechazar (solo el especialista)
    public function reject(Hire $hire)
    {
        $user = Auth::user();
        if ($hire->worker->user_id !== $user->id) {
            abort(403);
        }
        if ($hire->status !== 'pending') {
            return back()->with('status', 'Esta solicitud ya no está pendiente.');
        }

        $hire->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'accepted_at' => null,
        ]);

        return back()->with('status', 'Solicitud rechazada.');
    }

    public function cancel(Request $request, Hire $hire)
    {
        // El middleware 'auth' debe asegurar que hay usuario logueado
        $user = $request->user();          // null si no hay sesión (pero con auth middleware no pasará)
        $userId = $user->id;               // seguro aquí

        // Solo el cliente que creó la solicitud puede cancelarla
        if ((int) $hire->client_id !== (int) $userId) {
            abort(403);
        }

        // (Opcional) solo permitir cancelar si sigue pendiente
        if ($hire->status !== 'pending') {
            return back()->with('status', 'La solicitud ya no está pendiente.');
        }

        $hire->update(['status' => 'cancelled']);

        // Vuelve al perfil del worker para refrescar el botón dinámico
        return redirect()
            ->route('workers.show', $hire->worker_id)
            ->with('status', 'Solicitud cancelada.');
    }

    public function complete(Request $request, Hire $hire)
    {
        $user = $request->user();

        // Solo el dueño del worker puede completar
        if ($hire->worker->user_id !== $user->id) {
            abort(403);
        }

        if ($hire->status !== 'accepted') {
            return back()->with('status', 'Solo puedes completar contrataciones aceptadas.');
        }

        $hire->update([
            'status'       => 'completed',
            'completed_at' => now(),
        ]);

        // (Opcional) notificar al cliente aquí

        return back()->with('status', 'Trabajo completado ✅');
    }

    // Listas para ambos (contrataciones del usuario logueado)
    public function index()
    {
        $user = Auth::user();

        $asWorker = Hire::with(['client:id,first_name,last_name'])
            ->whereHas('worker', fn($q) => $q->where('user_id', $user->id))
            ->latest()
            ->get(['id', 'status', 'completed_at', 'client_id', 'worker_id']);

        $asClient = Hire::with(['worker.user:id,first_name,last_name'])
            ->where('client_id', $user->id)
            ->latest()
            ->get(['id', 'status', 'completed_at', 'worker_id']);


        return Inertia::render('Hires/Index', [
            'asClient' => $asClient,
            'asWorker' => $asWorker,
        ]);
    }
}
