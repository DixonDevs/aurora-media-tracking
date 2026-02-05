<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(): Response
    {
        $customers = Customer::with([
            'user',
            'projects' => fn($q) => $q->latest()->select('id', 'customer_id', 'name', 'status', 'scheduled_shoot_date'),
        ])
            ->withCount('projects')
            ->withCount(['projects as active_projects_count' => fn($q) => $q->whereNull('completed_at')])
            ->latest()
            ->get()
            ->map(fn(Customer $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'phone' => $c->phone,
                'has_portal_access' => (bool) $c->user_id,
                'projects_count' => $c->projects_count,
                'active_projects_count' => $c->active_projects_count,
                'archived_projects_count' => $c->projects_count - $c->active_projects_count,
                'projects' => $c->projects->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'status_label' => $p->status_label,
                    'scheduled_shoot_date' => $p->scheduled_shoot_date?->format('M j, Y'),
                ])->values()->all(),
            ]);

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Customers/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
            'job' => 'nullable|string|max:255',
            'send_invite' => 'boolean',
        ]);

        $sendInvite = $request->boolean('send_invite');
        $customer = Customer::create(collect($validated)->except('send_invite')->all());
        $customer->projects()->create(['name' => 'New project']);

        $message = 'Customer added successfully.';
        if ($sendInvite) {
            $inviteResult = $this->sendPortalInvite($customer);
            $message = $inviteResult ?? $message;
        }

        return redirect()->route('admin.customers.show', $customer)
            ->with('success', $message);
    }

    public function storeProject(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
        ]);

        $project = $customer->projects()->create([
            'name' => $validated['name'] ?? 'New project',
        ]);

        return redirect()->route('admin.projects.show', $project)
            ->with('success', 'New project created. Name it below and save.');
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'projects' => fn($q) => $q->orderBy('completed_at')->latest('updated_at'),
        ]);
        $customer->projects->each(fn($p) => $p->append('status_label'));

        $activeCount = $customer->projects->filter(fn($p) => ! $p->isArchived())->count();
        $archivedCount = $customer->projects->count() - $activeCount;

        return Inertia::render('Admin/Customers/Show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'job' => $customer->job,
                'has_portal_access' => (bool) $customer->user_id,
                'projects_count' => $customer->projects->count(),
                'active_projects_count' => $activeCount,
                'archived_projects_count' => $archivedCount,
                'projects' => $customer->projects->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'status' => $p->status,
                    'status_label' => $p->status_label,
                    'scheduled_shoot_date' => $p->scheduled_shoot_date?->format('Y-m-d'),
                    'media_links' => $p->media_links ?? [],
                    'notes' => $p->notes,
                    'completed_at' => $p->completed_at?->toIso8601String(),
                    'is_archived' => $p->isArchived(),
                ]),
            ],
        ]);
    }

    public function archivedProjects(Customer $customer): Response
    {
        $archived = $customer->projects()
            ->archived()
            ->orderByDesc('completed_at')
            ->get();

        $archived->each(fn($p) => $p->append('status_label'));

        return Inertia::render('Admin/Customers/ArchivedProjects', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
            ],
            'archivedProjects' => $archived->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'status_label' => $p->status_label,
                'scheduled_shoot_date' => $p->scheduled_shoot_date?->format('Y-m-d'),
                'media_links' => $p->media_links ?? [],
                'completed_at' => $p->completed_at?->toIso8601String(),
            ]),
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('Admin/Customers/Edit', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'job' => $customer->job,
            ],
        ]);
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
            'job' => 'nullable|string|max:255',
        ]);

        $customer->fill($validated)->save();

        if ($customer->user_id) {
            $customer->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);
        }

        return redirect()->route('admin.customers.show', $customer)
            ->with('success', 'Customer updated.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();
        return redirect()->route('admin.customers.index')
            ->with('success', 'Customer deleted.');
    }

    public function invite(Customer $customer): RedirectResponse
    {
        if ($customer->user_id) {
            return back()->with('info', 'Customer already has portal access. Use "Send password reset link" to resend.');
        }

        $this->createPortalUserAndSendInvite($customer);
        return back()->with('success', 'Invitation sent. They’ll get an email to set their password.');
    }

    public function sendPasswordResetLink(Customer $customer): RedirectResponse
    {
        if (! $customer->user_id) {
            return back()->with('info', 'Customer doesn’t have portal access yet. Use "Invite to Portal" first.');
        }

        $status = Password::sendResetLink(['email' => $customer->user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with('success', 'Password reset link sent to their email.');
        }

        if ($status === Password::RESET_THROTTLED) {
            return back()->with('info', 'Please wait a minute before sending another reset link.');
        }

        return back()->with('info', 'Unable to send reset link. They can use "Forgot password" on the login page.');
    }

    public function revokePortalAccess(Customer $customer): RedirectResponse
    {
        if (! $customer->user_id) {
            return back()->with('info', 'Customer does not have portal access.');
        }

        $user = $customer->user;
        $customer->update(['user_id' => null]);
        $user->delete();

        return back()->with('success', 'Portal access revoked. They can no longer log in. You can invite them again anytime.');
    }

    /**
     * Create user for customer and send password reset email. Returns success message or null.
     * Restores a soft-deleted user if one exists for this email.
     */
    private function createPortalUserAndSendInvite(Customer $customer): ?string
    {
        $user = User::withTrashed()->where('email', $customer->email)->first();

        if ($user) {
            $user->restore();
            $user->update([
                'name' => $customer->name,
                'password' => Hash::make(Str::random(32)),
            ]);
        } else {
            $user = User::create([
                'name' => $customer->name,
                'email' => $customer->email,
                'password' => Hash::make(Str::random(32)),
            ]);
        }

        $customer->update(['user_id' => $user->id]);
        Password::sendResetLink(['email' => $user->email]);
        return null;
    }

    /**
     * Send portal invite (create user + reset link). Returns custom success message or null to use default.
     */
    private function sendPortalInvite(Customer $customer): ?string
    {
        if ($customer->user_id) {
            Password::sendResetLink(['email' => $customer->user->email]);
            return 'Customer added. Password reset link sent to their email.';
        }
        $this->createPortalUserAndSendInvite($customer);
        return 'Customer added. They’ll get an email to set their password and log in.';
    }
}
