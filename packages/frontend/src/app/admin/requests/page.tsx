'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import FormattedPrice from '@/components/FormattedPrice';
import { csrfClientHelper } from '@/lib/csrf-client';
import { useAdminSession } from '@/hooks/useAdminSession';

type AdminRequest = {
    id: string;
    request_type: string;
    source: string;
    status: string;
    car_name?: string | null;
    user_name?: string | null;
    user_phone?: string | null;
    user_email?: string | null;
    service_type?: string | null;
    duration_unit?: 'day' | 'hour' | null;
    duration_value?: number | null;
    subtotal_amount?: number | null;
    discount_amount?: number | null;
    final_amount?: number | null;
    promo_code?: string | null;
    created_at: string;
    car?: {
        id: number;
        name: string;
        brand: string;
    } | null;
    booking?: {
        id: string;
        status: string;
        starts_at?: string | null;
        ends_at?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    } | null;
};

type AdminCarOption = {
    id: number;
    name: string;
    brand: string;
};

const initialFilters = {
    status: '',
    type: '',
    source: '',
    promoCode: '',
    carId: '',
    from: '',
    to: '',
};

export default function AdminRequestsPage() {
    const { admin, isLoading, logout } = useAdminSession();
    const [requests, setRequests] = useState<AdminRequest[]>([]);
    const [cars, setCars] = useState<AdminCarOption[]>([]);
    const [filters, setFilters] = useState(initialFilters);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });
        return params.toString();
    }, [filters]);

    const loadData = async () => {
        setIsLoadingData(true);
        setError('');

        try {
            const response = await fetch(
                `/api/admin/requests${queryString ? `?${queryString}` : ''}`,
                {
                    cache: 'no-store',
                    credentials: 'same-origin',
                },
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Не удалось загрузить заявки.');
            }

            setRequests(Array.isArray(data.requests) ? data.requests : []);
            setCars(Array.isArray(data.cars) ? data.cars : []);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Не удалось загрузить заявки.',
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

    const updateStatus = async (requestId: string, status: string) => {
        setUpdatingId(requestId);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/admin/requests/${requestId}`, {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({ status }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Не удалось обновить статус.');
            }

            setRequests((current) =>
                current.map((item) =>
                    item.id === requestId ? { ...item, status: data.status } : item,
                ),
            );
            setMessage('Статус заявки обновлен.');
        } catch (updateError) {
            setError(
                updateError instanceof Error
                    ? updateError.message
                    : 'Не удалось обновить статус.',
            );
        } finally {
            setUpdatingId(null);
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
                            <h1 className="text-xl font-bold">Заявки и лиды</h1>
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
                            <div>
                                <h2 className="text-2xl font-bold">Все входящие заявки</h2>
                                <p className="mt-2 text-sm text-neutral-400">
                                    Контакты, расчеты и бронирования в единой ленте с фильтрацией.
                                </p>
                            </div>
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

                        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                            <select
                                value={filters.status}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        status: event.target.value,
                                    }))
                                }
                                className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                            >
                                <option value="">Все статусы</option>
                                <option value="new">Новые</option>
                                <option value="pending">В работе</option>
                                <option value="processed">Обработано</option>
                                <option value="closed">Закрыто</option>
                            </select>
                            <select
                                value={filters.type}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        type: event.target.value,
                                    }))
                                }
                                className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                            >
                                <option value="">Все типы</option>
                                <option value="contact">Контакт</option>
                                <option value="calculation">Расчет</option>
                                <option value="booking">Бронирование</option>
                            </select>
                            <input
                                value={filters.source}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        source: event.target.value,
                                    }))
                                }
                                placeholder="Источник"
                                className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                            />
                            <input
                                value={filters.promoCode}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        promoCode: event.target.value.toUpperCase(),
                                    }))
                                }
                                placeholder="Промокод"
                                className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                            />
                            <select
                                value={filters.carId}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        carId: event.target.value,
                                    }))
                                }
                                className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                            >
                                <option value="">Все автомобили</option>
                                {cars.map((car) => (
                                    <option key={car.id} value={car.id}>
                                        {car.brand} • {car.name}
                                    </option>
                                ))}
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={filters.from}
                                    onChange={(event) =>
                                        setFilters((current) => ({
                                            ...current,
                                            from: event.target.value,
                                        }))
                                    }
                                    className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                                />
                                <input
                                    type="date"
                                    value={filters.to}
                                    onChange={(event) =>
                                        setFilters((current) => ({
                                            ...current,
                                            to: event.target.value,
                                        }))
                                    }
                                    className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                {message}
                            </div>
                        )}

                        {isLoadingData ? (
                            <div className="flex min-h-[320px] items-center justify-center">
                                <ArrowPathIcon className="h-10 w-10 animate-spin text-[#d4af37]" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-neutral-800 bg-black/20 px-4 py-10 text-center text-neutral-400">
                                Подходящих заявок пока нет.
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {requests.map((item) => (
                                    <article
                                        key={item.id}
                                        className="rounded-3xl border border-neutral-800 bg-black/20 p-5"
                                    >
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f0dca0]">
                                                        {item.request_type}
                                                    </span>
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                                                        {item.source || 'website'}
                                                    </span>
                                                    {item.promo_code && (
                                                        <span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
                                                            Промокод: {item.promo_code}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold text-white">
                                                        {item.car_name || item.car?.name || 'Заявка без авто'}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-neutral-400">
                                                        {item.user_name || 'Без имени'} •{' '}
                                                        {item.user_phone || item.user_email || 'Контакт не указан'}
                                                    </p>
                                                </div>

                                                {item.service_type && (
                                                    <p className="text-sm text-neutral-300">
                                                        Формат: {item.service_type}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-3 text-sm text-neutral-400">
                                                    <span>
                                                        Создано:{' '}
                                                        {new Date(item.created_at).toLocaleString('ru-RU')}
                                                    </span>
                                                    {item.duration_value && item.duration_unit && (
                                                        <span>
                                                            Длительность: {item.duration_value}{' '}
                                                            {item.duration_unit === 'hour' ? 'ч.' : 'дн.'}
                                                        </span>
                                                    )}
                                                    {item.booking?.date_from && (
                                                        <span>
                                                            Период:{' '}
                                                            {item.booking.date_from} - {item.booking.date_to}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                                        Сумма заявки
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold text-white">
                                                        <FormattedPrice
                                                            value={Number(item.final_amount ?? item.subtotal_amount ?? 0)}
                                                        />{' '}
                                                        ₸
                                                    </p>
                                                    {Number(item.discount_amount ?? 0) > 0 && (
                                                        <p className="text-xs text-emerald-300">
                                                            Скидка:{' '}
                                                            <FormattedPrice
                                                                value={Number(item.discount_amount ?? 0)}
                                                            />{' '}
                                                            ₸
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                                        Бронирование
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold text-white">
                                                        {item.booking ? item.booking.status : 'Без брони'}
                                                    </p>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                                                        Статус заявки
                                                    </label>
                                                    <select
                                                        value={item.status}
                                                        onChange={(event) =>
                                                            void updateStatus(item.id, event.target.value)
                                                        }
                                                        disabled={updatingId === item.id}
                                                        className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37] disabled:opacity-70"
                                                    >
                                                        <option value="new">Новая</option>
                                                        <option value="pending">В работе</option>
                                                        <option value="processed">Обработана</option>
                                                        <option value="closed">Закрыта</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </AnimatedPageWrapper>
    );
}
