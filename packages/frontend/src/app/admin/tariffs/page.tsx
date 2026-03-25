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
import { DurationUnit } from '@/types';

type AdminCarOption = {
    id: number;
    name: string;
    brand: string;
    class: string;
    price?: number | null;
    price_per_day?: number | null;
};

type AdminTariff = {
    id: number;
    car_id: number;
    days_from: number;
    days_to: number;
    price_per_day: number;
    with_driver: boolean;
    duration_unit?: DurationUnit;
    conditions?: string | null;
    created_at?: string;
    car?: {
        id: number;
        name: string;
        brand: string;
        class: string;
    } | null;
};

const initialFormState = {
    carId: '',
    durationUnit: 'day',
    withDriver: 'false',
    daysFrom: '1',
    daysTo: '365',
    pricePerDay: '',
    conditions: '',
};

function formatRange(
    daysFrom: number,
    daysTo: number,
    durationUnit: DurationUnit = 'day',
) {
    const suffix = durationUnit === 'hour' ? 'ч.' : 'дн.';

    if (daysFrom === daysTo) {
        return `${daysFrom} ${suffix}`;
    }

    return `${daysFrom}-${daysTo} ${suffix}`;
}

export default function AdminTariffsPage() {
    const { admin, isLoading, logout } = useAdminSession();
    const [cars, setCars] = useState<AdminCarOption[]>([]);
    const [tariffs, setTariffs] = useState<AdminTariff[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingTariffId, setEditingTariffId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [form, setForm] = useState(initialFormState);

    const loadData = async () => {
        setIsLoadingData(true);
        setError('');

        try {
            const response = await fetch('/api/admin/prices', {
                cache: 'no-store',
                credentials: 'same-origin',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось загрузить тарифы.');
            }

            const nextCars = Array.isArray(data.cars) ? data.cars : [];
            const nextTariffs = Array.isArray(data.tariffs) ? data.tariffs : [];

            setCars(nextCars);
            setTariffs(nextTariffs);
            setForm((current) => ({
                ...current,
                carId: current.carId || String(nextCars[0]?.id ?? ''),
            }));
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Не удалось загрузить тарифы.',
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

    const groupedTariffs = useMemo(() => {
        const groups = new Map<number, { car: AdminCarOption; tariffs: AdminTariff[] }>();

        for (const car of cars) {
            groups.set(car.id, {
                car,
                tariffs: [],
            });
        }

        for (const tariff of tariffs) {
            const existing = groups.get(tariff.car_id);
            if (existing) {
                existing.tariffs.push(tariff);
                continue;
            }

            const fallbackCar = tariff.car
                ? {
                      id: tariff.car.id,
                      name: tariff.car.name,
                      brand: tariff.car.brand,
                      class: tariff.car.class,
                      price: null,
                      price_per_day: null,
                  }
                : {
                      id: tariff.car_id,
                      name: 'Неизвестный автомобиль',
                      brand: '—',
                      class: '—',
                      price: null,
                      price_per_day: null,
                  };

            groups.set(tariff.car_id, {
                car: fallbackCar,
                tariffs: [tariff],
            });
        }

        return Array.from(groups.values())
            .sort((left, right) =>
                `${left.car.brand} ${left.car.name}`.localeCompare(
                    `${right.car.brand} ${right.car.name}`,
                    'ru',
                ),
            )
            .map((group) => ({
                ...group,
                tariffs: [...group.tariffs].sort(
                    (left, right) =>
                        (left.duration_unit === 'hour' ? 1 : 0) -
                            (right.duration_unit === 'hour' ? 1 : 0) ||
                        Number(left.with_driver) - Number(right.with_driver) ||
                        left.days_from - right.days_from,
                ),
            }));
    }, [cars, tariffs]);

    const selectedCar = useMemo(
        () => cars.find((car) => String(car.id) === form.carId) ?? null,
        [cars, form.carId],
    );

    const resetForm = () => {
        setEditingTariffId(null);
        setForm({
            ...initialFormState,
            carId: String(cars[0]?.id ?? ''),
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');
        setMessage('');

        const payload = {
            carId: Number(form.carId),
            durationUnit: form.durationUnit,
            withDriver: form.withDriver === 'true',
            daysFrom: Number(form.daysFrom),
            daysTo: Number(form.daysTo),
            pricePerDay: Number(form.pricePerDay),
            conditions: form.conditions,
        };

        try {
            const response = await fetch(
                editingTariffId
                    ? `/api/admin/prices/${editingTariffId}`
                    : '/api/admin/prices',
                {
                    method: editingTariffId ? 'PATCH' : 'POST',
                    credentials: 'same-origin',
                    headers: csrfClientHelper.addTokenToHeaders({
                        'Content-Type': 'application/json',
                    }),
                    body: JSON.stringify(payload),
                },
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось сохранить тариф.');
            }

            setMessage(
                editingTariffId
                    ? 'Тариф успешно обновлен.'
                    : 'Тариф успешно добавлен.',
            );
            resetForm();
            await loadData();
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Не удалось сохранить тариф.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (tariff: AdminTariff) => {
        setEditingTariffId(tariff.id);
        setForm({
            carId: String(tariff.car_id),
            durationUnit: tariff.duration_unit === 'hour' ? 'hour' : 'day',
            withDriver: tariff.with_driver ? 'true' : 'false',
            daysFrom: String(tariff.days_from),
            daysTo: String(tariff.days_to),
            pricePerDay: String(tariff.price_per_day),
            conditions: tariff.conditions || '',
        });
        setMessage('');
        setError('');
    };

    const handleDelete = async (tariff: AdminTariff) => {
        if (
            !window.confirm(
                `Удалить тариф ${formatRange(
                    tariff.days_from,
                    tariff.days_to,
                    tariff.duration_unit,
                )} для "${tariff.car?.brand || ''} ${tariff.car?.name || ''}"?`,
            )
        ) {
            return;
        }

        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/admin/prices/${tariff.id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders(),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось удалить тариф.');
            }

            setTariffs((current) => current.filter((item) => item.id !== tariff.id));
            if (editingTariffId === tariff.id) {
                resetForm();
            }
            setMessage('Тариф удален.');
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Не удалось удалить тариф.',
            );
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
                            <h1 className="text-xl font-bold">Тарифы и форматы аренды</h1>
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
                                    {editingTariffId ? 'Редактировать тариф' : 'Добавить тариф'}
                                </h2>
                                <p className="text-sm text-neutral-400">
                                    Отдельно управляйте дневными и почасовыми тарифами без водителя и с водителем.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-300">
                                    Автомобиль
                                </label>
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
                                    {cars.map((car) => (
                                        <option key={car.id} value={car.id}>
                                            {car.brand} • {car.name} • {car.class}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-300">
                                    Тип тарифа
                                </label>
                                <div className="grid grid-cols-2 rounded-2xl bg-neutral-950 p-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm((current) => ({
                                                ...current,
                                                durationUnit: 'day',
                                                daysFrom:
                                                    current.durationUnit === 'hour'
                                                        ? '1'
                                                        : current.daysFrom,
                                                daysTo:
                                                    current.durationUnit === 'hour'
                                                        ? '365'
                                                        : current.daysTo,
                                            }))
                                        }
                                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            form.durationUnit === 'day'
                                                ? 'bg-[#d4af37] text-black'
                                                : 'text-neutral-300 hover:bg-neutral-800'
                                        }`}
                                    >
                                        По дням
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm((current) => ({
                                                ...current,
                                                durationUnit: 'hour',
                                                daysFrom:
                                                    current.durationUnit === 'day'
                                                        ? '3'
                                                        : current.daysFrom,
                                                daysTo:
                                                    current.durationUnit === 'day'
                                                        ? '3'
                                                        : current.daysTo,
                                            }))
                                        }
                                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            form.durationUnit === 'hour'
                                                ? 'bg-[#d4af37] text-black'
                                                : 'text-neutral-300 hover:bg-neutral-800'
                                        }`}
                                    >
                                        По часам
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-300">
                                    Формат аренды
                                </label>
                                <div className="grid grid-cols-2 rounded-2xl bg-neutral-950 p-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm((current) => ({
                                                ...current,
                                                withDriver: 'false',
                                            }))
                                        }
                                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            form.withDriver === 'false'
                                                ? 'bg-[#d4af37] text-black'
                                                : 'text-neutral-300 hover:bg-neutral-800'
                                        }`}
                                    >
                                        Без водителя
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm((current) => ({
                                                ...current,
                                                withDriver: 'true',
                                            }))
                                        }
                                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            form.withDriver === 'true'
                                                ? 'bg-[#d4af37] text-black'
                                                : 'text-neutral-300 hover:bg-neutral-800'
                                        }`}
                                    >
                                        С водителем
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                                        {form.durationUnit === 'hour'
                                            ? 'От часов'
                                            : 'От дней'}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.daysFrom}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                daysFrom: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                                        {form.durationUnit === 'hour'
                                            ? 'До часов'
                                            : 'До дней'}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.daysTo}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                daysTo: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-300">
                                    {form.durationUnit === 'hour'
                                        ? 'Цена за период, ₸'
                                        : 'Цена за сутки, ₸'}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.pricePerDay}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            pricePerDay: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-300">
                                    Условия
                                </label>
                                <textarea
                                    rows={4}
                                    value={form.conditions}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            conditions: event.target.value,
                                        }))
                                    }
                                    placeholder="Например: минимальный депозит, лимит пробега, условия по водителю."
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                            </div>

                            {selectedCar && (
                                <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f0dca0]">
                                    Для автомобиля <strong>{selectedCar.brand} {selectedCar.name}</strong>{' '}
                                    базовая цена в карточке сейчас составляет{' '}
                                    <strong>
                                        <FormattedPrice
                                            value={
                                                Number(
                                                    selectedCar.price_per_day ||
                                                        selectedCar.price ||
                                                        0,
                                                )
                                            }
                                        />{' '}
                                        ₸
                                    </strong>
                                    . Для точного расчета в калькуляторе используйте отдельные {form.durationUnit === 'hour' ? 'почасовые' : 'дневные'} тарифы ниже.
                                </div>
                            )}

                            {form.durationUnit === 'hour' && (
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                                    Для почасового режима задавайте отдельные слоты, например: 3-3, 6-6 или 12-12 часов.
                                </div>
                            )}

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
                                    {editingTariffId ? 'Сохранить изменения' : 'Добавить тариф'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="inline-flex items-center justify-center rounded-2xl border border-neutral-700 px-4 py-3 font-semibold text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                                >
                                    {editingTariffId ? (
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
                                <h2 className="text-2xl font-bold">Текущие тарифы</h2>
                                <p className="text-sm text-neutral-400">
                                    Здесь задаются дневные диапазоны и почасовые слоты для разных форматов аренды.
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

                        <div className="mt-6 space-y-5">
                            {groupedTariffs.map((group) => (
                                <div
                                    key={group.car.id}
                                    className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                {group.car.brand} {group.car.name}
                                            </h3>
                                            <p className="text-sm text-neutral-400">
                                                {group.car.class}
                                            </p>
                                        </div>
                                        <TagIcon className="h-6 w-6 text-[#d4af37]" />
                                    </div>

                                    {group.tariffs.length === 0 ? (
                                        <div className="mt-4 rounded-2xl border border-dashed border-neutral-700 px-4 py-4 text-sm text-neutral-400">
                                            Для этого автомобиля пока нет явных тарифов. Калькулятор использует только базовую цену без водителя по дням.
                                        </div>
                                    ) : (
                                        <div className="mt-4 space-y-3">
                                            {group.tariffs.map((tariff) => (
                                                <div
                                                    key={tariff.id}
                                                    className={`rounded-2xl border px-4 py-4 ${
                                                        editingTariffId === tariff.id
                                                            ? 'border-[#d4af37]/50 bg-[#d4af37]/10'
                                                            : 'border-neutral-800 bg-neutral-900'
                                                    }`}
                                                >
                                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                        <div className="space-y-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                        tariff.duration_unit ===
                                                                        'hour'
                                                                            ? 'bg-violet-500/15 text-violet-200'
                                                                            : 'bg-amber-500/15 text-amber-200'
                                                                    }`}
                                                                >
                                                                    {tariff.duration_unit ===
                                                                    'hour'
                                                                        ? 'Почасовой'
                                                                        : 'Посуточный'}
                                                                </span>
                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                        tariff.with_driver
                                                                            ? 'bg-blue-500/15 text-blue-200'
                                                                            : 'bg-emerald-500/15 text-emerald-200'
                                                                    }`}
                                                                >
                                                                    {tariff.with_driver
                                                                        ? 'С водителем'
                                                                        : 'Без водителя'}
                                                                </span>
                                                                <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-300">
                                                                    {formatRange(
                                                                        tariff.days_from,
                                                                        tariff.days_to,
                                                                        tariff.duration_unit,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <p className="text-lg font-bold text-white">
                                                                <FormattedPrice
                                                                    value={tariff.price_per_day}
                                                                />{' '}
                                                                ₸{' '}
                                                                {tariff.duration_unit ===
                                                                'hour'
                                                                    ? '/ слот'
                                                                    : '/ сутки'}
                                                            </p>
                                                            <p className="text-sm text-neutral-400">
                                                                {tariff.conditions ||
                                                                    'Без дополнительных условий.'}
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(tariff)}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                                                            >
                                                                <PencilSquareIcon className="h-5 w-5" />
                                                                Изменить
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleDelete(tariff)}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/10"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                                Удалить
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </AnimatedPageWrapper>
    );
}
