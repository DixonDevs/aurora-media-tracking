import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Checkbox from '@/Components/Checkbox';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const defaultProjectName = 'New Project';
const isDefaultName = (name) =>
    !name || name === 'New project' || name === defaultProjectName;

export default function Show({ project, customer, statuses, project_type_options = [] }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const pageErrors = props.errors || {};
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const isArchived = project.is_archived;

    const links = project.media_links ?? [];
    const form = useForm({
        name: isDefaultName(project.name) ? defaultProjectName : project.name,
        scheduled_shoot_date: project.scheduled_shoot_date ?? '',
        status: project.status ?? 'scheduled_shoot_date',
        media_links: links.length > 0 ? [...links] : [''],
        project_types: Array.isArray(project.project_types) ? project.project_types.map((id) => Number(id)) : [],
    });

    const handleNameFocus = () => {
        if (form.data.name === defaultProjectName) form.setData('name', '');
    };
    const handleNameBlur = () => {
        if (form.data.name.trim() === '') form.setData('name', defaultProjectName);
    };

    const hasRealProjectName =
        form.data.name.trim() !== '' && form.data.name !== defaultProjectName;

    const toggleProjectType = (id) => {
        const current = form.data.project_types || [];
        const numId = Number(id);
        const next = current.includes(numId)
            ? current.filter((x) => Number(x) !== numId)
            : [...current, numId];
        form.setData('project_types', next);
    };

    const setMediaLink = (index, value) => {
        const next = [...(form.data.media_links || [])];
        next[index] = value;
        form.setData('media_links', next);
    };
    const addMediaLink = () => {
        form.setData('media_links', [...(form.data.media_links || []), '']);
    };
    const removeMediaLink = (index) => {
        const next = form.data.media_links.filter((_, i) => i !== index);
        form.setData('media_links', next.length ? next : ['']);
    };

    const mediaLinksList = form.data.media_links?.length ? form.data.media_links : [''];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isArchived || !hasRealProjectName) return;
        const links = (form.data.media_links || [])
            .map((u) => (typeof u === 'string' ? u : '').trim())
            .filter(Boolean);
        const statusKey = form.data.status && statuses && Object.prototype.hasOwnProperty.call(statuses, form.data.status)
            ? form.data.status
            : 'scheduled_shoot_date';
        const payload = {
            name: form.data.name.trim(),
            status: statusKey,
            scheduled_shoot_date: form.data.scheduled_shoot_date || null,
            media_links: links.length ? links : [],
            project_types: form.data.project_types || [],
        };
        setSaving(true);
        router.patch(route('admin.projects.update', project.id), payload, {
            onFinish: () => setSaving(false),
        });
    };

    const statusEntries = Object.entries(statuses || {});

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Link href={route('admin.customers.index')} className="hover:text-gray-700 truncate">
                                Customers
                            </Link>
                            <span aria-hidden className="text-gray-400">/</span>
                            <Link href={route('admin.customers.show', customer.id)} className="hover:text-gray-700 truncate">
                                {customer.name}
                            </Link>
                            <span aria-hidden className="text-gray-400">/</span>
                            <span className="font-medium text-gray-900 truncate" title={project.name}>
                                {hasRealProjectName ? form.data.name : 'New project'}
                            </span>
                        </nav>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 truncate">
                            {hasRealProjectName ? form.data.name : 'New project'}
                        </h1>
                    </div>
                    <Link
                        href={route('admin.customers.show', customer.id)}
                        className="shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        Back to customer
                    </Link>
                </div>
            }
        >
            <Head title={`${project.name} – ${customer.name}`} />

            <div className="flex min-h-0 flex-1 flex-col bg-gray-50/80">
                <div className="flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash?.info && (
                        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                            {flash.info}
                        </div>
                    )}

                    {isArchived && (
                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            This project is archived. You can restore it to active or delete it below.
                        </div>
                    )}

                    <form id="project-form" onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
                        {/* Left column: details + progress */}
                        <div className="flex min-h-0 flex-1 flex-col gap-6 min-w-0">
                            {/* Details card */}
                            <div className="flex shrink-0 flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Project details
                                    </h2>
                                </div>
                                <div className="p-5 space-y-5">
                                    <div>
                                        <InputLabel value="Project name" />
                                        <TextInput
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            onFocus={handleNameFocus}
                                            onBlur={handleNameBlur}
                                            className={`mt-1.5 block w-full rounded-lg text-base ${form.data.name === defaultProjectName ? 'text-gray-400 placeholder-gray-400' : 'text-gray-900'}`}
                                            placeholder="e.g. Spring 2025 shoot"
                                            required
                                            disabled={isArchived}
                                        />
                                        <InputError message={form.errors.name || pageErrors.name} />
                                        {!hasRealProjectName && form.data.name === defaultProjectName && (
                                            <p className="mt-1.5 text-sm text-gray-500">
                                                Enter a project name to enable saving.
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <InputLabel value="Scheduled shoot date" />
                                        <TextInput
                                            type="date"
                                            value={form.data.scheduled_shoot_date}
                                            className="mt-1.5 block w-full rounded-lg max-w-xs"
                                            onChange={(e) => form.setData('scheduled_shoot_date', e.target.value)}
                                            disabled={isArchived}
                                        />
                                        <InputError message={form.errors.scheduled_shoot_date || pageErrors.scheduled_shoot_date} />
                                    </div>
                                    <div>
                                        <InputLabel value="Project types" />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Select all that apply.
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-4">
                                            {(Array.isArray(project_type_options) ? project_type_options : []).map((opt) => (
                                                <label
                                                    key={opt.id}
                                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-800"
                                                >
                                                    <Checkbox
                                                        checked={(form.data.project_types || []).includes(Number(opt.id))}
                                                        onChange={() => toggleProjectType(opt.id)}
                                                        disabled={isArchived}
                                                    />
                                                    <span>{opt.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <InputError message={form.errors.project_types || pageErrors.project_types} />
                                    </div>
                                </div>
                            </div>

                            {/* Progress (status) – green cards */}
                            {!isArchived && (
                                <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
                                    <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3 shrink-0">
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Progress
                                        </h2>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Select the current step. The selected step is highlighted in green.
                                        </p>
                                    </div>
                                    <div className="p-5 flex-1 min-h-0 overflow-auto">
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                                            {statusEntries.map(([value, label]) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => form.setData('status', value)}
                                                    className={`flex h-14 w-full items-center rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition [&>span]:line-clamp-2 [&>span]:break-words ${form.data.status === value
                                                        ? 'border-green-500 bg-green-50 text-green-800'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="w-full">{label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <InputError message={form.errors.status || pageErrors.status} className="mt-3" />
                                    </div>
                                </div>
                            )}

                            {isArchived && <div className="flex-1 min-h-0" />}
                        </div>

                        {/* Right column: media links or summary */}
                        <div className="flex min-h-0 flex-1 flex-col gap-6 min-w-0">
                            {!isArchived ? (
                                <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
                                    <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3 shrink-0">
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Media links
                                        </h2>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Customer is notified when status is &quot;Ready to view&quot; and you save.
                                        </p>
                                    </div>
                                    <div className="p-5 flex-1 min-h-0 overflow-auto space-y-3">
                                        {mediaLinksList.map((url, index) => (
                                            <div key={index} className="flex gap-2">
                                                <TextInput
                                                    type="url"
                                                    value={typeof url === 'string' ? url : ''}
                                                    className="block flex-1 rounded-lg"
                                                    placeholder="https://..."
                                                    onChange={(e) => setMediaLink(index, e.target.value)}
                                                />
                                                {mediaLinksList.length > 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMediaLink(index)}
                                                        className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <span className="w-16 shrink-0" aria-hidden />
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addMediaLink}
                                            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                                        >
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add link
                                        </button>
                                        <InputError message={form.errors['media_links.0'] || form.errors.media_links || pageErrors['media_links.0'] || pageErrors.media_links} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
                                    <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3 shrink-0">
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Summary
                                        </h2>
                                    </div>
                                    <dl className="p-5 space-y-4">
                                        <div>
                                            <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Status</dt>
                                            <dd className="mt-1 text-sm font-medium text-gray-900">{project.status_label}</dd>
                                        </div>
                                        {project.scheduled_shoot_date && (
                                            <div>
                                                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Scheduled shoot date</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{project.scheduled_shoot_date}</dd>
                                            </div>
                                        )}
                                        {(project.project_types ?? []).length > 0 && (
                                            <div>
                                                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Project types</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {(project.project_types ?? []).map((id) => (Array.isArray(project_type_options) ? project_type_options.find((o) => Number(o.id) === Number(id))?.name : null) ?? id).join(', ')}
                                                </dd>
                                            </div>
                                        )}
                                        {(project.media_links ?? []).length > 0 && (
                                            <div>
                                                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Media links</dt>
                                                <dd className="mt-2 space-y-1.5">
                                                    {(project.media_links ?? []).map((url, i) => (
                                                        <a
                                                            key={i}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-sm text-indigo-600 hover:underline truncate"
                                                        >
                                                            {url}
                                                        </a>
                                                    ))}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Save + Project actions – full width bar */}
                    <div className="mt-6 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {!isArchived && (
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:flex-1">
                                {!hasRealProjectName && (
                                    <span className="text-sm text-gray-500 sm:mr-4">
                                        Name the project above to enable saving.
                                    </span>
                                )}
                                <PrimaryButton
                                    type="submit"
                                    form="project-form"
                                    disabled={saving || !hasRealProjectName}
                                    className="w-full sm:w-auto"
                                >
                                    {saving ? 'Saving…' : 'Save changes'}
                                </PrimaryButton>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-3">
                            {!isArchived && (
                                <Link
                                    href={route('admin.projects.complete', project.id)}
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Complete & archive
                                </Link>
                            )}
                            {isArchived && (
                                <Link
                                    href={route('admin.projects.unarchive', project.id)}
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Restore to active
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete project
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} maxWidth="sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Delete project?</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        &quot;{project.name}&quot; will be permanently deleted. This cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </SecondaryButton>
                        <Link href={route('admin.projects.destroy', project.id)} method="delete" as="button">
                            <DangerButton>Delete project</DangerButton>
                        </Link>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
