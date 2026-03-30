'use client';

export const dynamic = 'force-dynamic';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import { csrfClientHelper } from '@/lib/csrf-client';
import { useAdminSession } from '@/hooks/useAdminSession';
import { CompanyProfile, defaultCompanyProfile } from '@/lib/site-config';

type LocalizedKey = 'ru' | 'en' | 'kk';

function TextInput({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-300">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
            />
        </label>
    );
}

function LocalizedTextarea({
    title,
    value,
    onChange,
}: {
    title: string;
    value: Record<LocalizedKey, string>;
    onChange: (locale: LocalizedKey, nextValue: string) => void;
}) {
    return (
        <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f0dca0]">
                {title}
            </p>
            <div className="grid gap-4 md:grid-cols-3">
                {(['ru', 'en', 'kk'] as LocalizedKey[]).map((locale) => (
                    <label key={locale} className="block">
                        <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                            {locale}
                        </span>
                        <textarea
                            value={value[locale]}
                            onChange={(event) =>
                                onChange(locale, event.target.value)
                            }
                            rows={4}
                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}

export default function AdminCompanyPage() {
    const { admin, isLoading, logout } = useAdminSession();
    const [profile, setProfile] = useState<CompanyProfile>(defaultCompanyProfile);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!admin) {
            return;
        }

        const loadProfile = async () => {
            setIsLoadingData(true);
            setError('');

            try {
                const response = await fetch('/api/admin/company', {
                    credentials: 'same-origin',
                    cache: 'no-store',
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            'Не удалось загрузить данные компании.',
                    );
                }

                setProfile(data);
            } catch (loadError) {
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : 'Не удалось загрузить данные компании.',
                );
            } finally {
                setIsLoadingData(false);
            }
        };

        void loadProfile();
    }, [admin]);

    const patchProfile = <K extends keyof CompanyProfile>(
        key: K,
        value: CompanyProfile[K],
    ) => {
        setProfile((current) => ({ ...current, [key]: value }));
    };

    const patchLocalized = (
        key: 'address' | 'supportHours',
        locale: LocalizedKey,
        value: string,
    ) => {
        setProfile((current) => ({
            ...current,
            [key]: {
                ...current[key],
                [locale]: value,
            },
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/admin/company', {
                method: 'PUT',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(profile),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || 'Не удалось сохранить данные компании.',
                );
            }

            setProfile(data);
            setMessage('Данные компании сохранены.');
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Не удалось сохранить данные компании.',
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !admin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950">
                <ArrowPathIcon className="h-12 w-12 animate-spin text-[#d4af37]" />
            </div>
        );
    }

    return (
        <AnimatedPageWrapper>
            <div className="min-h-screen bg-neutral-950 text-white">
                <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                Назад
                            </Link>
                            <h1 className="text-xl font-bold">
                                Данные компании
                            </h1>
                        </div>
                        <button
                            onClick={() => void logout()}
                            className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Выйти
                        </button>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-start gap-4 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
                        <div className="rounded-2xl border border-neutral-700 bg-black/30 p-3">
                            <BuildingOffice2Icon className="h-8 w-8 text-[#d4af37]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                Контакты и каналы компании
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                                Эти данные используются в футере, на странице
                                контактов, в плавающем виджете и в блоке PWA.
                            </p>
                        </div>
                    </div>

                    {isLoadingData ? (
                        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/80">
                            <ArrowPathIcon className="h-10 w-10 animate-spin text-[#d4af37]" />
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6"
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <TextInput
                                    label="Телефон для отображения"
                                    value={profile.phoneDisplay}
                                    onChange={(value) =>
                                        patchProfile('phoneDisplay', value)
                                    }
                                />
                                <TextInput
                                    label="Телефон raw / ссылка"
                                    value={profile.phoneRaw}
                                    onChange={(value) =>
                                        patchProfile('phoneRaw', value)
                                    }
                                />
                                <TextInput
                                    label="Почта"
                                    type="email"
                                    value={profile.email}
                                    onChange={(value) =>
                                        patchProfile('email', value)
                                    }
                                />
                                <TextInput
                                    label="Ссылка WhatsApp"
                                    value={profile.whatsappUrl}
                                    onChange={(value) =>
                                        patchProfile('whatsappUrl', value)
                                    }
                                />
                                <TextInput
                                    label="Ссылка Telegram"
                                    value={profile.telegramUrl}
                                    onChange={(value) =>
                                        patchProfile('telegramUrl', value)
                                    }
                                />
                                <TextInput
                                    label="Ссылка Instagram"
                                    value={profile.instagramUrl}
                                    onChange={(value) =>
                                        patchProfile('instagramUrl', value)
                                    }
                                />
                                <TextInput
                                    label="Ссылка Viber"
                                    value={profile.viberUrl}
                                    onChange={(value) =>
                                        patchProfile('viberUrl', value)
                                    }
                                />
                                <TextInput
                                    label="Ссылка Max"
                                    value={profile.maxUrl}
                                    onChange={(value) =>
                                        patchProfile('maxUrl', value)
                                    }
                                />
                                <TextInput
                                    label="Ссылка на PWA / download"
                                    value={profile.pwaDownloadUrl}
                                    onChange={(value) =>
                                        patchProfile('pwaDownloadUrl', value)
                                    }
                                />
                                <TextInput
                                    label="URL изображения QR"
                                    value={profile.pwaQrImageUrl}
                                    onChange={(value) =>
                                        patchProfile('pwaQrImageUrl', value)
                                    }
                                />
                            </div>

                            <label className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-black/20 px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={profile.subscriptionEnabled}
                                    onChange={(
                                        event: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        patchProfile(
                                            'subscriptionEnabled',
                                            event.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded border-neutral-600 bg-neutral-950 text-[#d4af37] focus:ring-[#d4af37]"
                                />
                                <span className="text-sm text-neutral-300">
                                    Показывать блок подписки на витрине
                                </span>
                            </label>

                            <LocalizedTextarea
                                title="Адрес компании"
                                value={profile.address}
                                onChange={(locale, value) =>
                                    patchLocalized('address', locale, value)
                                }
                            />

                            <LocalizedTextarea
                                title="График работы"
                                value={profile.supportHours}
                                onChange={(locale, value) =>
                                    patchLocalized(
                                        'supportHours',
                                        locale,
                                        value,
                                    )
                                }
                            />

                            {error && (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d4af37] px-5 py-3 font-semibold text-black transition hover:bg-[#c0982c] disabled:opacity-70"
                            >
                                {isSaving && (
                                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                )}
                                {isSaving
                                    ? 'Сохранение...'
                                    : 'Сохранить данные'}
                            </button>
                        </form>
                    )}
                </main>
            </div>
        </AnimatedPageWrapper>
    );
}
