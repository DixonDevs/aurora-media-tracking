<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectStatus;
use App\Models\ProjectType;
use App\Notifications\ProjectStatusUpdatedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        $projects = Project::with('customer')
            ->active()
            ->latest('updated_at')
            ->get();

        $projects->each(fn($p) => $p->append('status_label'));

        $byCustomer = $projects->groupBy('customer_id')->map(function ($customerProjects, $customerId) {
            $customer = $customerProjects->first()->customer;

            return [
                'customer' => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                ],
                'projects' => $customerProjects->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'status' => $p->status,
                    'status_label' => $p->status_label,
                    'scheduled_shoot_date' => $p->scheduled_shoot_date?->format('Y-m-d'),
                ])->values()->all(),
            ];
        })->values()->all();

        return Inertia::render('Admin/Projects/Index', [
            'activeProjectsByCustomer' => $byCustomer,
        ]);
    }

    public function show(Project $project): Response
    {
        $project->load('customer');
        $project->append('status_label');

        return Inertia::render('Admin/Projects/Show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'status' => $project->status,
                'status_label' => $project->status_label,
                'scheduled_shoot_date' => $project->scheduled_shoot_date?->format('Y-m-d'),
                'media_links' => $project->media_links ?? [],
                'notes' => $project->notes,
                'project_types' => $project->project_types ?? [],
                'completed_at' => $project->completed_at?->toIso8601String(),
                'is_archived' => $project->isArchived(),
            ],
            'project_type_options' => ProjectType::ordered()->get()->map(fn($t) => ['id' => $t->id, 'name' => $t->name])->values()->all(),
            'customer' => [
                'id' => $project->customer->id,
                'name' => $project->customer->name,
            ],
            'statuses' => ProjectStatus::keyLabelMap(visibleOnly: true),
        ]);
    }

    public function updateName(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $project->update(['name' => $validated['name']]);

        return back()->with('success', 'Project name updated.');
    }

    public function complete(Project $project): RedirectResponse
    {
        if ($project->completed_at) {
            return back()->with('info', 'This project is already completed.');
        }

        $project->update(['completed_at' => now()]);

        return back()->with('success', 'Project completed and archived.');
    }

    public function unarchive(Project $project): RedirectResponse
    {
        if (! $project->completed_at) {
            return back()->with('info', 'This project is not archived.');
        }

        $project->update(['completed_at' => null]);

        return back()->with('success', 'Project restored to active.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $customer = $project->customer;

        $project->delete();

        return redirect()->route('admin.customers.show', $customer)
            ->with('success', 'Project deleted.');
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        if ($project->completed_at) {
            return back()->with('info', 'Cannot update an archived project.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:' . implode(',', ProjectStatus::keys(visibleOnly: false)),
            'scheduled_shoot_date' => 'nullable|date',
            'media_links' => 'nullable|array',
            'media_links.*' => 'nullable|url',
            'project_types' => 'nullable|array',
            'project_types.*' => 'integer|exists:project_types,id',
        ]);

        $previousStatus = $project->status;
        $previousLinks = $project->media_links ?? [];
        $newLinks = array_values(array_filter($validated['media_links'] ?? [], fn($u) => is_string($u) && $u !== ''));
        $projectTypeIds = array_values(array_unique(array_map('intval', $validated['project_types'] ?? [])));

        $project->update([
            'name' => $validated['name'],
            'status' => $validated['status'],
            'scheduled_shoot_date' => $validated['scheduled_shoot_date'] ?? null,
            'media_links' => $newLinks,
            'project_types' => $projectTypeIds,
        ]);

        $statusChanged = $previousStatus !== $validated['status'];
        $mediaLinkAdded = $project->status === Project::STATUS_READY_TO_VIEW
            && count($newLinks) > count($previousLinks);

        if ($mediaLinkAdded) {
            $this->notifyCustomer($project->fresh(), null, true);
        } elseif ($statusChanged) {
            $this->notifyCustomer($project->fresh(), $previousStatus, false);
        }

        return back()->with('success', 'Project updated.' . ($mediaLinkAdded || $statusChanged ? ' Customer will be notified.' : ''));
    }

    public function updateStatus(Request $request, Project $project): RedirectResponse
    {
        if ($project->completed_at) {
            return back()->with('info', 'Cannot update status of an archived project.');
        }

        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', ProjectStatus::keys(visibleOnly: false)),
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
        if ($project->completed_at) {
            return back()->with('info', 'Cannot update media link of an archived project.');
        }

        $validated = $request->validate([
            'media_link' => 'required|url',
        ]);

        $links = $project->media_links ?? [];
        $links[] = $validated['media_link'];
        $project->update(['media_links' => $links]);

        $added = $project->status === Project::STATUS_READY_TO_VIEW;
        if ($added) {
            $this->notifyCustomer($project->fresh(), null, true);
        }

        return back()->with('success', $added ? 'Media link saved. Customer will be notified.' : 'Media link saved.');
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
