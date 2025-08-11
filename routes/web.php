<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkerController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Mostrar formulario para elegir especialidad

    Route::get('/workers/become', [WorkerController::class, 'create'])
        ->name('workers.become.create');

    Route::middleware('auth')->get('/workers/map', fn() => inertia('Workers/NearbyMap'))
        ->name('workers.map');
        
    // Guardar: convertir a trabajador
    Route::post('/workers/become', [WorkerController::class, 'store'])
        ->name('workers.become.store');
});




require __DIR__ . '/auth.php';
