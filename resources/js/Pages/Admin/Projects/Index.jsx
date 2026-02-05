import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ activeProjectsByCustomer }) {
    const hasProjects = activeProjectsByCustomer?.length > 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Active projects
                    </h2>
                    <Link
                        href={route('admin.customers.index')}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Customers
                    </Link>
                </div>
            }
        >
            <Head title="Active projects" />

            <div className="flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
                {!hasProjects ? (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-gray-500">No active projects yet.</p>
                        <p className="mt-1 text-sm text-gray-400">Add a project from a customer profile.</p>
                        <Link
                            href={route('admin.customers.index')}
                            className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            View customers
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col gap-6">
                        {activeProjectsByCustomer.map(({ customer, projects }) => (
                            <section
                                key={customer.id}
                                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                            >
                                <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                                    <Link
                                        href={route('admin.customers.show', customer.id)}
                                        className="font-semibold text-gray-900 hover:text-indigo-600"
                                    >
                                        {customer.name}
                                    </Link>
                                    <span className="ml-2 text-sm text-gray-500">
                                        {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3 p-4">
                                    {projects.map((project) => (
                                        <Link
                                            key={project.id}
                                            href={route('admin.projects.show', project.id)}
                                            className="flex min-w-0 flex-1 basis-64 flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/30"
                                        >
                                            <p className="font-medium text-gray-900 truncate" title={project.name}>
                                                {project.name}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                                                    {project.status_label}
                                                </span>
                                                {project.scheduled_shoot_date && (
                                                    <span className="text-xs text-gray-500">
                                                        {project.scheduled_shoot_date}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="mt-2 text-sm font-medium text-indigo-600">
                                                Update status →
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
