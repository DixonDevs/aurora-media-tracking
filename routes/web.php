<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerPortalController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Admin\ProjectStatusController as AdminProjectStatusController;
use App\Http\Controllers\Admin\ProjectTypeController as AdminProjectTypeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Customer portal (for logged-in customers)
    Route::get('/my-projects', [CustomerPortalController::class, 'index'])->name('customer-portal.index');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/customers', [AdminCustomerController::class, 'index'])->name('customers.index');
    Route::get('/customers/create', [AdminCustomerController::class, 'create'])->name('customers.create');
    Route::post('/customers', [AdminCustomerController::class, 'store'])->name('customers.store');
    Route::get('/customers/{customer}', [AdminCustomerController::class, 'show'])->name('customers.show');
    Route::get('/customers/{customer}/archived-projects', [AdminCustomerController::class, 'archivedProjects'])->name('customers.archived-projects');
    Route::get('/customers/{customer}/edit', [AdminCustomerController::class, 'edit'])->name('customers.edit');
    Route::put('/customers/{customer}', [AdminCustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{customer}', [AdminCustomerController::class, 'destroy'])->name('customers.destroy');
    Route::post('/customers/{customer}/invite', [AdminCustomerController::class, 'invite'])->name('customers.invite');
    Route::post('/customers/{customer}/send-password-reset', [AdminCustomerController::class, 'sendPasswordResetLink'])->name('customers.send-password-reset');
    Route::post('/customers/{customer}/revoke-portal', [AdminCustomerController::class, 'revokePortalAccess'])->name('customers.revoke-portal');
    Route::post('/customers/{customer}/projects', [AdminCustomerController::class, 'storeProject'])->name('customers.projects.store');

    Route::get('/projects', [AdminProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/{project}', [AdminProjectController::class, 'show'])->name('projects.show');
    Route::patch('/projects/{project}', [AdminProjectController::class, 'update'])->name('projects.update');
    Route::post('/projects/{project}/complete', [AdminProjectController::class, 'complete'])->name('projects.complete');
    Route::post('/projects/{project}/unarchive', [AdminProjectController::class, 'unarchive'])->name('projects.unarchive');
    Route::delete('/projects/{project}', [AdminProjectController::class, 'destroy'])->name('projects.destroy');
    Route::patch('/projects/{project}/name', [AdminProjectController::class, 'updateName'])->name('projects.update-name');
    Route::patch('/projects/{project}/status', [AdminProjectController::class, 'updateStatus'])->name('projects.update-status');
    Route::patch('/projects/{project}/media-link', [AdminProjectController::class, 'updateMediaLink'])->name('projects.update-media-link');

    Route::get('/statuses', [AdminProjectStatusController::class, 'index'])->name('statuses.index');
    Route::post('/statuses', [AdminProjectStatusController::class, 'store'])->name('statuses.store');
    Route::put('/statuses/sync', [AdminProjectStatusController::class, 'sync'])->name('statuses.sync');
    Route::patch('/statuses/{project_status}', [AdminProjectStatusController::class, 'update'])->name('statuses.update');
    Route::post('/statuses/{project_status}/move', [AdminProjectStatusController::class, 'move'])->name('statuses.move');
    Route::delete('/statuses/{project_status}', [AdminProjectStatusController::class, 'destroy'])->name('statuses.destroy');

    Route::get('/project-types', [AdminProjectTypeController::class, 'index'])->name('project-types.index');
    Route::post('/project-types', [AdminProjectTypeController::class, 'store'])->name('project-types.store');
    Route::patch('/project-types/{project_type}', [AdminProjectTypeController::class, 'update'])->name('project-types.update');
    Route::post('/project-types/{project_type}/move', [AdminProjectTypeController::class, 'move'])->name('project-types.move');
    Route::delete('/project-types/{project_type}', [AdminProjectTypeController::class, 'destroy'])->name('project-types.destroy');
});

require __DIR__ . '/auth.php';
