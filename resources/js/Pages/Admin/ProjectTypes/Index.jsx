import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ project_types: initialProjectTypes }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [addName, setAddName] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!addName.trim()) return;
        setSaving(true);
        router.post(route('admin.project-types.store'), { name: addName.trim() }, {
            onSuccess: () => setAddName(''),
            onFinish: () => setSaving(false),
        });
    };

    const startEdit = (type) => {
        setEditingId(type.id);
        setEditName(type.name);
    };

    const saveEdit = () => {
        if (editingId == null) return;
        const name = editName.trim();
        if (!name) {
            setEditingId(null);
            return;
        }
        setSaving(true);
        router.patch(route('admin.project-types.update', editingId), { name }, {
            onSuccess: () => { setEditingId(null); setEditName(''); },
            onFinish: () => setSaving(false),
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleMove = (id, direction) => {
        setSaving(true);
        router.post(route('admin.project-types.move', id), { direction }, {
            onFinish: () => setSaving(false),
        });
    };

    const handleDelete = (id, projectsCount) => {
        if (projectsCount > 0) return;
        if (!confirm('Remove this project type?')) return;
        setSaving(true);
        router.delete(route('admin.project-types.destroy', id), {
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Project types
                    </h2>
                    <Link
                        href={route('admin.customers.index')}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Back to Customers
                    </Link>
                </div>
            }
        >
            <Head title="Project types" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8 space-y-6">
                    {flash?.success && (
                        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                            {flash.error}
                        </div>
                    )}
                    {flash?.info && (
                        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                            {flash.info}
                        </div>
                    )}

                    <p className="text-sm text-gray-600">
                        Add and reorder project types. These appear as options when editing a project (e.g. Photography, Videography, Drone).
                    </p>

                    <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
                        <div className="min-w-0 flex-1">
                            <label htmlFor="add-name" className="sr-only">New project type name</label>
                            <TextInput
                                id="add-name"
                                type="text"
                                value={addName}
                                onChange={(e) => setAddName(e.target.value)}
                                placeholder="e.g. Photography"
                                className="block w-full"
                            />
                        </div>
                        <PrimaryButton type="submit" disabled={saving || !addName.trim()}>
                            Add project type
                        </PrimaryButton>
                    </form>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-20 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Order
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Projects
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {initialProjectTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                            No project types yet. Add one above.
                                        </td>
                                    </tr>
                                ) : (
                                    initialProjectTypes.map((type, index) => (
                                        <tr key={type.id}>
                                            <td className="w-20 whitespace-nowrap px-4 py-3">
                                                <span className="inline-flex items-center gap-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMove(type.id, 'up')}
                                                        disabled={index === 0 || saving}
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40 disabled:pointer-events-none"
                                                        title="Move up"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMove(type.id, 'down')}
                                                        disabled={index === initialProjectTypes.length - 1 || saving}
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40 disabled:pointer-events-none"
                                                        title="Move down"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {editingId === type.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <TextInput
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                            className="block w-full max-w-xs"
                                                            autoFocus
                                                        />
                                                        <SecondaryButton type="button" onClick={cancelEdit} className="shrink-0">
                                                            Cancel
                                                        </SecondaryButton>
                                                        <PrimaryButton type="button" onClick={saveEdit} disabled={saving} className="shrink-0">
                                                            Save
                                                        </PrimaryButton>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(type)}
                                                        className="text-left text-sm font-medium text-gray-900 hover:text-indigo-600"
                                                    >
                                                        {type.name}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                {type.projects_count ?? 0}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(type.id, type.projects_count ?? 0)}
                                                    disabled={(type.projects_count ?? 0) > 0 || saving}
                                                    className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={(type.projects_count ?? 0) > 0 ? 'Remove from projects first' : 'Delete'}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
