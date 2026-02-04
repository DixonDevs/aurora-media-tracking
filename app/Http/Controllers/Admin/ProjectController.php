<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Notifications\ProjectStatusUpdatedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class ProjectController extends Controller
{
    public function updateStatus(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Project::statuses())),
            'scheduled_shoot_date' => 'nullable|date',
        ]);

        $previousStatus = $project->status;
        $project->update([
            'status' => $validated['status'],
            'scheduled_shoot_date' => $validated['scheduled_shoot_date'] ?? $project->scheduled_shoot_date,
        ]);

        $this->notifyCustomer($project, $previousStatus, false);

        return back()->with('success', 'Status updated. Customer will be notified.');
    }

    public function updateMediaLink(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'media_link' => 'required|url',
        ]);

        $added = empty($project->media_link);
        $project->update(['media_link' => $validated['media_link']]);

        $this->notifyCustomer($project, null, $added);

        return back()->with('success', 'Media link saved. Customer will be notified.');
    }

    private function notifyCustomer(Project $project, ?string $previousStatus, bool $mediaLinkAdded): void
    {
        $customer = $project->customer;
        if (! $customer->email) {
            return;
        }

        $notifiable = Notification::route('mail', $customer->email);
        if ($customer->phone) {
            $notifiable = $notifiable->route('twilio_sms', $customer->phone);
        }
        $notifiable->notify(new ProjectStatusUpdatedNotification($project, $previousStatus, $mediaLinkAdded));
    }
}
