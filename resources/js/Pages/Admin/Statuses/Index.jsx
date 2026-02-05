import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function cloneStatuses(list) {
    return list.map((s) => ({ ...s, id: s.id ?? null }));
}

export default function Index({ statuses: initialStatuses }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [localStatuses, setLocalStatuses] = useState(() => cloneStatuses(initialStatuses));
    const [addKey, setAddKey] = useState('');
    const [addLabel, setAddLabel] = useState('');
    const [addError, setAddError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLocalStatuses(cloneStatuses(initialStatuses));
    }, [initialStatuses]);

    const addToLocal = () => {
        const key = addKey.trim().toLowerCase().replace(/\s+/g, '_');
        if (!key) {
            setAddError('Key is required.');
            return;
        }
        if (!/^[a-z0-9_]+$/.test(key)) {
            setAddError('Key must be lowercase letters, numbers, and underscores only.');
            return;
        }
        if (localStatuses.some((s) => (s.key || '').toLowerCase() === key)) {
            setAddError('This key already exists.');
            return;
        }
        const label = addLabel.trim() || key;
        setLocalStatuses((prev) => [
            ...prev,
            { id: null, key, label, is_visible: true, projects_count: 0, sort_order: prev.length },
        ]);
        setAddKey('');
        setAddLabel('');
        setAddError(null);
    };

    const updateLocal = (index, updates) => {
        setLocalStatuses((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    };

    const moveLocal = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= localStatuses.length) return;
        setLocalStatuses((prev) => {
            const next = [...prev];
            const tmp = next[index];
            next[index] = next[newIndex];
            next[newIndex] = tmp;
            return next;
        });
    };

    const removeLocal = (index) => {
        const s = localStatuses[index];
        if (s.id != null && s.projects_count > 0) return;
        setLocalStatuses((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        setSaving(true);
        const payload = {
            statuses: localStatuses.map((s, index) => ({
                id: s.id || undefined,
                key: s.key,
                label: s.label,
                is_visible: s.is_visible,
            })),
        };
        router.put(route('admin.statuses.sync'), payload, {
            onSuccess: () => router.visit(route('admin.customers.index')),
            onError: () => setSaving(false),
            onFinish: () => setSaving(false),
        });
    };

    const handleCancel = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit(route('dashboard'));
        }
    };

    const cellInputClass = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Project statuses
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
            <Head title="Project statuses" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
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
                        Edit labels and visibility below. Use the arrows to change order. Click <strong>Save</strong> to apply changes or <strong>Cancel</strong> to revert.
                    </p>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-20 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Order
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Key
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Label
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Show in forms
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
                                {/* Add new row */}
                                <tr className="bg-gray-50/50">
                                    <td className="w-20 px-4 py-3 text-sm text-gray-400">—</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={addKey}
                                            onChange={(e) => { setAddKey(e.target.value); setAddError(null); }}
                                            placeholder="e.g. in_review"
                                            className={cellInputClass}
                                        />
                                        {addError && <p className="mt-1 text-xs text-red-600">{addError}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={addLabel}
                                            onChange={(e) => setAddLabel(e.target.value)}
                                            placeholder="e.g. In Review"
                                            className={cellInputClass}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">—</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">—</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={addToLocal}
                                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </td>
                                </tr>

                                {localStatuses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                            No statuses yet. Add one above.
                                        </td>
                                    </tr>
                                ) : (
                                    localStatuses.map((s, index) => (
                                        <tr key={s.id ?? `new-${s.key}-${index}`} className="bg-white">
                                            <td className="w-20 whitespace-nowrap px-4 py-3">
                                                <span className="inline-flex items-center gap-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveLocal(index, 'up')}
                                                        disabled={index === 0}
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40 disabled:pointer-events-none"
                                                        title="Move up"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveLocal(index, 'down')}
                                                        disabled={index === localStatuses.length - 1}
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40 disabled:pointer-events-none"
                                                        title="Move down"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-600">
                                                {s.key}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={s.label}
                                                    onChange={(e) => updateLocal(index, { label: e.target.value })}
                                                    className={cellInputClass + ' max-w-xs'}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <label className="inline-flex items-center gap-2">
                                                    <Checkbox
                                                        checked={!!s.is_visible}
                                                        onChange={(e) => updateLocal(index, { is_visible: e.target.checked })}
                                                    />
                                                    <span className="text-sm text-gray-600">
                                                        {s.is_visible ? 'Yes' : 'No'}
                                                    </span>
                                                </label>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                {s.projects_count ?? 0}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLocal(index)}
                                                    disabled={(s.projects_count ?? 0) > 0}
                                                    className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                                                    title={(s.projects_count ?? 0) > 0 ? 'Move projects to another status first' : 'Remove from list (saved when you click Save)'}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <SecondaryButton type="button" onClick={handleCancel} disabled={saving}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="button" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving…' : 'Save'}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
