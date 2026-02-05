import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import Drawer from '@/Components/Drawer';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ customer }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const projects = customer.projects ?? [];
    const activeProjects = projects.filter((p) => !p.is_archived);

    const closeDrawer = () => setShowDrawer(false);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Customer Name: {customer.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.customers.index')}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Back to Customers
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowDrawer(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                            </svg>
                            Actions
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={customer.name} />

            <div className="flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
                {/* Flash messages - full width */}
                <div className="flex flex-col gap-2 pb-4">
                    {flash?.success && (
                        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash?.info && (
                        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                            {flash.info}
                        </div>
                    )}
                </div>

                {/* Main content: sidebar + projects - full width flex */}
                <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
                    {/* Left: Profile + stats */}
                    <aside className="flex shrink-0 flex-col gap-4 lg:w-80">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                                    Profile
                                </h3>
                            </div>
                            <dl className="divide-y divide-gray-100">
                                <div className="px-5 py-4">
                                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Customer name</dt>
                                    <dd className="mt-1 text-sm font-medium text-gray-900">{customer.name}</dd>
                                </div>
                                <div className="px-5 py-4">
                                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
                                </div>
                                {customer.phone && (
                                    <div className="px-5 py-4">
                                        <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Phone</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{customer.phone}</dd>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="px-5 py-4">
                                        <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Address</dt>
                                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{customer.address}</dd>
                                    </div>
                                )}
                                {customer.job && (
                                    <div className="px-5 py-4">
                                        <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Job</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{customer.job}</dd>
                                    </div>
                                )}
                                <div className="px-5 py-4">
                                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Portal access</dt>
                                    <dd className="mt-1">
                                        {customer.has_portal_access ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-medium text-green-800">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
                                                Can log in
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-500">No access</span>
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Projects</p>
                            <p className="mt-2 text-2xl font-semibold text-gray-900">{customer.projects_count}</p>
                            {customer.projects_count > 0 && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {customer.active_projects_count} active
                                    {customer.archived_projects_count > 0 && ` · ${customer.archived_projects_count} archived`}
                                </p>
                            )}
                        </div>
                    </aside>

                    {/* Right: Active projects list - flex-1 to use remaining space */}
                    <section className="flex min-h-0 flex-1 flex-col">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Active projects</h3>
                            <Link
                                href={route('admin.customers.projects.store', customer.id)}
                                method="post"
                                as="button"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Add New Project
                            </Link>
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            {activeProjects.length > 0 ? (
                                <ul className="flex-1 divide-y divide-gray-200 overflow-y-auto">
                                    {activeProjects.map((project) => (
                                        <li key={project.id}>
                                            <Link
                                                href={route('admin.projects.show', project.id)}
                                                className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 hover:bg-gray-50 transition"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{project.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {project.status_label}
                                                        {project.scheduled_shoot_date && <> · {project.scheduled_shoot_date}</>}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-indigo-600 text-sm font-medium">Update status →</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                                    <p className="text-gray-500">No active projects yet.</p>
                                    <p className="mt-1 text-sm text-gray-400">Add a project above or view archived projects in Actions.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <Drawer show={showDrawer} onClose={closeDrawer} title="Customer actions">
                <div className="space-y-2">
                    {!customer.has_portal_access ? (
                        <Link
                            href={route('admin.customers.invite', customer.id)}
                            method="post"
                            as="button"
                            onClick={closeDrawer}
                            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </span>
                            Invite to Portal
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('admin.customers.send-password-reset', customer.id)}
                                method="post"
                                as="button"
                                onClick={closeDrawer}
                                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                </span>
                                Send password reset link
                            </Link>
                            <button
                                type="button"
                                onClick={() => { closeDrawer(); setShowRevokeModal(true); }}
                                className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                </span>
                                Revoke portal access
                            </button>
                        </>
                    )}
                    <Link
                        href={route('admin.customers.edit', customer.id)}
                        onClick={closeDrawer}
                        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </span>
                        Edit Customer
                    </Link>
                    <Link
                        href={route('admin.customers.archived-projects', customer.id)}
                        onClick={closeDrawer}
                        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        </span>
                        Archive ({customer.archived_projects_count ?? 0} projects)
                    </Link>
                    <button
                        type="button"
                        onClick={() => { closeDrawer(); setShowDeleteModal(true); }}
                        className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </span>
                        Delete customer
                    </button>
                </div>
            </Drawer>

            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="sm">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">Delete customer?</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        &quot;{customer.name}&quot; will be removed from the customers list. Their projects and data are kept and can be restored later if needed.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <Link
                            href={route('admin.customers.destroy', customer.id)}
                            method="delete"
                            as="button"
                        >
                            <DangerButton>Delete customer</DangerButton>
                        </Link>
                    </div>
                </div>
            </Modal>

            <Modal show={showRevokeModal} onClose={() => setShowRevokeModal(false)} maxWidth="sm">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">Revoke portal access?</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        {customer.name} will no longer be able to log in to view their projects. You can invite them again later if needed.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowRevokeModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <Link
                            href={route('admin.customers.revoke-portal', customer.id)}
                            method="post"
                            as="button"
                        >
                            <DangerButton>Revoke access</DangerButton>
                        </Link>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
