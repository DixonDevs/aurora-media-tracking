import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ArchivedProjects({ customer, archivedProjects }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Archived projects — {customer.name}
                    </h2>
                    <Link
                        href={route('admin.customers.show', customer.id)}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Back to customer
                    </Link>
                </div>
            }
        >
            <Head title={`Archived projects — ${customer.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {archivedProjects.length === 0 ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                            <p className="text-gray-500">No archived projects yet.</p>
                            <Link
                                href={route('admin.customers.show', customer.id)}
                                className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                ← Back to customer
                            </Link>
                        </div>
                    ) : (
                        <ul className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-200">
                            {archivedProjects.map((project) => (
                                <li
                                    key={project.id}
                                    className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 hover:bg-gray-50 transition"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{project.name}</p>
                                        <p className="text-sm text-gray-500">
                                            Completed{' '}
                                            {project.completed_at
                                                ? new Date(project.completed_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })
                                                : ''}
                                            {(project.media_links?.length ?? 0) > 0 && (
                                                <>
                                                    {' · '}
                                                    <a
                                                        href={project.media_links[0]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:underline"
                                                    >
                                                        Media link
                                                        {project.media_links.length > 1
                                                            ? ` (+${project.media_links.length - 1})`
                                                            : ''}
                                                    </a>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                            {project.status_label}
                                        </span>
                                        <Link
                                            href={route('admin.projects.show', project.id)}
                                            className="text-indigo-600 text-sm font-medium hover:underline"
                                        >
                                            View details →
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
