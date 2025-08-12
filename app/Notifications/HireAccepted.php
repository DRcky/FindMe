<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HireAccepted extends Notification
{
  use Queueable;
  public function __construct(public \App\Models\Hire $hire) {}
  public function via($notifiable){ return ['database']; }
  public function toDatabase($notifiable){
    return [
      'type' => 'hire.accepted',
      'hire_id' => $this->hire->id,
      'worker_id' => $this->hire->worker_id,
      'worker_name' => $this->hire->worker->user->first_name.' '.($this->hire->worker->user->last_name ?? ''),
      'client_id' => $this->hire->client_id,
      'message' => 'Tu solicitud fue aceptada',
    ];
  }
}
