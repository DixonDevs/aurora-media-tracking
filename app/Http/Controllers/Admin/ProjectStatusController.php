<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectStatusController extends Controller
{
    public function index(): Response
    {
        $statuses = ProjectStatus::ordered()->get()->map(fn($s) => [
            'id' => $s->id,
            'key' => $s->key,
            'label' => $s->label,
            'sort_order' => $s->sort_order,
            'is_visible' => $s->is_visible,
            'projects_count' => Project::where('status', $s->key)->count(),
        ]);

        return Inertia::render('Admin/Statuses/Index', [
            'statuses' => $statuses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'key' => 'required|string|max:64|unique:project_statuses,key|regex:/^[a-z0-9_]+$/',
            'label' => 'required|string|max:255',
        ]);

        $maxOrder = ProjectStatus::max('sort_order') ?? 0;
        ProjectStatus::create([
            'key' => $validated['key'],
            'label' => $validated['label'],
            'sort_order' => $maxOrder + 1,
            'is_visible' => true,
        ]);

        return back()->with('success', 'Status added.');
    }

    public function update(Request $request, ProjectStatus $project_status): RedirectResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'is_visible' => 'boolean',
        ]);

        $project_status->update([
            'label' => $validated['label'],
            'is_visible' => $request->boolean('is_visible'),
        ]);

        return back()->with('success', 'Status updated.');
    }

    public function move(Request $request, ProjectStatus $project_status): RedirectResponse
    {
        $direction = $request->validate(['direction' => 'required|in:up,down'])['direction'];

        $ordered = ProjectStatus::ordered()->get();
        $index = $ordered->search(fn($s) => (int) $s->id === (int) $project_status->id);

        if ($index === false) {
            return back()->with('error', 'Status not found.');
        }

        if ($direction === 'up') {
            if ($index <= 0) {
                return back()->with('info', 'Already first.');
            }
            $swap = $ordered->get($index - 1);
        } else {
            if ($index >= $ordered->count() - 1) {
                return back()->with('info', 'Already last.');
            }
            $swap = $ordered->get($index + 1);
        }

        $oldOrder = $project_status->sort_order;
        $project_status->update(['sort_order' => $swap->sort_order]);
        $swap->update(['sort_order' => $oldOrder]);

        return back()->with('success', 'Order updated.');
    }

    public function sync(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'statuses' => 'required|array',
            'statuses.*.id' => 'nullable|integer|exists:project_statuses,id',
            'statuses.*.key' => 'required_without:statuses.*.id|nullable|string|max:64|regex:/^[a-z0-9_]+$/',
            'statuses.*.label' => 'required|string|max:255',
            'statuses.*.is_visible' => 'boolean',
        ]);

        $seenKeys = [];
        foreach ($validated['statuses'] as $index => $item) {
            $key = $item['key'] ?? null;
            if ($key !== null) {
                if (in_array($key, $seenKeys, true)) {
                    return back()->with('error', "Duplicate key: {$key}.");
                }
                $seenKeys[] = $key;
            }
        }

        $keepIds = [];

        foreach ($validated['statuses'] as $index => $item) {
            $sortOrder = $index;
            $label = $item['label'];
            $isVisible = isset($item['is_visible']) ? (bool) $item['is_visible'] : true;

            if (! empty($item['id'])) {
                $status = ProjectStatus::find($item['id']);
                if ($status) {
                    $keepIds[] = $status->id;
                    $status->update([
                        'label' => $label,
                        'is_visible' => $isVisible,
                        'sort_order' => $sortOrder,
                    ]);
                }
            } else {
                $key = $item['key'] ?? null;
                if ($key === null || $key === '') {
                    continue;
                }
                if (ProjectStatus::where('key', $key)->exists()) {
                    return back()->with('error', "Key already exists: {$key}.");
                }
                ProjectStatus::create([
                    'key' => $key,
                    'label' => $label,
                    'is_visible' => $isVisible,
                    'sort_order' => $sortOrder,
                ]);
            }
        }

        // Remove statuses that were removed from the list (and have no projects)
        ProjectStatus::whereNotIn('id', $keepIds)->get()->each(function (ProjectStatus $s) {
            if (Project::where('status', $s->key)->count() === 0) {
                $s->delete();
            }
        });

        return back()->with('success', 'Statuses saved.');
    }

    public function destroy(ProjectStatus $project_status): RedirectResponse
    {
        $count = Project::where('status', $project_status->key)->count();
        if ($count > 0) {
            return back()->with('error', "Cannot delete: {$count} project(s) use this status. Move them to another status first.");
        }

        $project_status->delete();

        return back()->with('success', 'Status deleted.');
    }
}
