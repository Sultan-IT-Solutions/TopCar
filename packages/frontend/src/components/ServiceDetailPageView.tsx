'use client';

import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import NeedHelpCTA from '@/components/NeedHelpCTA';
import LocalizedLink from '@/components/LocalizedLink';
import { useTranslations } from '@/lib/i18n';
import { serviceDetailsByLocale } from '@/lib/service-details';

export default function ServiceDetailPageView({ slug }: { slug: string }) {
    const { locale, t } = useTranslations();
    const service =
        serviceDetailsByLocale[locale]?.[slug] ||
        serviceDetailsByLocale.ru[slug];

    const notFoundCopy =
        locale === 'en'
            ? {
                  title: 'Service not found',
                  description: 'We could not find the service you requested.',
              }
            : locale === 'kk'
              ? {
                    title: 'Қызмет табылмады',
                    description: 'Сұралған қызмет табылмады.',
                }
              : {
                    title: 'Услуга не найдена',
                    description:
                        'К сожалению, мы не смогли найти запрашиваемую вами услугу.',
                };

    if (!service) {
        return (
            <AnimatedPageWrapper>
                <Header />
                <main className="container mx-auto px-4 pb-16 pt-28 text-center sm:pb-20">
                    <h1 className="text-3xl font-bold">{notFoundCopy.title}</h1>
                    <p className="mt-4 text-muted-foreground">
                        {notFoundCopy.description}
                    </p>
                </main>
                <Footer />
            </AnimatedPageWrapper>
        );
    }

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
                                    name: t('nav.services'),
                                    item: 'https://topcar.club/services',
                                },
                                {
                                    '@type': 'ListItem',
                                    position: 3,
                                    name: service.title,
                                    item: `https://topcar.club/services/${slug}`,
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
                            <li>
                                <LocalizedLink
                                    href="/services"
                                    className="transition-colors hover:text-foreground"
                                >
                                    {t('nav.services')}
                                </LocalizedLink>
                            </li>
                            <li className="opacity-60">/</li>
                            <li
                                aria-current="page"
                                className="font-medium text-foreground"
                            >
                                {service.title}
                            </li>
                        </ol>
                    </nav>

                    <div className="mx-auto max-w-3xl">
                        <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
                            {service.title}
                        </h1>
                        <p className="mb-8 text-xl text-muted-foreground">
                            {service.description}
                        </p>
                        <div className="prose prose-invert lg:prose-xl prose-p:text-muted-foreground">
                            <p>{service.content}</p>
                        </div>
                    </div>

                    <div className="mx-auto mt-12 max-w-5xl">
                        <NeedHelpCTA source={`service-${slug}`} />
                    </div>
                </div>
            </main>
            <Footer />
        </AnimatedPageWrapper>
    );
}
