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
        $customers = Customer::with(['user', 'projects' => fn($q) => $q->latest()->limit(1)])
            ->withCount('projects')
            ->latest()
            ->get()
            ->map(fn(Customer $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'phone' => $c->phone,
                'has_portal_access' => (bool) $c->user_id,
                'projects_count' => $c->projects_count,
                'latest_project' => $c->projects->first() ? [
                    'id' => $c->projects->first()->id,
                    'status' => $c->projects->first()->status,
                    'status_label' => $c->projects->first()->status_label,
                    'scheduled_shoot_date' => $c->projects->first()->scheduled_shoot_date?->format('Y-m-d'),
                    'media_link' => $c->projects->first()->media_link,
                ] : null,
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
            'send_invite' => 'boolean',
        ]);

        $sendInvite = $request->boolean('send_invite');
        $customer = Customer::create(collect($validated)->except('send_invite')->all());
        $customer->projects()->create(['name' => 'Project']);

        $message = 'Customer added successfully.';
        if ($sendInvite) {
            $inviteResult = $this->sendPortalInvite($customer);
            $message = $inviteResult ?? $message;
        }

        return redirect()->route('admin.customers.show', $customer)
            ->with('success', $message);
    }

    public function show(Customer $customer): Response
    {
        $customer->load(['projects' => fn($q) => $q->latest()]);
        $customer->projects->each(fn($p) => $p->append('status_label'));

        return Inertia::render('Admin/Customers/Show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'has_portal_access' => (bool) $customer->user_id,
                'projects' => $customer->projects->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'status' => $p->status,
                    'status_label' => $p->status_label,
                    'scheduled_shoot_date' => $p->scheduled_shoot_date?->format('Y-m-d'),
                    'media_link' => $p->media_link,
                    'notes' => $p->notes,
                ]),
            ],
            'statuses' => \App\Models\Project::statuses(),
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
            ],
        ]);
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:50',
        ]);

        $customer->update($validated);

        return redirect()->route('admin.customers.show', $customer)
            ->with('success', 'Customer updated.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();
        return redirect()->route('admin.customers.index')
            ->with('success', 'Customer removed.');
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

    /**
     * Create user for customer and send password reset email. Returns success message or null.
     */
    private function createPortalUserAndSendInvite(Customer $customer): ?string
    {
        $user = User::firstOrCreate(
            ['email' => $customer->email],
            [
                'name' => $customer->name,
                'password' => Hash::make(Str::random(32)),
            ]
        );
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
