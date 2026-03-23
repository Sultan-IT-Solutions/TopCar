'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { csrfClientHelper } from '@/lib/csrf-client';

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            const response = await fetch('/api/admin/me', {
                cache: 'no-store',
                credentials: 'same-origin',
            });

            if (response.ok) {
                router.replace('/admin');
            }
        };

        void checkSession();
    }, [router]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: csrfClientHelper.addTokenToHeaders({
                    'Content-Type': 'application/json',
                }),
                credentials: 'same-origin',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось выполнить вход.');
            }

            router.replace('/admin');
            router.refresh();
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Не удалось выполнить вход.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
            <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
                <div className="w-full rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl backdrop-blur">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-[#f0dca0]">
                            <LockClosedIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0dca0]">
                                TopCar
                            </p>
                            <h1 className="text-2xl font-bold text-white">
                                Вход в админ-панель
                            </h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="admin-username"
                                className="mb-2 block text-sm font-medium text-neutral-300"
                            >
                                Логин
                            </label>
                            <input
                                id="admin-username"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="admin-password"
                                className="mb-2 block text-sm font-medium text-neutral-300"
                            >
                                Пароль
                            </label>
                            <input
                                id="admin-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d4af37] px-4 py-3 font-semibold text-black transition hover:bg-[#c0982c] disabled:opacity-70"
                        >
                            {isLoading && (
                                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            )}
                            {isLoading ? 'Проверяем доступ…' : 'Войти'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
