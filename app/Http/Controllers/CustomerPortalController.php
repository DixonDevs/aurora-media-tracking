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

        $projects = $customer->projects()->latest()->get()->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'status' => $p->status,
            'status_label' => $p->status_label,
            'scheduled_shoot_date' => $p->scheduled_shoot_date?->format('F j, Y'),
            'media_link' => $p->media_link,
        ]);

        return Inertia::render('CustomerPortal/Index', [
            'customer' => ['name' => $customer->name],
            'projects' => $projects,
        ]);
    }
}
