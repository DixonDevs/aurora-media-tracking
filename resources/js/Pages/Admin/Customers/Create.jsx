import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        send_invite: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.customers.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Add Customer
                </h2>
            }
        >
            <Head title="Add Customer" />

            <div className="py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="phone" value="Phone (for SMS updates)" />
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                <InputError message={errors.phone} className="mt-1" />
                            </div>
                            <div className="flex items-start gap-3">
                                <input
                                    id="send_invite"
                                    type="checkbox"
                                    checked={data.send_invite}
                                    onChange={(e) => setData('send_invite', e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <InputLabel htmlFor="send_invite" value="Send portal invite (password reset email)" className="font-medium" />
                                    <p className="mt-0.5 text-sm text-gray-500">
                                        They’ll get an email to set their password and log in to view their project status.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <PrimaryButton disabled={processing}>
                                    Add Customer
                                </PrimaryButton>
                                <Link
                                    href={route('admin.customers.index')}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
