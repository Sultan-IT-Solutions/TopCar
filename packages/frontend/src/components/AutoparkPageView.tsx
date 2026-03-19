'use client';

import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import CarCatalog from '@/components/CarCatalog';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LocalizedLink from '@/components/LocalizedLink';
import SEOBlock from '@/components/SEOBlock';
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

    const configMessage =
        locale === 'en'
            ? 'The fleet section is being refreshed. If you need a car right now, our manager will help you choose an available option.'
            : locale === 'kk'
              ? 'Автопарк бөлімі жаңартылып жатыр. Егер сізге көлік дәл қазір қажет болса, менеджер қолжетімді нұсқаны таңдауға көмектеседі.'
              : 'Раздел автопарка обновляется. Если автомобиль нужен прямо сейчас, менеджер поможет подобрать доступный вариант.';

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

                    <h1 className="mb-4 text-center text-4xl font-bold text-foreground md:text-5xl">
                        {t('autopark.title')}
                    </h1>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
                        {t('autopark.description')}
                    </p>

                    {configMissing && (
                        <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-[#d4af37]/25 bg-neutral-900 px-6 py-4 text-center text-sm text-neutral-200">
                            {configMessage}
                        </div>
                    )}

                    <CarCatalog cars={cars} isLoading={isLoading} />
                </div>
                <SEOBlock page="autopark" />
            </main>
            <Footer />
        </AnimatedPageWrapper>
    );
}
