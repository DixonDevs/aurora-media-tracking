<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test {email : The email address to send a test to}', function (string $email) {
    $this->info("Sending test email to {$email}...");
    try {
        Mail::raw('This is a test from Aurora Media Tracking. If you see this, mail is working.', function ($message) use ($email) {
            $message->to($email)->subject('Mail test');
        });
        $this->info('Sent successfully. Check the inbox (and Mailgun sandbox authorized recipients if using sandbox).');
    } catch (\Throwable $e) {
        $this->error('Failed: ' . $e->getMessage());
        $this->error($e->getTraceAsString());
    }
})->purpose('Send a test email to diagnose mail configuration');
