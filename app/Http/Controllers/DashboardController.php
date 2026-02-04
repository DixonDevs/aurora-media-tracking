<?php

namespace App\Http\Controllers;

use App\Models\Customer;
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
            $recentCustomers = Customer::with(['projects' => fn($q) => $q->latest()->limit(1)])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'email' => $c->email,
                    'status' => $c->projects->first()?->status_label ?? '—',
                ]);

            return Inertia::render('Dashboard', [
                'isAdmin' => true,
                'customersCount' => $customersCount,
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
                'media_link' => $p->media_link,
            ])
            : [];

        return Inertia::render('Dashboard', [
            'isAdmin' => false,
            'customerName' => $customer?->name,
            'projects' => $projects,
        ]);
    }
}
