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
        $links = $this->project->media_links ?? [];
        if ($this->mediaLinkAdded && count($links) > 0) {
            foreach ($links as $url) {
                if (is_string($url) && $url !== '') {
                    $message->line('View your photos/videos: ' . $url);
                }
            }
        }
        $message->line('You can also log in to your account to check status anytime.');
        return $message;
    }

    public function toTwilioSms(object $notifiable): array
    {
        $statusLabel = $this->project->status_label;
        $body = "Your project status is now: {$statusLabel}.";
        $links = $this->project->media_links ?? [];
        if ($this->mediaLinkAdded && count($links) > 0) {
            $body .= ' View your media: ' . (is_string($links[0]) ? $links[0] : '');
            if (count($links) > 1) {
                $body .= ' (+' . (count($links) - 1) . ' more - check your email)';
            }
        }
        $to = $notifiable->routeNotificationFor('twilio_sms') ?? $this->project->customer->phone;
        return [
            'to' => $to ?: null,
            'body' => $body,
        ];
    }
}
