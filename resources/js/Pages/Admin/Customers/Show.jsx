import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Show({ customer, statuses }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const project = customer.projects?.[0];

    const statusForm = useForm({
        status: project?.status ?? 'scheduled_shoot_date',
        scheduled_shoot_date: project?.scheduled_shoot_date ?? '',
    });
    const mediaForm = useForm({
        media_link: project?.media_link ?? '',
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {customer.name}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {!customer.has_portal_access ? (
                            <Link
                                href={route('admin.customers.invite', customer.id)}
                                method="post"
                                as="button"
                                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                                Invite to Portal
                            </Link>
                        ) : (
                            <Link
                                href={route('admin.customers.send-password-reset', customer.id)}
                                method="post"
                                as="button"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Send password reset link
                            </Link>
                        )}
                        <Link
                            href={route('admin.customers.edit', customer.id)}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Edit Customer
                        </Link>
                        <Link
                            href={route('admin.customers.index')}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Back to Customers
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={customer.name} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {flash?.success && (
                        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                            {flash.success}
                        </div>
                    )}
                    {flash?.info && (
                        <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
                            {flash.info}
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        <p className="text-sm text-gray-600">
                            <strong>Email:</strong> {customer.email}
                            {customer.phone && (
                                <> · <strong>Phone:</strong> {customer.phone}</>
                            )}
                        </p>
                        {customer.has_portal_access && (
                            <p className="mt-2 text-sm text-green-600">
                                Customer can log in to view status and media.
                            </p>
                        )}
                    </div>

                    {project ? (
                        <>
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Update status
                                </h3>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        statusForm.patch(
                                            route('admin.projects.update-status', project.id)
                                        );
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <InputLabel value="Status" />
                                        <select
                                            value={statusForm.data.status}
                                            onChange={(e) =>
                                                statusForm.setData('status', e.target.value)
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            {Object.entries(statuses).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={statusForm.errors.status} />
                                    </div>
                                    <div>
                                        <InputLabel value="Scheduled shoot date" />
                                        <TextInput
                                            type="date"
                                            value={statusForm.data.scheduled_shoot_date}
                                            className="mt-1 block w-full"
                                            onChange={(e) =>
                                                statusForm.setData(
                                                    'scheduled_shoot_date',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <InputError message={statusForm.errors.scheduled_shoot_date} />
                                    </div>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={statusForm.processing}
                                    >
                                        Update status (sends email & SMS)
                                    </PrimaryButton>
                                </form>
                            </div>

                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Media link (photos/videos)
                                </h3>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        mediaForm.patch(
                                            route('admin.projects.update-media-link', project.id)
                                        );
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <InputLabel value="Link URL" />
                                        <TextInput
                                            type="url"
                                            value={mediaForm.data.media_link}
                                            className="mt-1 block w-full"
                                            placeholder="https://..."
                                            onChange={(e) =>
                                                mediaForm.setData('media_link', e.target.value)
                                            }
                                        />
                                        <InputError message={mediaForm.errors.media_link} />
                                        <p className="mt-1 text-sm text-gray-500">
                                            This link will be sent to the customer and shown in their portal.
                                        </p>
                                    </div>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={mediaForm.processing}
                                    >
                                        Save media link (sends email & SMS)
                                    </PrimaryButton>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                            <p className="text-gray-500">No project yet. Edit customer to add details.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
