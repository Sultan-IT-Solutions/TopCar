'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import { csrfClientHelper } from '@/lib/csrf-client';
import { useAdminSession } from '@/hooks/useAdminSession';

type AdminBooking = {
    id: string;
    car_name: string;
    user_name?: string;
    user_phone: string;
    date_from: string;
    date_to: string;
    total_price?: number;
    status?: string;
    created_at: string;
};

function formatDate(value: string) {
    try {
        return new Date(value).toLocaleDateString('ru-RU');
    } catch {
        return value;
    }
}

export default function AdminBookingsPage() {
    const { admin, isLoading: isLoadingSession, logout } = useAdminSession();
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadBookings = async () => {
        setIsLoadingBookings(true);
        setError('');

        try {
            const response = await fetch('/api/admin/bookings', {
                cache: 'no-store',
                credentials: 'same-origin',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Не удалось загрузить бронирования.',
                );
            }

            setBookings(Array.isArray(data) ? data : []);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Не удалось загрузить бронирования.',
            );
        } finally {
            setIsLoadingBookings(false);
        }
    };

    useEffect(() => {
        if (admin) {
            void loadBookings();
        }
    }, [admin]);

    const filteredBookings = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        if (!normalized) {
            return bookings;
        }

        return bookings.filter((booking) => {
            return (
                booking.id.toLowerCase().includes(normalized) ||
                booking.car_name.toLowerCase().includes(normalized) ||
                booking.user_phone.includes(searchTerm) ||
                booking.user_name?.toLowerCase().includes(normalized)
            );
        });
    }, [bookings, searchTerm]);

    const handleDelete = async (booking: AdminBooking) => {
        if (!window.confirm(`Удалить бронирование ${booking.id}?`)) {
            return;
        }

        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/admin/bookings/${booking.id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders(),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Не удалось удалить бронирование.',
                );
            }

            setBookings((current) =>
                current.filter((item) => item.id !== booking.id),
            );
            setMessage(`Бронирование ${booking.id} удалено.`);
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Не удалось удалить бронирование.',
            );
        }
    };

    if (isLoadingSession || !admin) {
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
                            <h1 className="text-xl font-bold">Бронирования</h1>
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
                    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Реестр заявок
                                </h2>
                                <p className="text-sm text-neutral-400">
                                    Данные запрашиваются только через защищенный admin API.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <div className="relative min-w-[280px]">
                                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                                    <input
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="ID, клиент, телефон, авто…"
                                        className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-10 py-3 text-sm outline-none transition focus:border-[#d4af37]"
                                    />
                                </div>
                                <button
                                    onClick={() => void loadBookings()}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 px-4 py-3 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                                >
                                    <ArrowPathIcon
                                        className={`h-5 w-5 ${isLoadingBookings ? 'animate-spin' : ''}`}
                                    />
                                    Обновить
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                {message}
                            </div>
                        )}

                        {isLoadingBookings ? (
                            <div className="flex min-h-[320px] items-center justify-center">
                                <ArrowPathIcon className="h-10 w-10 animate-spin text-[#d4af37]" />
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-neutral-800 bg-black/20 px-4 py-10 text-center text-neutral-400">
                                Бронирования не найдены.
                            </div>
                        ) : (
                            <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-800">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-800 text-sm">
                                        <thead className="bg-black/20 text-left text-neutral-400">
                                            <tr>
                                                <th className="px-4 py-3">Авто</th>
                                                <th className="px-4 py-3">Клиент</th>
                                                <th className="px-4 py-3">Период</th>
                                                <th className="px-4 py-3">Сумма</th>
                                                <th className="px-4 py-3">Статус</th>
                                                <th className="px-4 py-3">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-800">
                                            {filteredBookings.map((booking) => (
                                                <tr key={booking.id} className="bg-neutral-950/40">
                                                    <td className="px-4 py-4">
                                                        <div className="font-medium text-white">
                                                            {booking.car_name}
                                                        </div>
                                                        <div className="text-xs text-neutral-500">
                                                            {booking.id}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-white">
                                                            {booking.user_name ||
                                                                'Без имени'}
                                                        </div>
                                                        <div className="text-neutral-400">
                                                            {booking.user_phone}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-300">
                                                        {formatDate(booking.date_from)} —{' '}
                                                        {formatDate(booking.date_to)}
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-300">
                                                        {booking.total_price
                                                            ? `${Number(booking.total_price).toLocaleString('ru-RU')} ₸`
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-300">
                                                        {booking.status || 'confirmed'}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <button
                                                            onClick={() =>
                                                                void handleDelete(
                                                                    booking,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-200 transition hover:bg-red-500/20"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                            Удалить
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AnimatedPageWrapper>
    );
}
