'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import FadeInWhenVisible from './FadeInWhenVisible';
import { Car } from '@/types';
import SkeletonCard from './SkeletonCard';
import {
    ArrowUpRightIcon,
    NoSymbolIcon,
} from '@heroicons/react/24/outline';
import { useTranslations } from '@/lib/i18n';
import {
    ensureCarSlug,
    getCarCategories,
    isCarAvailable,
    normalizeGalleryImages,
} from '@/lib/car-utils';
import LocalizedLink from './LocalizedLink';

function getStartingPrice(car: Car): number {
    const tierPrices = (car.prices ?? [])
        .filter(
            (price) =>
                !price.with_driver &&
                price.price_per_day > 0 &&
                (price.duration_unit ?? 'day') === 'day',
        )
        .map((price) => price.price_per_day);
    const candidates = [car.price_per_day, car.price, ...tierPrices].filter(
        (value): value is number => typeof value === 'number' && value > 0,
    );

    if (candidates.length === 0) {
        return 0;
    }

    return Math.min(...candidates);
}

function supportsDriverMode(car: Car, withDriver: boolean): boolean {
    const prices = car.prices ?? [];

    if (withDriver) {
        return prices.some((price) => price.with_driver);
    }

    return (
        prices.some((price) => !price.with_driver) || getStartingPrice(car) > 0
    );
}

function supportsDurationUnit(car: Car, durationUnit: 'day' | 'hour'): boolean {
    const prices = car.prices ?? [];

    if (durationUnit === 'day' && getStartingPrice(car) > 0) {
        return true;
    }

    return prices.some(
        (price) =>
            (price.duration_unit ?? 'day') === durationUnit &&
            price.price_per_day > 0,
    );
}

function CarCard({
    car,
    getCategoryLabel,
}: {
    car: Car;
    getCategoryLabel: (category: string) => string;
}) {
    const { t, locale } = useTranslations();
    const priceFrom = getStartingPrice(car);
    const carSlug = ensureCarSlug(car);
    const notAvailableLabel =
        locale === 'en' ? 'n/a' : locale === 'kk' ? 'жоқ' : 'н/д';
    const primaryImage =
        car.image_url ||
        normalizeGalleryImages(car.gallery_images)[0] ||
        '/cars/placeholder-car.png';
    const previewFacts = [
        {
            label:
                locale === 'en' ? 'Class' : locale === 'kk' ? 'Санат' : 'Класс',
            value: getCategoryLabel(car.class),
        },
        {
            label: locale === 'en' ? 'Year' : locale === 'kk' ? 'Жылы' : 'Год',
            value: car.year ? String(car.year) : notAvailableLabel,
        },
        {
            label:
                locale === 'en' ? 'Seats' : locale === 'kk' ? 'Орын' : 'Мест',
            value: car.seats ? String(car.seats) : notAvailableLabel,
        },
        {
            label:
                locale === 'en'
                    ? 'Drive'
                    : locale === 'kk'
                      ? 'Жетек'
                      : 'Привод',
            value: car.drive_type || notAvailableLabel,
        },
    ];
    const previewImages = normalizeGalleryImages(car.gallery_images)
        .filter((image) => image !== primaryImage)
        .slice(0, 2);
    const isAvailable =
        typeof car.is_available === 'boolean'
            ? car.is_available
            : typeof car.available === 'boolean'
              ? car.available
              : true;
    const availabilityLabel =
        locale === 'en'
            ? isAvailable
                ? 'Available'
                : 'On request'
            : locale === 'kk'
              ? isAvailable
                  ? 'Қолжетімді'
                  : 'Сұраныс бойынша'
              : isAvailable
                ? 'Доступен'
                : 'Под запрос';
    const availabilityHint =
        locale === 'en'
            ? isAvailable
                ? 'Ready for booking now'
                : 'Final confirmation by manager'
            : locale === 'kk'
              ? isAvailable
                  ? 'Қазір броньдауға болады'
                  : 'Менеджер растағаннан кейін'
              : isAvailable
                ? 'Можно забронировать сейчас'
                : 'Подтверждается менеджером';
    const dayLabel =
        locale === 'en' ? 'day' : locale === 'kk' ? 'күн' : 'день';
    const formatPrice = (value: number) =>
        `${new Intl.NumberFormat(
            locale === 'en' ? 'en-US' : locale === 'kk' ? 'kk-KZ' : 'ru-RU',
        ).format(value)} ${t('common.currency')}`;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: car.name,
                        image: car.image_url || '/cars/placeholder-car.png',
                        description: car.description,
                        brand: car.brand,
                    }),
                }}
            />
            <LocalizedLink
                href={`/cars/${carSlug}`}
                className="group block h-full w-full"
            >
                <article className="flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/8 bg-[#121212] shadow-[0_24px_80px_rgba(0,0,0,0.42)] transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-[#d4af37]/35 hover:shadow-[0_36px_100px_rgba(0,0,0,0.56)]">
                    <div className="relative aspect-[16/11] w-full overflow-hidden">
                        <Image
                            src={primaryImage}
                            alt={car.name || t('autopark.noName')}
                            fill
                            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                            priority={car.id <= 3}
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.10)_0%,rgba(8,8,8,0.28)_36%,rgba(8,8,8,0.92)_100%)]" />

                        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/12 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                                    {car.brand}
                                </span>
                                <span className="rounded-full border border-[#d4af37]/35 bg-[#d4af37]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f0dca0] backdrop-blur">
                                    {getCategoryLabel(car.class)}
                                </span>
                            </div>

                            <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur ${
                                    isAvailable
                                        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                                        : 'border-white/12 bg-black/35 text-neutral-200'
                                }`}
                            >
                                {availabilityLabel}
                            </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <div className="flex items-end justify-between gap-4">
                                <div className="min-w-0">
                                    <h3
                                        className="truncate text-2xl font-semibold leading-tight text-white"
                                        title={car.name}
                                    >
                                        {car.name || t('autopark.noName')}
                                    </h3>
                                    <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-neutral-300">
                                        {car.description ||
                                            t('autopark.noDescription')}
                                    </p>
                                </div>

                                {priceFrom > 0 && (
                                    <div className="shrink-0 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-right backdrop-blur">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                                            {t('common.from')}
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-[#f0dca0]">
                                            {formatPrice(priceFrom)}
                                        </p>
                                        <p className="text-xs text-neutral-300">
                                            / {dayLabel}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-5 p-5">
                        <div className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.02] transition-all duration-300 group-hover:border-[#d4af37]/18 group-hover:bg-white/[0.04]">
                            <div className="grid max-h-0 grid-cols-2 gap-3 px-4 py-0 opacity-0 transition-all duration-300 ease-out group-hover:max-h-56 group-hover:px-4 group-hover:py-4 group-hover:opacity-100">
                                {previewFacts.map((fact) => (
                                    <div
                                        key={`${car.id}-${fact.label}`}
                                        className="rounded-2xl border border-white/8 bg-black/25 px-4 py-3"
                                    >
                                        <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                                            {fact.label}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-white">
                                            {fact.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {previewImages.length > 0 && (
                            <div className="flex gap-2">
                                {previewImages.map((image, index) => (
                                    <div
                                        key={`${car.id}-preview-${index}`}
                                        className="relative h-16 flex-1 overflow-hidden rounded-2xl border border-white/8 bg-black/30"
                                    >
                                        <Image
                                            src={image}
                                            alt={`${car.name} preview ${index + 1}`}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="128px"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                            <p className="text-sm text-neutral-400">
                                {availabilityHint}
                            </p>
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f0dca0] transition-transform duration-300 group-hover:translate-x-0.5">
                                {t('common.more')}
                                <ArrowUpRightIcon className="h-4 w-4" />
                            </span>
                        </div>
                    </div>
                </article>
            </LocalizedLink>
        </>
    );
}

export default function CarCatalog({
    cars = [],
    isLoading = false,
    showHeading = true,
}: {
    cars?: Car[];
    isLoading?: boolean;
    showHeading?: boolean;
}) {
    const { t, locale } = useTranslations();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [selectedRentalFormat, setSelectedRentalFormat] = useState('all');
    const [selectedDurationMode, setSelectedDurationMode] = useState('all');
    const [selectedAvailability, setSelectedAvailability] = useState('all');
    const [selectedFuelType, setSelectedFuelType] = useState('all');
    const [selectedDriveType, setSelectedDriveType] = useState('all');
    const [selectedSeats, setSelectedSeats] = useState('all');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('featured');

    const getCategoryLabel = (category: string) => {
        const categoryLabels: Record<string, string> = {
            Economy: t('autopark.filters.comfort'),
            Business: t('autopark.filters.business'),
            Premium: locale === 'en' ? 'Premium' : 'Премиум',
            Luxury: t('autopark.filters.luxury'),
        };

        return categoryLabels[category] || category;
    };

    const categories = useMemo(() => getCarCategories(cars), [cars]);
    const brands = useMemo(
        () =>
            Array.from(
                new Set(cars.map((car) => car.brand?.trim()).filter(Boolean)),
            ).sort((left, right) => String(left).localeCompare(String(right), 'ru')),
        [cars],
    );
    const fuelTypes = useMemo(
        () =>
            Array.from(
                new Set(cars.map((car) => car.fuel_type?.trim()).filter(Boolean)),
            ).sort((left, right) => String(left).localeCompare(String(right), 'ru')),
        [cars],
    );
    const driveTypes = useMemo(
        () =>
            Array.from(
                new Set(cars.map((car) => car.drive_type?.trim()).filter(Boolean)),
            ).sort((left, right) => String(left).localeCompare(String(right), 'ru')),
        [cars],
    );
    const seatOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    cars
                        .map((car) =>
                            typeof car.seats === 'number' && car.seats > 0
                                ? car.seats
                                : null,
                        )
                        .filter((value): value is number => value !== null),
                ),
            ).sort((left, right) => left - right),
        [cars],
    );

    const filterCopy =
        locale === 'en'
            ? {
                  brand: 'Brand',
                  format: 'Rental format',
                  durationMode: 'Duration',
                  availability: 'Availability',
                  fuel: 'Fuel',
                  drive: 'Drive',
                  seats: 'Seats',
                  maxPrice: 'Max daily price',
                  sort: 'Sort',
                  allBrands: 'Any brand',
                  allFormats: 'Any format',
                  allDurations: 'Days and hours',
                  allAvailability: 'All cars',
                  allFuel: 'Any fuel',
                  allDrive: 'Any drive',
                  allSeats: 'Any seating',
                  availableOnly: 'Available now',
                  onRequest: 'On request',
                  withDriver: 'With driver',
                  withoutDriver: 'Without driver',
                  byDay: 'By days',
                  byHour: 'By hours',
                  featured: 'Featured first',
                  priceAsc: 'Price: low to high',
                  priceDesc: 'Price: high to low',
                  yearDesc: 'Newest first',
                  titleAsc: 'Name A-Z',
                  reset: 'Reset filters',
              }
            : locale === 'kk'
              ? {
                    brand: 'Бренд',
                    format: 'Жалдау форматы',
                    durationMode: 'Ұзақтығы',
                    availability: 'Қолжетімділік',
                    fuel: 'Отын',
                    drive: 'Жетек',
                    seats: 'Орын саны',
                    maxPrice: 'Макс. тәуліктік баға',
                    sort: 'Сұрыптау',
                    allBrands: 'Кез келген бренд',
                    allFormats: 'Кез келген формат',
                    allDurations: 'Күн және сағат',
                    allAvailability: 'Барлық көлік',
                    allFuel: 'Кез келген отын',
                    allDrive: 'Кез келген жетек',
                    allSeats: 'Кез келген орын саны',
                    availableOnly: 'Қазір қолжетімді',
                    onRequest: 'Сұраныс бойынша',
                    withDriver: 'Жүргізушімен',
                    withoutDriver: 'Жүргізушісіз',
                    byDay: 'Күнмен',
                    byHour: 'Сағатпен',
                    featured: 'Маңыздысы алдымен',
                    priceAsc: 'Бағасы: төменнен жоғары',
                    priceDesc: 'Бағасы: жоғарыдан төмен',
                    yearDesc: 'Жаңа модельдер алдымен',
                    titleAsc: 'Атауы A-Z',
                    reset: 'Сүзгілерді тазалау',
                }
              : {
                    brand: 'Бренд',
                    format: 'Формат аренды',
                    durationMode: 'Длительность',
                    availability: 'Доступность',
                    fuel: 'Топливо',
                    drive: 'Привод',
                    seats: 'Места',
                    maxPrice: 'Макс. цена в сутки',
                    sort: 'Сортировка',
                    allBrands: 'Любой бренд',
                    allFormats: 'Любой формат',
                    allDurations: 'Дни и часы',
                    allAvailability: 'Все автомобили',
                    allFuel: 'Любое топливо',
                    allDrive: 'Любой привод',
                    allSeats: 'Любое количество мест',
                    availableOnly: 'Доступны сейчас',
                    onRequest: 'Под запрос',
                    withDriver: 'С водителем',
                    withoutDriver: 'Без водителя',
                    byDay: 'По дням',
                    byHour: 'По часам',
                    featured: 'Сначала рекомендованные',
                    priceAsc: 'Цена: по возрастанию',
                    priceDesc: 'Цена: по убыванию',
                    yearDesc: 'Сначала новее',
                    titleAsc: 'Название А-Я',
                    reset: 'Сбросить фильтры',
                };

    const filteredCars = useMemo(() => {
        const maxPriceValue = maxPrice ? Number(maxPrice) : 0;

        const nextCars = cars.filter((car) => {
            if (selectedCategory !== 'all' && car.class !== selectedCategory) {
                return false;
            }

            if (selectedBrand !== 'all' && car.brand !== selectedBrand) {
                return false;
            }

            if (
                selectedAvailability === 'available' &&
                !isCarAvailable(car)
            ) {
                return false;
            }

            if (
                selectedAvailability === 'request' &&
                isCarAvailable(car)
            ) {
                return false;
            }

            if (
                selectedRentalFormat === 'withDriver' &&
                !supportsDriverMode(car, true)
            ) {
                return false;
            }

            if (
                selectedRentalFormat === 'withoutDriver' &&
                !supportsDriverMode(car, false)
            ) {
                return false;
            }

            if (
                selectedDurationMode === 'day' &&
                !supportsDurationUnit(car, 'day')
            ) {
                return false;
            }

            if (
                selectedDurationMode === 'hour' &&
                !supportsDurationUnit(car, 'hour')
            ) {
                return false;
            }

            if (selectedFuelType !== 'all' && car.fuel_type !== selectedFuelType) {
                return false;
            }

            if (selectedDriveType !== 'all' && car.drive_type !== selectedDriveType) {
                return false;
            }

            if (selectedSeats !== 'all') {
                const minimumSeats = Number(selectedSeats);
                if (!car.seats || car.seats < minimumSeats) {
                    return false;
                }
            }

            if (maxPriceValue > 0 && getStartingPrice(car) > maxPriceValue) {
                return false;
            }

            return true;
        });

        return nextCars.sort((left, right) => {
            if (sortBy === 'priceAsc') {
                return getStartingPrice(left) - getStartingPrice(right);
            }

            if (sortBy === 'priceDesc') {
                return getStartingPrice(right) - getStartingPrice(left);
            }

            if (sortBy === 'yearDesc') {
                return (right.year ?? 0) - (left.year ?? 0);
            }

            if (sortBy === 'titleAsc') {
                return left.name.localeCompare(right.name, 'ru');
            }

            const featuredDelta =
                Number(Boolean(right.is_featured_home)) -
                Number(Boolean(left.is_featured_home));

            if (featuredDelta !== 0) {
                return featuredDelta;
            }

            const featuredOrderDelta =
                Number(left.featured_order ?? 0) -
                Number(right.featured_order ?? 0);

            if (featuredOrderDelta !== 0) {
                return featuredOrderDelta;
            }

            return left.name.localeCompare(right.name, 'ru');
        });
    }, [
        cars,
        maxPrice,
        selectedAvailability,
        selectedBrand,
        selectedCategory,
        selectedDriveType,
        selectedDurationMode,
        selectedFuelType,
        selectedRentalFormat,
        selectedSeats,
        sortBy,
    ]);
    const gridClassName = useMemo(
        () => 'mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3',
        [],
    );
    const sectionLabel =
        locale === 'en'
            ? 'Fleet selection'
            : locale === 'kk'
              ? 'Автопарк таңдауы'
              : 'Подбор автопарка';
    const resultsLabel =
        locale === 'en'
            ? `${filteredCars.length} cars in the showcase`
            : locale === 'kk'
              ? `Витринада ${filteredCars.length} көлік`
              : `В витрине ${filteredCars.length} автомобилей`;
    const resetFilters = () => {
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedRentalFormat('all');
        setSelectedDurationMode('all');
        setSelectedAvailability('all');
        setSelectedFuelType('all');
        setSelectedDriveType('all');
        setSelectedSeats('all');
        setMaxPrice('');
        setSortBy('featured');
    };

    return (
        <section
            id="car-catalog"
            className={`${showHeading ? 'px-4 py-16 sm:px-6 sm:py-20' : 'py-12 sm:py-16'}`}
        >
            <div className="mx-auto max-w-7xl">
                {showHeading && (
                    <FadeInWhenVisible>
                        <div className="text-center">
                            <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                {t('autopark.title')}
                            </p>
                            <h2 className="mt-3 text-4xl font-extrabold leading-[1.04] tracking-tight text-[#d4af37] sm:text-5xl lg:text-6xl">
                                {t('autopark.subtitle')}
                            </h2>
                            <span className="mx-auto mt-4 block h-0.5 w-20 bg-[#d4af37]/50"></span>
                        </div>
                    </FadeInWhenVisible>
                )}

                {categories.length > 0 && !isLoading && (
                    <FadeInWhenVisible
                        className={`${showHeading ? 'mt-8 sm:mt-10' : ''}`}
                    >
                        <div className="rounded-[28px] border border-white/8 bg-white/[0.025] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0dca0]/70">
                                        {sectionLabel}
                                    </p>
                                    <p className="mt-2 text-sm text-neutral-400">
                                        {resultsLabel}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory('all')}
                                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                                            selectedCategory === 'all'
                                                ? 'border-[#d4af37] bg-[#d4af37] text-black'
                                                : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500 hover:text-white'
                                        }`}
                                    >
                                        {t('autopark.filters.all')}
                                    </button>
                                    {categories.map((category) => {
                                        const count = cars.filter(
                                            (car) => car.class === category,
                                        ).length;
                                        return (
                                            <button
                                                key={category}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedCategory(category)
                                                }
                                                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                                                    selectedCategory ===
                                                    category
                                                        ? 'border-[#d4af37] bg-[#d4af37] text-black'
                                                        : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500 hover:text-white'
                                                }`}
                                            >
                                                {`${getCategoryLabel(category)} (${count})`}
                                            </button>
                                        );
                                    })}
                                    {!showHeading && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="rounded-full border border-neutral-700 bg-transparent px-4 py-2 text-sm font-semibold text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
                                        >
                                            {filterCopy.reset}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!showHeading && (
                                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    <label className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            {filterCopy.brand}
                                        </span>
                                        <select
                                            value={selectedBrand}
                                            onChange={(event) =>
                                                setSelectedBrand(event.target.value)
                                            }
                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]"
                                        >
                                            <option value="all">
                                                {filterCopy.allBrands}
                                            </option>
                                            {brands.map((brand) => (
                                                <option key={brand} value={brand}>
                                                    {brand}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            {filterCopy.format}
                                        </span>
                                        <select
                                            value={selectedRentalFormat}
                                            onChange={(event) =>
                                                setSelectedRentalFormat(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]"
                                        >
                                            <option value="all">
                                                {filterCopy.allFormats}
                                            </option>
                                            <option value="withoutDriver">
                                                {filterCopy.withoutDriver}
                                            </option>
                                            <option value="withDriver">
                                                {filterCopy.withDriver}
                                            </option>
                                        </select>
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            {filterCopy.durationMode}
                                        </span>
                                        <select
                                            value={selectedDurationMode}
                                            onChange={(event) =>
                                                setSelectedDurationMode(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]"
                                        >
                                            <option value="all">
                                                {filterCopy.allDurations}
                                            </option>
                                            <option value="day">
                                                {filterCopy.byDay}
                                            </option>
                                            <option value="hour">
                                                {filterCopy.byHour}
                                            </option>
                                        </select>
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            {filterCopy.availability}
                                        </span>
                                        <select
                                            value={selectedAvailability}
                                            onChange={(event) =>
                                                setSelectedAvailability(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]"
                                        >
                                            <option value="all">
                                                {filterCopy.allAvailability}
                                            </option>
                                            <option value="available">
                                                {filterCopy.availableOnly}
                                            </option>
                                            <option value="request">
                                                {filterCopy.onRequest}
                                            </option>
                                        </select>
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            {filterCopy.fuel}
                                        </span>
                                        <select
                                            value={selectedFuelType}
                                            onChange={(event) =>
                                                setSelectedFuelType(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]"
                                        >
                                            <option value="all">
                                                {filterCopy.allFuel}
                                            </option>
                                            {fuelTypes.map((fuelType) => (
                                                <option
                                                    key={fuelType}
                                                    value={fuelType}
                                                >
                                                    {fuelType}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            {filterCopy.drive}
                                        </span>
                                        <select
                                            value={selectedDriveType}
                                            onChange={(event) =>
                                                setSelectedDriveType(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]"
                                        >
                                            <option value="all">
                                                {filterCopy.allDrive}
                                            </option>
                                            {driveTypes.map((driveType) => (
                                                <option
                                                    key={driveType}
                                                    value={driveType}
                                                >
                                                    {driveType}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            {filterCopy.seats}
                                        </span>
                                        <select
                                            value={selectedSeats}
                                            onChange={(event) =>
                                                setSelectedSeats(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]"
                                        >
                                            <option value="all">
                                                {filterCopy.allSeats}
                                            </option>
                                            {seatOptions.map((seatValue) => (
                                                <option
                                                    key={seatValue}
                                                    value={seatValue}
                                                >
                                                    {seatValue}+
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            {filterCopy.maxPrice}
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={maxPrice}
                                            onChange={(event) =>
                                                setMaxPrice(event.target.value)
                                            }
                                            placeholder="50000"
                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]"
                                        />
                                    </label>

                                    <label className="space-y-2 xl:col-span-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                            {filterCopy.sort}
                                        </span>
                                        <select
                                            value={sortBy}
                                            onChange={(event) =>
                                                setSortBy(event.target.value)
                                            }
                                            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]"
                                        >
                                            <option value="featured">
                                                {filterCopy.featured}
                                            </option>
                                            <option value="priceAsc">
                                                {filterCopy.priceAsc}
                                            </option>
                                            <option value="priceDesc">
                                                {filterCopy.priceDesc}
                                            </option>
                                            <option value="yearDesc">
                                                {filterCopy.yearDesc}
                                            </option>
                                            <option value="titleAsc">
                                                {filterCopy.titleAsc}
                                            </option>
                                        </select>
                                    </label>
                                </div>
                            )}
                        </div>
                    </FadeInWhenVisible>
                )}

                {isLoading ? (
                    <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                ) : filteredCars.length > 0 ? (
                    <div className={gridClassName}>
                        {filteredCars.map((car) => (
                            <FadeInWhenVisible
                                key={car.id}
                                className="flex w-full"
                            >
                                <CarCard
                                    car={car}
                                    getCategoryLabel={getCategoryLabel}
                                />
                            </FadeInWhenVisible>
                        ))}
                    </div>
                ) : (
                    <FadeInWhenVisible>
                        <div className="py-16 text-center sm:py-20">
                            <NoSymbolIcon className="mx-auto mb-4 h-16 w-16 text-neutral-700" />
                            <p className="mb-2 text-xl font-semibold text-neutral-300">
                                {t('autopark.notFound')}
                            </p>
                            <p className="mb-6 text-neutral-400">
                                {t('autopark.tryChangeFilters')}
                            </p>
                        </div>
                    </FadeInWhenVisible>
                )}
            </div>
        </section>
    );
}
