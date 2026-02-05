import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ customer }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? '',
        address: customer.address ?? '',
        job: customer.job ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const confirmUpdate = () => {
        setShowConfirm(false);
        put(route('admin.customers.update', customer.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Customer
                </h2>
            }
        >
            <Head title="Edit Customer" />

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
                            <div>
                                <InputLabel htmlFor="address" value="Address (optional)" />
                                <textarea
                                    id="address"
                                    rows={3}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <InputError message={errors.address} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="job" value="Job (optional)" />
                                <TextInput
                                    id="job"
                                    value={data.job}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('job', e.target.value)}
                                />
                                <InputError message={errors.job} className="mt-1" />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Link
                                    href={route('admin.customers.show', customer.id)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton type="submit" disabled={processing}>
                                    Save
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Modal show={showConfirm} onClose={() => setShowConfirm(false)} maxWidth="sm">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Save changes?
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to update this customer's information? This will
                        save changes to the database.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowConfirm(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton onClick={confirmUpdate} disabled={processing}>
                            Yes, update customer
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
