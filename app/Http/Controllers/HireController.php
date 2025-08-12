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

        // Evitar duplicado pending del mismo par
        $existing = Hire::where('worker_id',$worker->id)
            ->where('client_id',$client->id)
            ->where('status','pending')->first();
        if ($existing) {
            return back()->with('status', 'Ya tienes una solicitud pendiente.');
        }

        $hire = Hire::create([
            'worker_id' => $worker->id,
            'client_id' => $client->id,
            'status' => 'pending',
        ]);

        // Notificar al especialista
        $worker->user->notify(new HireRequested($hire));

        return back()->with('status', 'Solicitud enviada. El especialista fue notificado.');
    }

    // Aceptar (solo el especialista dueño del worker)
    public function accept(Hire $hire)
    {
        $user = Auth::user();
        if ($hire->worker->user_id !== $user->id) {
            abort(403);
        }
        if ($hire->status !== 'pending') {
            return back()->with('status','Esta solicitud ya no está pendiente.');
        }

        $hire->update([
            'status' => 'accepted',
            'accepted_at' => now(),
            'rejected_at' => null,
        ]);

        // Notificar al cliente
        $hire->client->notify(new HireAccepted($hire));

        return back()->with('status','Solicitud aceptada.');
    }

    // Rechazar (solo el especialista)
    public function reject(Hire $hire)
    {
        $user = Auth::user();
        if ($hire->worker->user_id !== $user->id) {
            abort(403);
        }
        if ($hire->status !== 'pending') {
            return back()->with('status','Esta solicitud ya no está pendiente.');
        }

        $hire->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'accepted_at' => null,
        ]);

        return back()->with('status','Solicitud rechazada.');
    }

    // Listas para ambos (contrataciones del usuario logueado)
    public function index()
    {
        $user = Auth::user();

        $asClient = Hire::with(['worker.user:id,first_name,last_name'])
            ->where('client_id',$user->id)
            ->latest()->get();

        $asWorker = Hire::with(['client:id,first_name,last_name'])
            ->whereHas('worker', fn($q)=>$q->where('user_id',$user->id))
            ->latest()->get();

        return Inertia::render('Hires/Index', [
            'asClient' => $asClient,
            'asWorker' => $asWorker,
        ]);
    }
}
