import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function NoAccess() {
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
                    <div className="rounded-lg bg-amber-50 p-6 text-amber-800">
                        <p className="font-medium">No project access</p>
                        <p className="mt-1 text-sm">
                            Your account is not linked to a customer record. If you were invited to view your project status, please use the link from your invitation email. Otherwise, contact the studio for access.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
