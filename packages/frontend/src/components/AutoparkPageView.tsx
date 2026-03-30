'use client';

import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import CarCatalog from '@/components/CarCatalog';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import NeedHelpCTA from '@/components/NeedHelpCTA';
import LocalizedLink from '@/components/LocalizedLink';
import SEOBlock from '@/components/SEOBlock';
import { getCarCategories, isCarAvailable } from '@/lib/car-utils';
import { Car } from '@/types';
import { useTranslations } from '@/lib/i18n';

export default function AutoparkPageView({
    cars,
    isLoading,
    configMissing,
}: {
    cars: Car[];
    isLoading: boolean;
    configMissing: boolean;
}) {
    const { t, locale } = useTranslations();
    const availableCarsCount = cars.filter(isCarAvailable).length;
    const categoriesCount = getCarCategories(cars).length;

    const configMessage =
        locale === 'en'
            ? 'The fleet section is being refreshed. If you need a car right now, our manager will help you choose an available option.'
            : locale === 'kk'
              ? 'Автопарк бөлімі жаңартылып жатыр. Егер сізге көлік дәл қазір қажет болса, менеджер қолжетімді нұсқаны таңдауға көмектеседі.'
              : 'Раздел автопарка обновляется. Если автомобиль нужен прямо сейчас, менеджер поможет подобрать доступный вариант.';
    const showcaseLabel =
        locale === 'en'
            ? 'TopCar Collection'
            : locale === 'kk'
              ? 'TopCar Жинағы'
              : 'Коллекция TopCar';
    const availableLabel =
        locale === 'en'
            ? `${availableCarsCount} available now`
            : locale === 'kk'
              ? `Қазір қолжетімді: ${availableCarsCount}`
              : `Сейчас доступны: ${availableCarsCount}`;
    const categoryLabel =
        locale === 'en'
            ? `${categoriesCount} curated categories`
            : locale === 'kk'
              ? `Санаттар саны: ${categoriesCount}`
              : `Подобранных категорий: ${categoriesCount}`;

    return (
        <AnimatedPageWrapper>
            <Header />
            <main className="bg-background pb-16 pt-20 sm:pb-20">
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
                            ],
                        }),
                    }}
                />
                <div className="container mx-auto px-4 pt-8 sm:pt-12">
                    <nav
                        aria-label="Breadcrumbs"
                        className="mb-6 text-sm text-muted-foreground"
                    >
                        <ol className="flex items-center gap-2">
                            <li>
                                <LocalizedLink
                                    href="/"
                                    className="transition-colors hover:text-foreground"
                                >
                                    {t('nav.home')}
                                </LocalizedLink>
                            </li>
                            <li className="opacity-60">/</li>
                            <li
                                aria-current="page"
                                className="font-medium text-foreground"
                            >
                                {t('nav.autopark')}
                            </li>
                        </ol>
                    </nav>

                    <section className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),rgba(13,13,13,0.96)_38%,rgba(10,10,10,1)_100%)] px-6 py-10 shadow-[0_32px_120px_rgba(0,0,0,0.42)] sm:px-10 sm:py-12">
                        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
                        <div className="mx-auto max-w-5xl text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#f0dca0]/80">
                                {showcaseLabel}
                            </p>
                            <p className="mt-5 text-3xl font-semibold leading-none text-white sm:text-4xl lg:text-5xl">
                                {t('autopark.title')}
                            </p>
                            <h1 className="mt-3 text-4xl font-semibold leading-[1.02] text-[#d4af37] sm:text-5xl lg:text-6xl">
                                {t('autopark.subtitle')}
                            </h1>
                            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-neutral-300 sm:text-lg">
                                {t('autopark.description')}
                            </p>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-100 backdrop-blur">
                                    {availableLabel}
                                </div>
                                <div className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-2 text-sm font-medium text-[#f0dca0] backdrop-blur">
                                    {categoryLabel}
                                </div>
                                <LocalizedLink
                                    href="/contacts"
                                    className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-[#d4af37]/35 hover:text-white"
                                >
                                    {locale === 'en'
                                        ? 'Request selection'
                                        : locale === 'kk'
                                          ? 'Іріктеу сұрау'
                                          : 'Запросить подбор'}
                                </LocalizedLink>
                            </div>

                            {configMissing && (
                                <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-[#d4af37]/20 bg-black/30 px-6 py-4 text-center text-sm text-neutral-200 backdrop-blur">
                                    {configMessage}
                                </div>
                            )}
                        </div>
                    </section>

                    <CarCatalog
                        cars={cars}
                        isLoading={isLoading}
                        showHeading={false}
                    />
                    <div className="mt-12">
                        <NeedHelpCTA source="autopark" />
                    </div>
                </div>
                <SEOBlock page="autopark" />
            </main>
            <Footer />
        </AnimatedPageWrapper>
    );
}
