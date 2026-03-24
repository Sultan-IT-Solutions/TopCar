'use client';

export const dynamic = 'force-dynamic';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    PencilSquareIcon,
    PhotoIcon,
    PlusCircleIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import { csrfClientHelper } from '@/lib/csrf-client';
import { useAdminSession } from '@/hooks/useAdminSession';

type AdminCar = {
    id: number;
    name: string;
    slug?: string;
    brand: string;
    class: string;
    price: number;
    image_url: string;
    description?: string;
    fuel_type?: string;
    drive_type?: string;
    power?: number | null;
    acceleration?: number | null;
    year?: number | null;
    seats?: number | null;
    created_at?: string;
};

const initialFormState = {
    name: '',
    brand: '',
    class: 'Business',
    price: '',
    description: '',
    fuelType: '',
    driveType: '',
    power: '',
    acceleration: '',
    year: '',
    seats: '',
    file: null as File | null,
};

export default function AdminCarsPage() {
    const { admin, isLoading: isLoadingSession, logout } = useAdminSession();
    const [cars, setCars] = useState<AdminCar[]>([]);
    const [isLoadingCars, setIsLoadingCars] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [form, setForm] = useState(initialFormState);
    const [preview, setPreview] = useState<string | null>(null);
    const [editingCarId, setEditingCarId] = useState<number | null>(null);

    const loadCars = async () => {
        setIsLoadingCars(true);
        setError('');

        try {
            const response = await fetch('/api/admin/cars', {
                cache: 'no-store',
                credentials: 'same-origin',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось загрузить автомобили.');
            }

            setCars(Array.isArray(data) ? data : []);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Не удалось загрузить автомобили.',
            );
        } finally {
            setIsLoadingCars(false);
        }
    };

    useEffect(() => {
        if (admin) {
            void loadCars();
        }
    }, [admin]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setForm((current) => ({ ...current, file }));
        setMessage('');

        if (!file) {
            setPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
    };

    const startEditing = (car: AdminCar) => {
        setEditingCarId(car.id);
        setError('');
        setMessage('');
        setForm({
            name: car.name || '',
            brand: car.brand || '',
            class: car.class || 'Business',
            price: car.price ? String(car.price) : '',
            description: car.description || '',
            fuelType: car.fuel_type || '',
            driveType: car.drive_type || '',
            power: car.power ? String(car.power) : '',
            acceleration: car.acceleration ? String(car.acceleration) : '',
            year: car.year ? String(car.year) : '',
            seats: car.seats ? String(car.seats) : '',
            file: null,
        });
        setPreview(car.image_url || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingCarId(null);
        setForm(initialFormState);
        setPreview(null);
        setError('');
        setMessage('');
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');
        setMessage('');

        try {
            const formData = new FormData();
            formData.set('name', form.name);
            formData.set('brand', form.brand);
            formData.set('class', form.class);
            formData.set('price', form.price);
            formData.set('description', form.description);
            formData.set('fuel_type', form.fuelType);
            formData.set('drive_type', form.driveType);
            formData.set('power', form.power);
            formData.set('acceleration', form.acceleration);
            formData.set('year', form.year);
            formData.set('seats', form.seats);

            if (form.file) {
                formData.set('file', form.file);
            }

            const isEditing = editingCarId !== null;
            const response = await fetch(
                isEditing ? `/api/admin/cars/${editingCarId}` : '/api/admin/cars',
                {
                method: isEditing ? 'PATCH' : 'POST',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders(),
                body: formData,
                },
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message ||
                        (isEditing
                            ? 'Не удалось обновить автомобиль.'
                            : 'Не удалось добавить автомобиль.'),
                );
            }

            resetForm();
            setMessage(
                isEditing
                    ? `Автомобиль "${data.name}" успешно обновлен.`
                    : `Автомобиль "${data.name}" успешно добавлен.`,
            );
            await loadCars();
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : editingCarId !== null
                      ? 'Не удалось обновить автомобиль.'
                      : 'Не удалось добавить автомобиль.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (car: AdminCar) => {
        if (!window.confirm(`Удалить автомобиль "${car.name}"?`)) {
            return;
        }

        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/admin/cars/${car.id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders(),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось удалить автомобиль.');
            }

            setCars((current) => current.filter((item) => item.id !== car.id));
            setMessage(`Автомобиль "${car.name}" удален.`);
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Не удалось удалить автомобиль.',
            );
        }
    };

    const sortedCars = useMemo(
        () =>
            [...cars].sort((left, right) =>
                left.name.localeCompare(right.name, 'ru'),
            ),
        [cars],
    );

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
                            <h1 className="text-xl font-bold">Автопарк</h1>
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

                <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[420px_minmax(0,1fr)] sm:px-6 lg:px-8">
                    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
                        <div className="flex items-center gap-3">
                            <PlusCircleIcon className="h-8 w-8 text-[#d4af37]" />
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {editingCarId !== null
                                        ? 'Редактировать автомобиль'
                                        : 'Добавить автомобиль'}
                                </h2>
                                <p className="text-sm text-neutral-400">
                                    {editingCarId !== null
                                        ? 'Изменения сохраняются сразу в каталог. Базовый тариф без водителя синхронизируется с новой ценой.'
                                        : 'После создания автоматически добавляется базовый тариф без водителя на 1-365 дней. Отдельные тарифы по форматам аренды настраиваются в разделе тарифов.'}
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/admin/tariffs"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                        >
                            Настроить тарифы
                        </Link>

                        {editingCarId !== null && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="mt-4 ml-3 inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                            >
                                <XMarkIcon className="h-4 w-4" />
                                Отменить редактирование
                            </button>
                        )}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <input
                                value={form.name}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="Название"
                                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                            />
                            <input
                                value={form.brand}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        brand: event.target.value,
                                    }))
                                }
                                placeholder="Бренд"
                                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                            />
                            <select
                                value={form.class}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        class: event.target.value,
                                    }))
                                }
                                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                            >
                                <option value="Economy">Economy</option>
                                <option value="Business">Business</option>
                                <option value="Premium">Premium</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                            <input
                                value={form.price}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        price: event.target.value,
                                    }))
                                }
                                placeholder="Цена за сутки"
                                type="number"
                                min="1"
                                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                            />
                            <textarea
                                value={form.description}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        description: event.target.value,
                                    }))
                                }
                                placeholder="Краткое описание"
                                rows={4}
                                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    value={form.year}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            year: event.target.value,
                                        }))
                                    }
                                    placeholder="Год выпуска"
                                    type="number"
                                    min="1900"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                                <input
                                    value={form.seats}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            seats: event.target.value,
                                        }))
                                    }
                                    placeholder="Количество мест"
                                    type="number"
                                    min="1"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    value={form.fuelType}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            fuelType: event.target.value,
                                        }))
                                    }
                                    placeholder="Тип топлива"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                                <input
                                    value={form.driveType}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            driveType: event.target.value,
                                        }))
                                    }
                                    placeholder="Привод"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    value={form.power}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            power: event.target.value,
                                        }))
                                    }
                                    placeholder="Мощность, л.с."
                                    type="number"
                                    min="1"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                                <input
                                    value={form.acceleration}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            acceleration: event.target.value,
                                        }))
                                    }
                                    placeholder="Разгон до 100, сек"
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                />
                            </div>
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-600 bg-neutral-950 px-4 py-4 text-sm text-neutral-300 transition hover:border-[#d4af37]/50">
                                <PhotoIcon className="h-5 w-5" />
                                <span>
                                    {editingCarId !== null
                                        ? 'Заменить изображение'
                                        : 'Выбрать изображение'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>

                            {preview && (
                                <div className="relative h-52 overflow-hidden rounded-2xl border border-neutral-800">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        sizes="420px"
                                        unoptimized
                                    />
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

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d4af37] px-4 py-3 font-semibold text-black transition hover:bg-[#c0982c] disabled:opacity-70"
                            >
                                {isSubmitting && (
                                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                )}
                                {isSubmitting
                                    ? 'Сохраняем…'
                                    : editingCarId !== null
                                      ? 'Сохранить изменения'
                                      : 'Добавить автомобиль'}
                            </button>
                        </form>
                    </section>

                    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">Текущий каталог</h2>
                                <p className="text-sm text-neutral-400">
                                    Только server-side чтение и удаление.
                                </p>
                            </div>
                            <button
                                onClick={() => void loadCars()}
                                className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                            >
                                <ArrowPathIcon
                                    className={`h-5 w-5 ${isLoadingCars ? 'animate-spin' : ''}`}
                                />
                                Обновить
                            </button>
                        </div>

                        {isLoadingCars ? (
                            <div className="flex min-h-[320px] items-center justify-center">
                                <ArrowPathIcon className="h-10 w-10 animate-spin text-[#d4af37]" />
                            </div>
                        ) : sortedCars.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-neutral-800 bg-black/20 px-4 py-10 text-center text-neutral-400">
                                В каталоге пока нет автомобилей.
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {sortedCars.map((car) => (
                                    <article
                                        key={car.id}
                                        className="overflow-hidden rounded-3xl border border-neutral-800 bg-black/20"
                                    >
                                        <div className="relative aspect-[4/3]">
                                            <Image
                                                src={car.image_url || '/cars/placeholder-car.png'}
                                                alt={car.name}
                                                fill
                                                className="object-cover"
                                                sizes="320px"
                                            />
                                        </div>
                                        <div className="space-y-2 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-bold text-white">
                                                        {car.name}
                                                    </h3>
                                                    <p className="text-sm text-neutral-400">
                                                        {car.brand} • {car.class}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => startEditing(car)}
                                                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-neutral-200 transition hover:border-[#d4af37]/30 hover:text-white"
                                                        title="Редактировать"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => void handleDelete(car)}
                                                        className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20"
                                                        title="Удалить"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {car.description && (
                                                <p className="line-clamp-3 text-sm leading-6 text-neutral-400">
                                                    {car.description}
                                                </p>
                                            )}
                                            <p className="text-sm font-semibold text-[#d4af37]">
                                                {Number(car.price).toLocaleString('ru-RU')} ₸ / сутки
                                            </p>
                                            {(car.year ||
                                                car.seats ||
                                                car.drive_type ||
                                                car.fuel_type ||
                                                car.power ||
                                                car.acceleration) && (
                                                <div className="flex flex-wrap gap-2">
                                                    {car.year && (
                                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                                                            {car.year}
                                                        </span>
                                                    )}
                                                    {car.seats && (
                                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                                                            {car.seats} мест
                                                        </span>
                                                    )}
                                                    {car.drive_type && (
                                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                                                            {car.drive_type}
                                                        </span>
                                                    )}
                                                    {car.fuel_type && (
                                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                                                            {car.fuel_type}
                                                        </span>
                                                    )}
                                                    {car.power && (
                                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                                                            {car.power} л.с.
                                                        </span>
                                                    )}
                                                    {car.acceleration && (
                                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                                                            0-100: {car.acceleration} сек
                                                        </span>
                                                    )}
                                                </div>
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
