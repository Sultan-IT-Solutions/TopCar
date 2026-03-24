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
    normalizeGalleryImages,
} from '@/lib/car-utils';
import LocalizedLink from './LocalizedLink';

function getStartingPrice(car: Car): number {
    const tierPrices = (car.prices ?? [])
        .filter((price) => !price.with_driver && price.price_per_day > 0)
        .map((price) => price.price_per_day);
    const candidates = [car.price_per_day, car.price, ...tierPrices].filter(
        (value): value is number => typeof value === 'number' && value > 0,
    );

    if (candidates.length === 0) {
        return 0;
    }

    return Math.min(...candidates);
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
                className="group block h-full"
            >
                <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/8 bg-[#121212] shadow-[0_24px_80px_rgba(0,0,0,0.42)] transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-[#d4af37]/35 hover:shadow-[0_36px_100px_rgba(0,0,0,0.56)]">
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
                        <div className="grid grid-cols-2 gap-3">
                            {previewFacts.map((fact) => (
                                <div
                                    key={`${car.id}-${fact.label}`}
                                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
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

    const filteredCars = useMemo(() => {
        if (selectedCategory === 'all') return cars;
        return cars.filter((car) => car.class === selectedCategory);
    }, [cars, selectedCategory]);
    const gridClassName = useMemo(() => {
        if (filteredCars.length <= 1) {
            return 'mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-8';
        }

        if (filteredCars.length === 2) {
            return 'mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2';
        }

        return 'mx-auto mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3';
    }, [filteredCars.length]);
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

    return (
        <section
            id="car-catalog"
            className={`${showHeading ? 'px-4 py-16 sm:px-6 sm:py-20' : 'py-12 sm:py-16'}`}
        >
            <div className="mx-auto max-w-7xl">
                {showHeading && (
                    <FadeInWhenVisible>
                        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            {t('autopark.title')}{' '}
                            <span className="text-[#d4af37]">
                                {t('autopark.subtitle')}
                            </span>
                            <span className="mx-auto mt-4 block h-0.5 w-20 bg-[#d4af37]/50"></span>
                        </h2>
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
                                </div>
                            </div>
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
                            <FadeInWhenVisible key={car.id} className="flex">
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
