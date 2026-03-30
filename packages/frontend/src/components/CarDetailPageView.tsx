'use client';

import Image from 'next/image';
import { Zap, Fuel, Dna, Users, Info, ClockIcon } from 'lucide-react';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import CarQuickBookingCard from '@/components/CarQuickBookingCard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import NeedHelpCTA from '@/components/NeedHelpCTA';
import LocalizedLink from '@/components/LocalizedLink';
import { useTranslations } from '@/lib/i18n';
import { Car } from '@/types';

export default function CarDetailPageView({
    car,
    slug,
}: {
    car: Car;
    slug: string;
}) {
    const { locale, t } = useTranslations();

    const copy =
        locale === 'en'
            ? {
                  breadcrumbs: 'Breadcrumbs',
                  power: 'Power',
                  horsepower: 'hp',
                  year: 'Model year',
                  fuel: 'Fuel type',
                  drive: 'Drive type',
                  seats: 'Seats',
                  acceleration: '0-100 km/h',
                  seconds: 'sec',
                  notAvailable: 'n/a',
              }
            : locale === 'kk'
              ? {
                    breadcrumbs: 'Навигация жолы',
                    power: 'Қуаты',
                    horsepower: 'а.к.',
                    year: 'Шығарылған жылы',
                    fuel: 'Отын түрі',
                    drive: 'Жетек түрі',
                    seats: 'Орын саны',
                    acceleration: '0-100 км/сағ',
                    seconds: 'сек',
                    notAvailable: 'жоқ',
                }
              : {
                    breadcrumbs: 'Хлебные крошки',
                    power: 'Мощность',
                    horsepower: 'л.с.',
                    year: 'Год выпуска',
                    fuel: 'Тип топлива',
                    drive: 'Привод',
                    seats: 'Кол-во мест',
                    acceleration: 'Разгон до 100',
                    seconds: 'сек',
                    notAvailable: 'н/д',
                };

    const features = [
        {
            icon: Zap,
            label: copy.power,
            value: car.power
                ? `${car.power} ${copy.horsepower}`
                : copy.notAvailable,
        },
        {
            icon: Info,
            label: copy.year,
            value: car.year ? String(car.year) : copy.notAvailable,
        },
        {
            icon: Fuel,
            label: copy.fuel,
            value: car.fuel_type || copy.notAvailable,
        },
        {
            icon: Dna,
            label: copy.drive,
            value: car.drive_type || copy.notAvailable,
        },
        {
            icon: Users,
            label: copy.seats,
            value: car.seats ? String(car.seats) : copy.notAvailable,
        },
        {
            icon: ClockIcon,
            label: copy.acceleration,
            value: car.acceleration
                ? `${car.acceleration} ${copy.seconds}`
                : copy.notAvailable,
        },
    ];

    return (
        <AnimatedPageWrapper>
            <Header />
            <main className="min-h-screen bg-neutral-950 pt-20 font-sans text-white">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                {
                                    '@type': 'ListItem',
                                    position: 1,
                                    name: t('nav.home'),
                                    item: 'https://topcar.club/',
                                },
                                {
                                    '@type': 'ListItem',
                                    position: 2,
                                    name: t('nav.autopark'),
                                    item: 'https://topcar.club/autopark',
                                },
                                {
                                    '@type': 'ListItem',
                                    position: 3,
                                    name: car.name,
                                    item: `https://topcar.club/cars/${slug}`,
                                },
                            ],
                        }),
                    }}
                />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Product',
                            name: car.name,
                            description:
                                car.full_description || car.description,
                            image: car.gallery_images?.length
                                ? car.gallery_images
                                : [car.image_url],
                            brand: car.brand
                                ? { '@type': 'Brand', name: car.brand }
                                : undefined,
                            url: `https://topcar.club/cars/${slug}`,
                        }),
                    }}
                />

                <nav
                    aria-label={copy.breadcrumbs}
                    className="mx-auto mb-4 max-w-6xl px-4 text-sm text-neutral-400 sm:px-6"
                >
                    <ol className="flex flex-wrap items-center gap-2">
                        <li>
                            <LocalizedLink
                                href="/"
                                className="hover:text-white"
                            >
                                {t('nav.home')}
                            </LocalizedLink>
                        </li>
                        <li className="opacity-60">/</li>
                        <li>
                            <LocalizedLink
                                href="/autopark"
                                className="hover:text-white"
                            >
                                {t('nav.autopark')}
                            </LocalizedLink>
                        </li>
                        <li className="opacity-60">/</li>
                        <li
                            aria-current="page"
                            className="max-w-[60vw] truncate text-white sm:max-w-none"
                        >
                            {car.name}
                        </li>
                    </ol>
                </nav>

                <section className="px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className="space-y-6">
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 shadow-2xl">
                                <Image
                                    src={car.image_url}
                                    alt={car.name}
                                    fill
                                    priority
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                            {car.gallery_images &&
                                car.gallery_images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-4">
                                        {car.gallery_images.map(
                                            (img, index) => (
                                                <div
                                                    key={index}
                                                    className="relative aspect-video overflow-hidden rounded-md bg-neutral-800"
                                                >
                                                    <Image
                                                        src={img}
                                                        alt={`${car.name} - ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 640px) 33vw, 25vw"
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                        </div>

                        <div className="self-start space-y-8 rounded-2xl border border-neutral-700/80 bg-neutral-900 p-6 shadow-xl sm:p-8 lg:sticky lg:top-28">
                            <div>
                                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#d4af37]">
                                    {car.brand} &bull; {car.class}
                                </p>
                                <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                                    {car.name}
                                </h1>
                                <p className="text-sm leading-relaxed text-neutral-400 sm:text-base">
                                    {car.full_description || car.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-neutral-800 pt-6 text-sm">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <feature.icon className="h-5 w-5 flex-shrink-0 text-[#d4af37]" />
                                        <div>
                                            <p className="text-neutral-400">
                                                {feature.label}:
                                            </p>
                                            <p className="font-semibold text-white">
                                                {feature.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <CarQuickBookingCard car={car} />
                        </div>
                    </div>

                    <div className="mx-auto mt-12 max-w-6xl">
                        <NeedHelpCTA source="car-detail" />
                    </div>
                </section>
            </main>
            <Footer />
        </AnimatedPageWrapper>
    );
}
