<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = ['user_id','worker_id','rating','comment'];

    public function worker() { return $this->belongsTo(\App\Models\Worker::class); }
    public function user()   { return $this->belongsTo(\App\Models\User::class); }
}