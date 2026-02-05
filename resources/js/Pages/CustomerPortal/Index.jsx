import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

function ProjectCard({ project, isArchived = false }) {
    return (
        <div
            className={`overflow-hidden rounded-lg bg-white shadow-sm ${isArchived ? 'opacity-90 border border-gray-200' : ''
                }`}
        >
            <div
                className={`border-b border-gray-200 px-4 py-3 ${isArchived ? 'bg-gray-100' : 'bg-gray-50'
                    }`}
            >
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                {isArchived && project.completed_at && (
                    <p className="text-xs text-gray-500 mt-0.5">
                        Completed {project.completed_at}
                    </p>
                )}
            </div>
            <div className="p-4 space-y-3">
                <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <p className="mt-0.5 rounded-md bg-indigo-50 px-2 py-1 text-sm font-medium text-indigo-800 inline-block">
                        {project.status_label}
                    </p>
                </div>
                {project.scheduled_shoot_date && (
                    <div>
                        <span className="text-sm font-medium text-gray-500">
                            Scheduled shoot date
                        </span>
                        <p className="mt-0.5 text-gray-900">{project.scheduled_shoot_date}</p>
                    </div>
                )}
                {(project.media_links?.length ?? 0) > 0 && (
                    <div>
                        <span className="text-sm font-medium text-gray-500">
                            Your photos / videos
                        </span>
                        <div className="mt-1 space-y-1">
                            {project.media_links.map((url, i) => (
                                <p key={i}>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 underline"
                                    >
                                        View your media {project.media_links.length > 1 ? `#${i + 1}` : ''} →
                                    </a>
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

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
                            <>
                                {projects.filter((p) => !p.is_archived).length > 0 && (
                                    <>
                                        <h3 className="text-sm font-medium text-gray-700">
                                            Current projects
                                        </h3>
                                        {projects
                                            .filter((p) => !p.is_archived)
                                            .map((project) => (
                                                <ProjectCard key={project.id} project={project} />
                                            ))}
                                    </>
                                )}
                                {projects.filter((p) => p.is_archived).length > 0 && (
                                    <>
                                        <h3 className="text-sm font-medium text-gray-700 mt-6">
                                            Past projects
                                        </h3>
                                        {projects
                                            .filter((p) => p.is_archived)
                                            .map((project) => (
                                                <ProjectCard
                                                    key={project.id}
                                                    project={project}
                                                    isArchived
                                                />
                                            ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
