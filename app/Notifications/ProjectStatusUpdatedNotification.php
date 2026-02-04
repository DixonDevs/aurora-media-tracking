<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Project $project,
        public ?string $previousStatus = null,
        public bool $mediaLinkAdded = false
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['mail'];
        if (config('twilio.account_sid') && config('twilio.sms_from')) {
            $channels[] = 'twilio_sms';
        }
        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $customer = $this->project->customer;
        $statusLabel = $this->project->status_label;
        $message = (new MailMessage)
            ->subject('Project status update: ' . $statusLabel)
            ->greeting('Hello ' . $customer->name . ',')
            ->line('Your project status has been updated to: **' . $statusLabel . '**.');
        if ($this->project->scheduled_shoot_date) {
            $message->line('Scheduled shoot date: ' . $this->project->scheduled_shoot_date->format('F j, Y'));
        }
        if ($this->mediaLinkAdded && $this->project->media_link) {
            $message->action('View your photos/videos', $this->project->media_link);
        }
        $message->line('You can also log in to your account to check status anytime.');
        return $message;
    }

    public function toTwilioSms(object $notifiable): array
    {
        $statusLabel = $this->project->status_label;
        $body = "Your project status is now: {$statusLabel}.";
        if ($this->mediaLinkAdded && $this->project->media_link) {
            $body .= ' View your media: ' . $this->project->media_link;
        }
        $to = $notifiable->routeNotificationFor('twilio_sms') ?? $this->project->customer->phone;
        return [
            'to' => $to ?: null,
            'body' => $body,
        ];
    }
}
