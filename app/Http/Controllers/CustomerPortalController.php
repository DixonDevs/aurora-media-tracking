<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerPortalController extends Controller
{
    public function index(Request $request): Response
    {
        $customer = $request->user()->customer;
        if (! $customer) {
            return Inertia::render('CustomerPortal/NoAccess');
        }

        $projects = $customer->projects()->orderBy('completed_at')->latest('updated_at')->get()->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'status' => $p->status,
            'status_label' => $p->status_label,
            'scheduled_shoot_date' => $p->scheduled_shoot_date?->format('F j, Y'),
            'media_links' => $p->media_links ?? [],
            'completed_at' => $p->completed_at?->format('F j, Y'),
            'is_archived' => $p->isArchived(),
        ]);

        return Inertia::render('CustomerPortal/Index', [
            'customer' => ['name' => $customer->name],
            'projects' => $projects,
        ]);
    }
}
