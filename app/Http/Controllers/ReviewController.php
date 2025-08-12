<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request, Worker $worker)
    {
        $data = $request->validate([
            'rating'  => ['required','integer','min:1','max:5'],
            'comment' => ['nullable','string','max:2000'],
        ]);

        Review::create([
            'user_id'   => Auth::id(),
            'worker_id' => $worker->id,
            'rating'    => $data['rating'],
            'comment'   => $data['comment'] ?? null,
        ]);

        return back()->with('status', '¡Gracias por tu reseña!');
    }
}
