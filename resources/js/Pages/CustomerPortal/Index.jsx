import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ customer, projects }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Projects
                </h2>
            }
        >
            <Head title="My Projects" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <p className="mb-6 text-gray-600">
                        Hello, {customer.name}. Here is the status of your project(s).
                    </p>

                    <div className="space-y-6">
                        {projects.length === 0 ? (
                            <div className="rounded-lg bg-white p-6 shadow-sm">
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
                                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">
                                                Status
                                            </span>
                                            <p className="mt-0.5 rounded-md bg-indigo-50 px-2 py-1 text-sm font-medium text-indigo-800 inline-block">
                                                {project.status_label}
                                            </p>
                                        </div>
                                        {project.scheduled_shoot_date && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">
                                                    Scheduled shoot date
                                                </span>
                                                <p className="mt-0.5 text-gray-900">
                                                    {project.scheduled_shoot_date}
                                                </p>
                                            </div>
                                        )}
                                        {project.media_link && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">
                                                    Your photos / videos
                                                </span>
                                                <p className="mt-1">
                                                    <a
                                                        href={project.media_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:text-indigo-800 underline"
                                                    >
                                                        View your media →
                                                    </a>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
