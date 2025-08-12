<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hire extends Model
{
  protected $fillable = ['worker_id','client_id','status','accepted_at','rejected_at'];

  public function worker(){ return $this->belongsTo(\App\Models\Worker::class); }
  public function client(){ return $this->belongsTo(\App\Models\User::class, 'client_id'); }
}
