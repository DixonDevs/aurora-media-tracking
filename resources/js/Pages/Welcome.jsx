import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, canLogin }) {
    return (
        <>
            <Head title="View Your Project Status | Aurora Media Tracking" />

            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <span className="text-xl font-semibold tracking-tight text-slate-800">
                            Aurora Media Tracking
                        </span>
                        <nav className="flex items-center gap-4">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                                >
                                    View my project
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                                        >
                                            Log in
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero - client-focused */}
                <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                            Check your project status
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
                            Log in to see where your shoot stands—and when your photos or videos are ready, access them here.
                        </p>
                        {!auth?.user && canLogin && (
                            <div className="mt-10">
                                <Link
                                    href={route('login')}
                                    className="inline-flex rounded-lg bg-indigo-600 px-8 py-4 text-base font-medium text-white shadow-sm transition hover:bg-indigo-700"
                                >
                                    Log in to view my project
                                </Link>
                                <p className="mt-4 text-sm text-slate-500">
                                    Use the email and password from your invitation.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* What clients get */}
                    <div className="mt-24 grid gap-8 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-slate-900">See your status</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                From scheduled shoot to editing to ready to view—see exactly where your project is.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-slate-900">Get notified</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                We’ll email and text you when your status changes or when your media is ready.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-slate-900">View your media</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                When your photos or videos are ready, your link to view them will appear here.
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-slate-200 bg-white py-8">
                    <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
                        Aurora Media Tracking
                        {canLogin && !auth?.user && (
                            <span className="mt-2 block">
                                Studio owner? <Link href={route('login')} className="text-indigo-600 hover:text-indigo-700">Log in</Link>.
                            </span>
                        )}
                    </div>
                </footer>
            </div>
        </>
    );
}
