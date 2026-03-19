'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import FadeInWhenVisible from './FadeInWhenVisible';
import { Car } from '@/types';
import SkeletonCard from './SkeletonCard';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/lib/i18n';
import { getCarCategories, normalizeGalleryImages } from '@/lib/car-utils';
import LocalizedLink from './LocalizedLink';

function CarCard({
    car,
    getCategoryLabel,
}: {
    car: Car;
    getCategoryLabel: (category: string) => string;
}) {
    const { t, locale } = useTranslations();
    const notAvailableLabel =
        locale === 'en' ? 'n/a' : locale === 'kk' ? 'жоқ' : 'н/д';
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
                locale === 'en' ? 'Fuel' : locale === 'kk' ? 'Отын' : 'Топливо',
            value: car.fuel_type || notAvailableLabel,
        },
    ];
    const previewImages = normalizeGalleryImages(car.gallery_images).slice(
        0,
        3,
    );

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
                href={`/cars/${car.slug}`}
                className="group relative flex-grow overflow-hidden rounded-xl bg-black shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1.5"
            >
                <div className="relative aspect-[16/10] w-full">
                    <Image
                        src={car.image_url || '/cars/placeholder-car.png'}
                        alt={car.name || t('autopark.noName')}
                        fill
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                        priority={car.id <= 3}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

                    <div className="absolute left-4 top-4 flex items-center gap-2">
                        <span className="rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
                            {car.brand}
                        </span>
                        <span className="rounded-full border border-[#d4af37]/35 bg-[#d4af37]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f0dca0] backdrop-blur">
                            {getCategoryLabel(car.class)}
                        </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5 text-white transition-opacity duration-300 group-hover:opacity-0">
                        <h3
                            className="truncate text-base font-bold leading-tight sm:text-lg lg:text-xl"
                            title={car.name}
                        >
                            {car.name || t('autopark.noName')}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-[#d4af37]">
                            {t('common.more')}
                        </p>
                    </div>

                    <div className="absolute inset-0 z-10 flex flex-col justify-end bg-black/55 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-5">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0dca0]">
                                {locale === 'en'
                                    ? 'Quick Preview'
                                    : locale === 'kk'
                                      ? 'Жылдам шолу'
                                      : 'Быстрый просмотр'}
                            </p>
                            <h3 className="text-lg font-bold sm:text-xl">
                                {car.name || t('autopark.noName')}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-200 sm:text-sm">
                                {car.description || t('autopark.noDescription')}
                            </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {previewFacts.map((fact) => (
                                <div
                                    key={`${car.id}-${fact.label}`}
                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 backdrop-blur"
                                >
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">
                                        {fact.label}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-white">
                                        {fact.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {previewImages.length > 0 && (
                            <div className="mt-4 flex gap-2">
                                {previewImages.map((image, index) => (
                                    <div
                                        key={`${car.id}-preview-${index}`}
                                        className="relative h-14 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/30"
                                    >
                                        <Image
                                            src={image}
                                            alt={`${car.name} preview ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </LocalizedLink>
        </>
    );
}

export default function CarCatalog({
    cars = [],
    isLoading = false,
}: {
    cars?: Car[];
    isLoading?: boolean;
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

    return (
        <section id="car-catalog" className="px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-7xl">
                <FadeInWhenVisible>
                    <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        {t('autopark.title')}{' '}
                        <span className="text-[#d4af37]">
                            {t('autopark.subtitle')}
                        </span>
                        <span className="mx-auto mt-4 block h-0.5 w-20 bg-[#d4af37]/50"></span>
                    </h2>
                </FadeInWhenVisible>

                {categories.length > 0 && !isLoading && (
                    <FadeInWhenVisible className="mt-8 sm:mt-10">
                        <div className="flex flex-wrap items-center justify-center gap-3">
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
                                            selectedCategory === category
                                                ? 'border-[#d4af37] bg-[#d4af37] text-black'
                                                : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500 hover:text-white'
                                        }`}
                                    >
                                        {`${getCategoryLabel(category)} (${count})`}
                                    </button>
                                );
                            })}
                        </div>
                    </FadeInWhenVisible>
                )}

                {isLoading ? (
                    <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                ) : filteredCars.length > 0 ? (
                    <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
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
