<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectTypeController extends Controller
{
    public function index(): Response
    {
        $projectTypes = ProjectType::ordered()->get()->map(fn(ProjectType $t) => [
            'id' => $t->id,
            'name' => $t->name,
            'sort_order' => $t->sort_order,
            'projects_count' => $this->projectsUsingTypeCount($t->id),
        ]);

        return Inertia::render('Admin/ProjectTypes/Index', [
            'project_types' => $projectTypes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $maxOrder = ProjectType::max('sort_order') ?? 0;
        ProjectType::create([
            'name' => $validated['name'],
            'sort_order' => $maxOrder + 1,
        ]);

        return back()->with('success', 'Project type added.');
    }

    public function update(Request $request, ProjectType $project_type): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $project_type->update(['name' => $validated['name']]);

        return back()->with('success', 'Project type updated.');
    }

    public function destroy(ProjectType $project_type): RedirectResponse
    {
        $count = $this->projectsUsingTypeCount($project_type->id);
        if ($count > 0) {
            return back()->with('error', "Cannot delete: {$count} project(s) use this type. Remove it from those projects first.");
        }

        $project_type->delete();

        return back()->with('success', 'Project type deleted.');
    }

    public function move(Request $request, ProjectType $project_type): RedirectResponse
    {
        $direction = $request->validate(['direction' => 'required|in:up,down'])['direction'];

        $ordered = ProjectType::ordered()->get();
        $index = $ordered->search(fn($t) => (int) $t->id === (int) $project_type->id);

        if ($index === false) {
            return back()->with('error', 'Project type not found.');
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

        $oldOrder = $project_type->sort_order;
        $project_type->update(['sort_order' => $swap->sort_order]);
        $swap->update(['sort_order' => $oldOrder]);

        return back()->with('success', 'Order updated.');
    }

    private function projectsUsingTypeCount(int $projectTypeId): int
    {
        return Project::whereJsonContains('project_types', $projectTypeId)->count();
    }
}
