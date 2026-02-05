<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $customersCount = Customer::count();
            $activeProjectsCount = Project::active()->count();
            $recentCustomers = Customer::latest()
                ->limit(5)
                ->get(['id', 'name', 'email']);

            return Inertia::render('Dashboard', [
                'isAdmin' => true,
                'customersCount' => $customersCount,
                'activeProjectsCount' => $activeProjectsCount,
                'recentCustomers' => $recentCustomers,
            ]);
        }

        $customer = $user->customer;
        $projects = $customer
            ? $customer->projects()->latest()->get()->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'status' => $p->status,
                'status_label' => $p->status_label,
                'scheduled_shoot_date' => $p->scheduled_shoot_date?->format('F j, Y'),
                'media_links' => $p->media_links ?? [],
            ])
            : [];

        return Inertia::render('Dashboard', [
            'isAdmin' => false,
            'customerName' => $customer?->name,
            'projects' => $projects,
        ]);
    }
}
