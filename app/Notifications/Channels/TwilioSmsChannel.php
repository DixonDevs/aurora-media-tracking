<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Twilio\Rest\Client;

class TwilioSmsChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        $message = $notification->toTwilioSms($notifiable);

        if (empty($message['to']) || empty($message['body'])) {
            return;
        }

        $client = new Client(
            config('twilio.account_sid'),
            config('twilio.auth_token')
        );

        $client->messages->create($message['to'], [
            'from' => config('twilio.sms_from'),
            'body' => $message['body'],
        ]);
    }
}
