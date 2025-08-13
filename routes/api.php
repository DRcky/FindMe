<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GeoController;
use App\Http\Controllers\WorkerNearbyController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aquí puedes registrar las rutas para tu API. Estas rutas se cargan por
| RouteServiceProvider y se les asigna automáticamente el middleware "api".
|
*/

// routes/api.php

Route::get('/reverse-geocode', [GeoController::class, 'reverse'])
    ->name('api.reverse');

Route::get('/nearby-workers', [WorkerNearbyController::class, 'index'])->name('api.nearby-workers');

Route::get('/workers/nearby', [WorkerNearbyController::class, 'index'])
    ->name('api.workers.nearby');
    
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
