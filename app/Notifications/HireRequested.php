<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HireRequested extends Notification
{
  use Queueable;
  public function __construct(public \App\Models\Hire $hire) {}
  public function via($notifiable){ return ['database']; } // agrega 'mail' si quieres
  public function toDatabase($notifiable){
    return [
      'type' => 'hire.requested',
      'hire_id' => $this->hire->id,
      'client_id' => $this->hire->client_id,
      'client_name' => $this->hire->client->first_name.' '.($this->hire->client->last_name ?? ''),
      'worker_id' => $this->hire->worker_id,
      'message' => 'Nueva solicitud de contratación',
    ];
  }
}
