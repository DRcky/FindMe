<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    protected $fillable = ['status', 'user_id', 'specialty_id'/*, 'latitude','longitude'*/];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
    public function specialty()
    {
        return $this->belongsTo(\App\Models\Specialty::class);
    }
}
