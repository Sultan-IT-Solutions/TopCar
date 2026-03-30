'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    DocumentTextIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import { csrfClientHelper } from '@/lib/csrf-client';
import { useAdminSession } from '@/hooks/useAdminSession';
import {
    FAQItem,
    LocalizedText,
    TermsSection,
    defaultFaqItems,
    defaultTermsSections,
    emptyLocalizedText,
} from '@/lib/site-config';

type LocalizedKey = 'ru' | 'en' | 'kk';

function LocalizedPairEditor({
    title,
    value,
    onChange,
    rows = 3,
}: {
    title: string;
    value: LocalizedText;
    onChange: (locale: LocalizedKey, nextValue: string) => void;
    rows?: number;
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
                            rows={rows}
                            value={value[locale]}
                            onChange={(event) =>
                                onChange(locale, event.target.value)
                            }
                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}

function emptyFaqItem(): FAQItem {
    return {
        id: `faq-${Date.now()}`,
        question: { ...emptyLocalizedText },
        answer: { ...emptyLocalizedText },
    };
}

function emptyTermsSection(): TermsSection {
    return {
        id: `terms-${Date.now()}`,
        icon: 'ShieldCheckIcon',
        title: { ...emptyLocalizedText },
        points: { ru: [''], en: [''], kk: [''] },
    };
}

export default function AdminContentPage() {
    const { admin, isLoading, logout } = useAdminSession();
    const [faqItems, setFaqItems] = useState<FAQItem[]>(defaultFaqItems);
    const [termsSections, setTermsSections] =
        useState<TermsSection[]>(defaultTermsSections);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSavingFaq, setIsSavingFaq] = useState(false);
    const [isSavingTerms, setIsSavingTerms] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!admin) {
            return;
        }

        const loadContent = async () => {
            setIsLoadingData(true);
            setError('');

            try {
                const response = await fetch('/api/admin/content', {
                    credentials: 'same-origin',
                    cache: 'no-store',
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(
                        data.message || 'Не удалось загрузить контент.',
                    );
                }

                setFaqItems(
                    Array.isArray(data.faqItems) ? data.faqItems : defaultFaqItems,
                );
                setTermsSections(
                    Array.isArray(data.termsSections)
                        ? data.termsSections
                        : defaultTermsSections,
                );
            } catch (loadError) {
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : 'Не удалось загрузить контент.',
                );
            } finally {
                setIsLoadingData(false);
            }
        };

        void loadContent();
    }, [admin]);

    const updateFaqLocalized = (
        index: number,
        field: 'question' | 'answer',
        locale: LocalizedKey,
        value: string,
    ) => {
        setFaqItems((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          [field]: {
                              ...item[field],
                              [locale]: value,
                          },
                      }
                    : item,
            ),
        );
    };

    const updateTermsTitle = (
        index: number,
        locale: LocalizedKey,
        value: string,
    ) => {
        setTermsSections((current) =>
            current.map((section, sectionIndex) =>
                sectionIndex === index
                    ? {
                          ...section,
                          title: {
                              ...section.title,
                              [locale]: value,
                          },
                      }
                    : section,
            ),
        );
    };

    const updateTermsPoints = (
        index: number,
        locale: LocalizedKey,
        value: string,
    ) => {
        setTermsSections((current) =>
            current.map((section, sectionIndex) =>
                sectionIndex === index
                    ? {
                          ...section,
                          points: {
                              ...section.points,
                              [locale]: value
                                  .split('\n')
                                  .map((item) => item.trim())
                                  .filter(Boolean),
                          },
                      }
                    : section,
            ),
        );
    };

    const updateTermsIcon = (index: number, value: string) => {
        setTermsSections((current) =>
            current.map((section, sectionIndex) =>
                sectionIndex === index
                    ? { ...section, icon: value }
                    : section,
            ),
        );
    };

    const saveSection = async (
        section: 'faq' | 'terms',
        payload: { faqItems?: FAQItem[]; termsSections?: TermsSection[] },
    ) => {
        const response = await fetch('/api/admin/content', {
            method: 'PUT',
            credentials: 'same-origin',
            headers: csrfClientHelper.addTokenToHeaders({
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify({ section, ...payload }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || 'Не удалось сохранить раздел контента.',
            );
        }

        return data;
    };

    const handleFaqSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSavingFaq(true);
        setError('');
        setMessage('');

        try {
            const data = await saveSection('faq', { faqItems });
            setFaqItems(Array.isArray(data.faqItems) ? data.faqItems : faqItems);
            setMessage('FAQ сохранен.');
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Не удалось сохранить FAQ.',
            );
        } finally {
            setIsSavingFaq(false);
        }
    };

    const handleTermsSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSavingTerms(true);
        setError('');
        setMessage('');

        try {
            const data = await saveSection('terms', { termsSections });
            setTermsSections(
                Array.isArray(data.termsSections)
                    ? data.termsSections
                    : termsSections,
            );
            setMessage('Условия аренды сохранены.');
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Не удалось сохранить условия аренды.',
            );
        } finally {
            setIsSavingTerms(false);
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
                                FAQ и условия
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
                            <DocumentTextIcon className="h-8 w-8 text-[#d4af37]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                Управление контентом FAQ и условий
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                                Редактируется сразу в трех языковых версиях.
                            </p>
                        </div>
                    </div>

                    {isLoadingData ? (
                        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/80">
                            <ArrowPathIcon className="h-10 w-10 animate-spin text-[#d4af37]" />
                        </div>
                    ) : (
                        <div className="space-y-8">
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

                            <form
                                onSubmit={handleFaqSubmit}
                                className="space-y-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold">
                                            FAQ
                                        </h3>
                                        <p className="mt-2 text-sm text-neutral-400">
                                            Вопросы и ответы для главной страницы
                                            и карточек.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFaqItems((current) => [
                                                ...current,
                                                emptyFaqItem(),
                                            ])
                                        }
                                        className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:text-white"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Добавить вопрос
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    {faqItems.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="space-y-4 rounded-3xl border border-neutral-800 bg-black/20 p-5"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                                    Вопрос #{index + 1}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFaqItems((current) =>
                                                            current.filter(
                                                                (_, itemIndex) =>
                                                                    itemIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:border-red-500/40"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                    Удалить
                                                </button>
                                            </div>
                                            <LocalizedPairEditor
                                                title="Вопрос"
                                                value={item.question}
                                                onChange={(locale, value) =>
                                                    updateFaqLocalized(
                                                        index,
                                                        'question',
                                                        locale,
                                                        value,
                                                    )
                                                }
                                                rows={2}
                                            />
                                            <LocalizedPairEditor
                                                title="Ответ"
                                                value={item.answer}
                                                onChange={(locale, value) =>
                                                    updateFaqLocalized(
                                                        index,
                                                        'answer',
                                                        locale,
                                                        value,
                                                    )
                                                }
                                                rows={4}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSavingFaq}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d4af37] px-5 py-3 font-semibold text-black transition hover:bg-[#c0982c] disabled:opacity-70"
                                >
                                    {isSavingFaq && (
                                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                    )}
                                    {isSavingFaq ? 'Сохранение...' : 'Сохранить FAQ'}
                                </button>
                            </form>

                            <form
                                onSubmit={handleTermsSubmit}
                                className="space-y-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold">
                                            Условия аренды
                                        </h3>
                                        <p className="mt-2 text-sm text-neutral-400">
                                            Секции страницы условий аренды.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTermsSections((current) => [
                                                ...current,
                                                emptyTermsSection(),
                                            ])
                                        }
                                        className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:text-white"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Добавить секцию
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    {termsSections.map((section, index) => (
                                        <div
                                            key={section.id}
                                            className="space-y-4 rounded-3xl border border-neutral-800 bg-black/20 p-5"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                                    Секция #{index + 1}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setTermsSections(
                                                            (current) =>
                                                                current.filter(
                                                                    (
                                                                        _,
                                                                        sectionIndex,
                                                                    ) =>
                                                                        sectionIndex !==
                                                                        index,
                                                                ),
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:border-red-500/40"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                    Удалить
                                                </button>
                                            </div>

                                            <label className="block">
                                                <span className="mb-2 block text-sm font-medium text-neutral-300">
                                                    Ключ иконки
                                                </span>
                                                <input
                                                    value={section.icon}
                                                    onChange={(event) =>
                                                        updateTermsIcon(
                                                            index,
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                                                />
                                            </label>

                                            <LocalizedPairEditor
                                                title="Заголовок секции"
                                                value={section.title}
                                                onChange={(locale, value) =>
                                                    updateTermsTitle(
                                                        index,
                                                        locale,
                                                        value,
                                                    )
                                                }
                                                rows={2}
                                            />

                                            {(['ru', 'en', 'kk'] as LocalizedKey[]).map(
                                                (locale) => (
                                                    <label
                                                        key={`${section.id}-${locale}`}
                                                        className="block"
                                                    >
                                                        <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                                                            Пункты {locale}
                                                        </span>
                                                        <textarea
                                                            rows={5}
                                                            value={section.points[
                                                                locale
                                                            ].join('\n')}
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateTermsPoints(
                                                                    index,
                                                                    locale,
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                                                        />
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSavingTerms}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d4af37] px-5 py-3 font-semibold text-black transition hover:bg-[#c0982c] disabled:opacity-70"
                                >
                                    {isSavingTerms && (
                                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                    )}
                                    {isSavingTerms
                                        ? 'Сохранение...'
                                        : 'Сохранить условия'}
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </AnimatedPageWrapper>
    );
}
