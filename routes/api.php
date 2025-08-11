<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GeoController;
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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
