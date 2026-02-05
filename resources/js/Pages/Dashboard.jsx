import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({
    isAdmin,
    customersCount,
    activeProjectsCount,
    recentCustomers,
    customerName,
    projects,
}) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {isAdmin ? (
                        <>
                            <div className="mb-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Welcome back
                                    </h3>
                                    <p className="mt-1 text-gray-600">
                                        Manage your customers and track project statuses from here.
                                    </p>
                                </div>
                            </div>
                            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Link
                                    href={route('admin.customers.index')}
                                    className="block overflow-hidden bg-white shadow-sm sm:rounded-lg transition hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2"
                                >
                                    <div className="p-6">
                                        <p className="text-sm font-medium text-gray-500">
                                            Total customers
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                                            {customersCount}
                                        </p>
                                        <span className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                            View all →
                                        </span>
                                    </div>
                                </Link>
                                <Link
                                    href={route('admin.projects.index')}
                                    className="block overflow-hidden bg-white shadow-sm sm:rounded-lg transition hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2"
                                >
                                    <div className="p-6">
                                        <p className="text-sm font-medium text-gray-500">
                                            Active projects
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                                            {activeProjectsCount ?? 0}
                                        </p>
                                        <span className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                            View active projects →
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900">
                                            Recent customers
                                        </h3>
                                        <Link
                                            href={route('admin.customers.create')}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                            Add customer
                                        </Link>
                                    </div>
                                </div>
                                <ul className="divide-y divide-gray-200">
                                    {recentCustomers?.length === 0 ? (
                                        <li className="px-4 py-8 text-center text-sm text-gray-500">
                                            No customers yet.{' '}
                                            <Link
                                                href={route('admin.customers.create')}
                                                className="font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                Add your first customer
                                            </Link>
                                        </li>
                                    ) : (
                                        recentCustomers?.map((customer) => (
                                            <li key={customer.id}>
                                                <Link
                                                    href={route('admin.customers.show', customer.id)}
                                                    className="block px-4 py-3 hover:bg-gray-50"
                                                >
                                                    <p className="font-medium text-gray-900">
                                                        {customer.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {customer.email}
                                                    </p>
                                                </Link>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Hello{customerName ? `, ${customerName}` : ''}
                                    </h3>
                                    <p className="mt-1 text-gray-600">
                                        Here is the status of your project(s).
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {!projects?.length ? (
                                    <div className="overflow-hidden rounded-lg bg-white p-6 shadow-sm">
                                        <p className="text-gray-500">
                                            You don't have any projects yet. Contact us if you expect to see one here.
                                        </p>
                                    </div>
                                ) : (
                                    projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="overflow-hidden rounded-lg bg-white shadow-sm"
                                        >
                                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                                <h3 className="font-medium text-gray-900">
                                                    {project.name}
                                                </h3>
                                            </div>
                                            <div className="p-4 space-y-2">
                                                <p>
                                                    <span className="text-sm text-gray-500">
                                                        Status:{' '}
                                                    </span>
                                                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-sm font-medium text-indigo-800">
                                                        {project.status_label}
                                                    </span>
                                                </p>
                                                {project.scheduled_shoot_date && (
                                                    <p className="text-sm text-gray-600">
                                                        Scheduled: {project.scheduled_shoot_date}
                                                    </p>
                                                )}
                                                {(project.media_links?.length ?? 0) > 0 && (
                                                    <p className="pt-2">
                                                        <a
                                                            href={project.media_links[0]}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 hover:text-indigo-800 underline"
                                                        >
                                                            View your photos/videos →
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-6">
                                <Link
                                    href={route('customer-portal.index')}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                    View full project details →
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
