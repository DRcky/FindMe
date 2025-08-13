<?php

use App\Http\Controllers\HireController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkerController;
use App\Models\Specialty;
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

Route::middleware('auth')->get('/workers/map', function () {
    return inertia('Workers/NearbyMap', [
        'specialties' => Specialty::orderBy('name')->get(['id', 'name']),
    ]);
})->name('workers.map');

Route::middleware('auth')->get('/workers/{worker}', [WorkerController::class, 'show'])
    ->name('workers.show');

Route::middleware('auth')->get('/workers/{worker}', [WorkerController::class, 'show'])
    ->name('workers.show');

Route::middleware('auth')->group(function () {
    Route::post('/workers/{worker}/reviews', [\App\Http\Controllers\ReviewController::class, 'store'])
        ->name('reviews.store');
});

Route::middleware('auth')->group(function () {
    Route::post('/workers/{worker}/hire', [HireController::class, 'store'])->name('hires.store'); // botón "Contratar"
    Route::post('/hires/{hire}/accept', [HireController::class, 'accept'])->name('hires.accept');
    Route::post('/hires/{hire}/reject', [HireController::class, 'reject'])->name('hires.reject');
    Route::post('/hires/{hire}/cancel', [HireController::class, 'cancel'])->name('hires.cancel');
    Route::post('/hires/{hire}/complete', [HireController::class, 'complete'])->name('hires.complete');

    Route::get('/hires', [HireController::class, 'index'])->name('hires.index'); // listas
});

require __DIR__ . '/auth.php';
