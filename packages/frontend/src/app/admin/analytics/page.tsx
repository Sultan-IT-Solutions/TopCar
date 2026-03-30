'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    ChartBarSquareIcon,
} from '@heroicons/react/24/outline';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import FormattedPrice from '@/components/FormattedPrice';
import { useAdminSession } from '@/hooks/useAdminSession';

type AnalyticsSummary = {
    requestsCount: number;
    bookingsCount: number;
    calculationsCount: number;
    contactsCount: number;
    registrationsCount: number;
    loginsCount: number;
    pwaInstallsCount: number;
    messengerClicksCount: number;
    phoneClicksCount: number;
    promoAppliedCount: number;
    discountTotal: number;
    bookingsRevenue: number;
};

type AnalyticsPayload = {
    summary: AnalyticsSummary;
    timeline: Array<{
        date: string;
        requests: number;
        bookings: number;
        revenue: number;
    }>;
    topCars: Array<{
        carId: number;
        name: string;
        brand: string;
        revenue: number;
        count: number;
    }>;
    range: {
        range: 'today' | '7d' | '30d' | '90d' | 'custom';
        from?: string | null;
        to?: string | null;
    };
};

const summaryCards = [
    {
        key: 'requestsCount',
        label: 'Всего заявок',
    },
    {
        key: 'bookingsCount',
        label: 'Бронирований',
    },
    {
        key: 'registrationsCount',
        label: 'Регистраций',
    },
    {
        key: 'pwaInstallsCount',
        label: 'Установок PWA',
    },
    {
        key: 'messengerClicksCount',
        label: 'Кликов в мессенджеры',
    },
    {
        key: 'promoAppliedCount',
        label: 'Применений промокодов',
    },
] as const;

export default function AdminAnalyticsPage() {
    const { admin, isLoading, logout } = useAdminSession();
    const [range, setRange] = useState<'today' | '7d' | '30d' | '90d' | 'custom'>('30d');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState('');

    const queryString = useMemo(() => {
        const params = new URLSearchParams({ range });
        if (range === 'custom') {
            if (customFrom) params.set('from', customFrom);
            if (customTo) params.set('to', customTo);
        }
        return params.toString();
    }, [customFrom, customTo, range]);

    const loadData = async () => {
        setIsLoadingData(true);
        setError('');

        try {
            const response = await fetch(`/api/admin/analytics?${queryString}`, {
                cache: 'no-store',
                credentials: 'same-origin',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Не удалось загрузить аналитику.');
            }

            setAnalytics(data);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Не удалось загрузить аналитику.',
            );
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (admin) {
            void loadData();
        }
    }, [admin, queryString]);

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
                            <h1 className="text-xl font-bold">Аналитика</h1>
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
                    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex items-center gap-3">
                                <ChartBarSquareIcon className="h-8 w-8 text-[#d4af37]" />
                                <div>
                                    <h2 className="text-2xl font-bold">KPI и отчетность</h2>
                                    <p className="mt-2 text-sm text-neutral-400">
                                        Установки PWA, входы, регистрации, клики по мессенджерам,
                                        заявки, брони и выручка по датам.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <select
                                    value={range}
                                    onChange={(event) =>
                                        setRange(
                                            event.target.value as
                                                | 'today'
                                                | '7d'
                                                | '30d'
                                                | '90d'
                                                | 'custom',
                                        )
                                    }
                                    className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                                >
                                    <option value="today">Сегодня</option>
                                    <option value="7d">7 дней</option>
                                    <option value="30d">30 дней</option>
                                    <option value="90d">90 дней</option>
                                    <option value="custom">Период вручную</option>
                                </select>
                                {range === 'custom' && (
                                    <>
                                        <input
                                            type="date"
                                            value={customFrom}
                                            onChange={(event) =>
                                                setCustomFrom(event.target.value)
                                            }
                                            className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                                        />
                                        <input
                                            type="date"
                                            value={customTo}
                                            onChange={(event) =>
                                                setCustomTo(event.target.value)
                                            }
                                            className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                                        />
                                    </>
                                )}
                                <button
                                    onClick={() => void loadData()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                                >
                                    <ArrowPathIcon
                                        className={`h-5 w-5 ${isLoadingData ? 'animate-spin' : ''}`}
                                    />
                                    Обновить
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {isLoadingData || !analytics ? (
                            <div className="flex min-h-[320px] items-center justify-center">
                                <ArrowPathIcon className="h-10 w-10 animate-spin text-[#d4af37]" />
                            </div>
                        ) : (
                            <div className="mt-6 space-y-8">
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {summaryCards.map((card) => (
                                        <div
                                            key={card.key}
                                            className="rounded-2xl border border-neutral-800 bg-black/20 px-5 py-4"
                                        >
                                            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                                {card.label}
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-white">
                                                {analytics.summary[card.key]}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="rounded-2xl border border-neutral-800 bg-black/20 px-5 py-4">
                                        <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                            Сумма скидок
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-white">
                                            <FormattedPrice
                                                value={analytics.summary.discountTotal}
                                            />{' '}
                                            ₸
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-neutral-800 bg-black/20 px-5 py-4">
                                        <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                            Выручка по бронированиям
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-white">
                                            <FormattedPrice
                                                value={analytics.summary.bookingsRevenue}
                                            />{' '}
                                            ₸
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                                    <section className="rounded-3xl border border-neutral-800 bg-black/20 p-5">
                                        <h3 className="text-xl font-bold text-white">
                                            Динамика по дням
                                        </h3>
                                        <div className="mt-4 overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead className="text-left text-neutral-500">
                                                    <tr>
                                                        <th className="pb-3 pr-4 font-medium">
                                                            Дата
                                                        </th>
                                                        <th className="pb-3 pr-4 font-medium">
                                                            Заявки
                                                        </th>
                                                        <th className="pb-3 pr-4 font-medium">
                                                            Брони
                                                        </th>
                                                        <th className="pb-3 font-medium">
                                                            Выручка
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-800">
                                                    {analytics.timeline.map((item) => (
                                                        <tr key={item.date}>
                                                            <td className="py-3 pr-4 text-white">
                                                                {item.date}
                                                            </td>
                                                            <td className="py-3 pr-4 text-neutral-300">
                                                                {item.requests}
                                                            </td>
                                                            <td className="py-3 pr-4 text-neutral-300">
                                                                {item.bookings}
                                                            </td>
                                                            <td className="py-3 text-neutral-300">
                                                                <FormattedPrice
                                                                    value={item.revenue}
                                                                />{' '}
                                                                ₸
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    <section className="rounded-3xl border border-neutral-800 bg-black/20 p-5">
                                        <h3 className="text-xl font-bold text-white">
                                            Топ автомобилей по выручке
                                        </h3>
                                        <div className="mt-4 space-y-3">
                                            {analytics.topCars.length === 0 ? (
                                                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-6 text-center text-sm text-neutral-400">
                                                    Пока нет данных по бронированиям.
                                                </div>
                                            ) : (
                                                analytics.topCars.map((item, index) => (
                                                    <div
                                                        key={`${item.carId}-${index}`}
                                                        className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-4"
                                                    >
                                                        <p className="text-sm font-semibold text-white">
                                                            {item.brand} • {item.name}
                                                        </p>
                                                        <div className="mt-2 flex items-center justify-between text-sm text-neutral-400">
                                                            <span>Броней: {item.count}</span>
                                                            <span>
                                                                <FormattedPrice
                                                                    value={item.revenue}
                                                                />{' '}
                                                                ₸
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </AnimatedPageWrapper>
    );
}
