'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    PencilSquareIcon,
    PlusCircleIcon,
    TagIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import FormattedPrice from '@/components/FormattedPrice';
import { csrfClientHelper } from '@/lib/csrf-client';
import { useAdminSession } from '@/hooks/useAdminSession';

type AdminPromo = {
    id: string;
    code: string;
    title?: string | null;
    description?: string | null;
    scope: 'public' | 'personal';
    discount_type: 'percent' | 'amount';
    discount_value: number;
    is_active: boolean;
    starts_at?: string | null;
    expires_at?: string | null;
    usage_limit?: number | null;
    per_user_limit?: number | null;
    assigned_user_id?: string | null;
    car_id?: number | null;
    applicable_duration_unit?: 'day' | 'hour' | null;
    with_driver?: boolean | null;
    stats?: {
        usageCount: number;
        discountTotal: number;
        revenueTotal: number;
    };
};

type AdminCarOption = {
    id: number;
    name: string;
    brand: string;
};

type AdminUserOption = {
    id: string;
    email: string;
    full_name?: string | null;
};

const initialFormState = {
    code: '',
    title: '',
    description: '',
    scope: 'public',
    discountType: 'percent',
    discountValue: '',
    isActive: true,
    startsAt: '',
    expiresAt: '',
    usageLimit: '',
    perUserLimit: '',
    assignedUserId: '',
    carId: '',
    applicableDurationUnit: '',
    withDriver: 'any',
};

export default function AdminPromosPage() {
    const { admin, isLoading, logout } = useAdminSession();
    const [promos, setPromos] = useState<AdminPromo[]>([]);
    const [cars, setCars] = useState<AdminCarOption[]>([]);
    const [users, setUsers] = useState<AdminUserOption[]>([]);
    const [form, setForm] = useState(initialFormState);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadData = async () => {
        setIsLoadingData(true);
        setError('');

        try {
            const response = await fetch('/api/admin/promos', {
                cache: 'no-store',
                credentials: 'same-origin',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Не удалось загрузить промокоды.');
            }

            setPromos(Array.isArray(data.promos) ? data.promos : []);
            setCars(Array.isArray(data.cars) ? data.cars : []);
            setUsers(Array.isArray(data.users) ? data.users : []);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Не удалось загрузить промокоды.',
            );
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (admin) {
            void loadData();
        }
    }, [admin]);

    const resetForm = () => {
        setEditingPromoId(null);
        setForm(initialFormState);
        setError('');
        setMessage('');
    };

    const handleEdit = (promo: AdminPromo) => {
        setEditingPromoId(promo.id);
        setForm({
            code: promo.code,
            title: promo.title || '',
            description: promo.description || '',
            scope: promo.scope,
            discountType: promo.discount_type,
            discountValue: String(promo.discount_value || ''),
            isActive: promo.is_active,
            startsAt: promo.starts_at ? promo.starts_at.slice(0, 16) : '',
            expiresAt: promo.expires_at ? promo.expires_at.slice(0, 16) : '',
            usageLimit:
                typeof promo.usage_limit === 'number'
                    ? String(promo.usage_limit)
                    : '',
            perUserLimit:
                typeof promo.per_user_limit === 'number'
                    ? String(promo.per_user_limit)
                    : '',
            assignedUserId: promo.assigned_user_id || '',
            carId: promo.car_id ? String(promo.car_id) : '',
            applicableDurationUnit: promo.applicable_duration_unit || '',
            withDriver:
                typeof promo.with_driver === 'boolean'
                    ? String(promo.with_driver)
                    : 'any',
        });
        setError('');
        setMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');
        setMessage('');

        const payload = {
            code: form.code,
            title: form.title,
            description: form.description,
            scope: form.scope,
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
            isActive: form.isActive,
            startsAt: form.startsAt || null,
            expiresAt: form.expiresAt || null,
            usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
            perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
            assignedUserId: form.assignedUserId || null,
            carId: form.carId ? Number(form.carId) : null,
            applicableDurationUnit: form.applicableDurationUnit || null,
            withDriver:
                form.withDriver === 'any'
                    ? null
                    : form.withDriver === 'true',
        };

        try {
            const response = await fetch(
                editingPromoId
                    ? `/api/admin/promos/${editingPromoId}`
                    : '/api/admin/promos',
                {
                    method: editingPromoId ? 'PATCH' : 'POST',
                    credentials: 'same-origin',
                    headers: csrfClientHelper.addTokenToHeaders({
                        'Content-Type': 'application/json',
                    }),
                    body: JSON.stringify(payload),
                },
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось сохранить промокод.');
            }

            setMessage(
                editingPromoId
                    ? 'Промокод успешно обновлен.'
                    : 'Промокод успешно создан.',
            );
            resetForm();
            await loadData();
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Не удалось сохранить промокод.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (promo: AdminPromo) => {
        if (!window.confirm(`Удалить промокод "${promo.code}"?`)) {
            return;
        }

        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/admin/promos/${promo.id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders(),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось удалить промокод.');
            }

            setPromos((current) => current.filter((item) => item.id !== promo.id));
            if (editingPromoId === promo.id) {
                resetForm();
            }
            setMessage(`Промокод "${promo.code}" удален.`);
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Не удалось удалить промокод.',
            );
        }
    };

    const sortedPromos = useMemo(
        () =>
            [...promos].sort((left, right) =>
                right.code.localeCompare(left.code, 'ru'),
            ),
        [promos],
    );

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
                            <h1 className="text-xl font-bold">Промокоды и скидки</h1>
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

                <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[440px_minmax(0,1fr)] sm:px-6 lg:px-8">
                    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
                        <div className="flex items-center gap-3">
                            <PlusCircleIcon className="h-8 w-8 text-[#d4af37]" />
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {editingPromoId ? 'Редактировать промокод' : 'Создать промокод'}
                                </h2>
                                <p className="text-sm text-neutral-400">
                                    Поддерживаются публичные и персональные коды, ограничения по автомобилю,
                                    формату аренды и счетчики использования.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    value={form.code}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            code: event.target.value.toUpperCase(),
                                        }))
                                    }
                                    placeholder="Код"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                                <input
                                    value={form.title}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            title: event.target.value,
                                        }))
                                    }
                                    placeholder="Название"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                            </div>

                            <textarea
                                value={form.description}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        description: event.target.value,
                                    }))
                                }
                                rows={3}
                                placeholder="Описание или комментарий"
                                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <select
                                    value={form.scope}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            scope: event.target.value as 'public' | 'personal',
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                >
                                    <option value="public">Публичный</option>
                                    <option value="personal">Персональный</option>
                                </select>
                                <select
                                    value={form.discountType}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            discountType: event.target.value as 'percent' | 'amount',
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                >
                                    <option value="percent">Скидка в процентах</option>
                                    <option value="amount">Фиксированная сумма</option>
                                </select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    type="number"
                                    min="1"
                                    value={form.discountValue}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            discountValue: event.target.value,
                                        }))
                                    }
                                    placeholder={
                                        form.discountType === 'percent'
                                            ? 'Размер скидки, %'
                                            : 'Сумма скидки, ₸'
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                                <div className="flex items-center justify-between rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            Активен
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Отключенный промокод не участвует в расчете.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm((current) => ({
                                                ...current,
                                                isActive: !current.isActive,
                                            }))
                                        }
                                        className={`relative inline-flex h-8 w-16 items-center rounded-full border transition ${
                                            form.isActive
                                                ? 'border-[#d4af37] bg-[#d4af37]'
                                                : 'border-neutral-700 bg-neutral-900'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                                                form.isActive
                                                    ? 'translate-x-9'
                                                    : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    type="datetime-local"
                                    value={form.startsAt}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            startsAt: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                                <input
                                    type="datetime-local"
                                    value={form.expiresAt}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            expiresAt: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    type="number"
                                    min="0"
                                    value={form.usageLimit}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            usageLimit: event.target.value,
                                        }))
                                    }
                                    placeholder="Общий лимит"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    value={form.perUserLimit}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            perUserLimit: event.target.value,
                                        }))
                                    }
                                    placeholder="Лимит на пользователя"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <select
                                    value={form.assignedUserId}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            assignedUserId: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                >
                                    <option value="">Любой пользователь</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name || user.email} • {user.email}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={form.carId}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            carId: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                >
                                    <option value="">Любой автомобиль</option>
                                    {cars.map((car) => (
                                        <option key={car.id} value={car.id}>
                                            {car.brand} • {car.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <select
                                    value={form.applicableDurationUnit}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            applicableDurationUnit: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                >
                                    <option value="">Любой режим</option>
                                    <option value="day">По дням</option>
                                    <option value="hour">По часам</option>
                                </select>
                                <select
                                    value={form.withDriver}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            withDriver: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                >
                                    <option value="any">Любой формат</option>
                                    <option value="false">Без водителя</option>
                                    <option value="true">С водителем</option>
                                </select>
                            </div>

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

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#d4af37] px-4 py-3 font-semibold text-black transition hover:bg-[#c0982c] disabled:opacity-70"
                                >
                                    {isSubmitting && (
                                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                    )}
                                    {editingPromoId ? 'Сохранить изменения' : 'Создать промокод'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="inline-flex items-center justify-center rounded-2xl border border-neutral-700 px-4 py-3 font-semibold text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                                >
                                    {editingPromoId ? (
                                        <>
                                            <XMarkIcon className="mr-2 h-5 w-5" />
                                            Сбросить
                                        </>
                                    ) : (
                                        'Очистить'
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">Активные промокоды</h2>
                                <p className="text-sm text-neutral-400">
                                    Просматривайте статус, условия применения и статистику использования.
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

                        {isLoadingData ? (
                            <div className="flex min-h-[320px] items-center justify-center">
                                <ArrowPathIcon className="h-10 w-10 animate-spin text-[#d4af37]" />
                            </div>
                        ) : sortedPromos.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-neutral-800 bg-black/20 px-4 py-10 text-center text-neutral-400">
                                Пока нет промокодов.
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                                {sortedPromos.map((promo) => (
                                    <article
                                        key={promo.id}
                                        className="rounded-3xl border border-neutral-800 bg-black/20 p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f0dca0]">
                                                        {promo.code}
                                                    </span>
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs ${
                                                            promo.is_active
                                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                                                                : 'border-neutral-700 bg-neutral-900 text-neutral-300'
                                                        }`}
                                                    >
                                                        {promo.is_active ? 'Активен' : 'Отключен'}
                                                    </span>
                                                </div>
                                                <h3 className="mt-3 text-lg font-bold text-white">
                                                    {promo.title || promo.code}
                                                </h3>
                                                {promo.description && (
                                                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                                                        {promo.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(promo)}
                                                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-neutral-200 transition hover:border-[#d4af37]/30 hover:text-white"
                                                    title="Редактировать"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => void handleDelete(promo)}
                                                    className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20"
                                                    title="Удалить"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                                    Тип скидки
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-white">
                                                    {promo.discount_type === 'amount'
                                                        ? 'Фиксированная сумма'
                                                        : 'Процент'}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                                    Значение
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-white">
                                                    {promo.discount_type === 'amount' ? (
                                                        <>
                                                            <FormattedPrice
                                                                value={Number(promo.discount_value || 0)}
                                                            />{' '}
                                                            ₸
                                                        </>
                                                    ) : (
                                                        `${promo.discount_value}%`
                                                    )}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                                    Использований
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-white">
                                                    {promo.stats?.usageCount ?? 0}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                                    Сумма скидок
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-white">
                                                    <FormattedPrice
                                                        value={Number(promo.stats?.discountTotal ?? 0)}
                                                    />{' '}
                                                    ₸
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-400">
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                                {promo.scope === 'personal'
                                                    ? 'Персональный'
                                                    : 'Публичный'}
                                            </span>
                                            {promo.applicable_duration_unit && (
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                                    {promo.applicable_duration_unit === 'hour'
                                                        ? 'Почасовой режим'
                                                        : 'Посуточный режим'}
                                                </span>
                                            )}
                                            {typeof promo.with_driver === 'boolean' && (
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                                    {promo.with_driver
                                                        ? 'С водителем'
                                                        : 'Без водителя'}
                                                </span>
                                            )}
                                            {promo.usage_limit !== null &&
                                                promo.usage_limit !== undefined && (
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                                        Лимит: {promo.usage_limit}
                                                    </span>
                                                )}
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
