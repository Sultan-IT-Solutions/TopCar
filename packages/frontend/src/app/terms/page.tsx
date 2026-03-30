'use client';

// `useState` and `LoginModal` are no longer needed here
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import FadeInWhenVisible from '@/components/FadeInWhenVisible';
import NeedHelpCTA from '@/components/NeedHelpCTA';
import { useTranslations } from '@/lib/i18n';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { getLocalizedList, getLocalizedText } from '@/lib/site-config';
import {
    ShieldCheckIcon,
    CurrencyDollarIcon,
    IdentificationIcon,
    NoSymbolIcon,
    MapPinIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
const termIcons = {
    ShieldCheckIcon,
    CurrencyDollarIcon,
    IdentificationIcon,
    NoSymbolIcon,
    MapPinIcon,
    ExclamationTriangleIcon,
} as const;

export default function TermsPage() {
    const { locale } = useTranslations();
    const { termsSections } = useSiteConfig();
    const currentContent =
        locale === 'en'
            ? {
                  title: 'Rental',
                  accent: 'Terms',
                  description:
                      'Clear and transparent rules so you know exactly what to expect before the booking starts.',
              }
            : locale === 'kk'
              ? {
                    title: 'Жалдау',
                    accent: 'Шарттары',
                    description:
                        'Көлікті жайлы әрі сенімді пайдалану үшін барлық негізгі талаптар алдын ала ашық көрсетілген.',
                }
              : {
                    title: 'Условия',
                    accent: 'Аренды',
                    description:
                        'Прозрачные и понятные условия для вашего спокойствия и комфортного пользования нашими автомобилями.',
                };

    return (
        <AnimatedPageWrapper>
            <Header />

            <main className="min-h-screen bg-neutral-950 pt-20 text-white font-sans">
                <section className="relative bg-gradient-to-b from-black via-neutral-900 to-neutral-950 px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
                    <div
                        className="absolute inset-0 bg-repeat opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "url('/patterns/geometric-luxury.svg')",
                        }}
                    ></div>
                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <FadeInWhenVisible>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                                {currentContent.title}{' '}
                                <span className="text-[#d4af37]">
                                    {currentContent.accent}
                                </span>
                            </h1>
                            <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                                {currentContent.description}
                            </p>
                        </FadeInWhenVisible>
                    </div>
                </section>

                <section className="px-4 pb-16 pt-0 sm:px-6 sm:pb-20">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        {termsSections.map((term, idx) => {
                            const Icon =
                                termIcons[term.icon as keyof typeof termIcons] ??
                                ShieldCheckIcon;
                            return (
                                <FadeInWhenVisible
                                    key={term.id}
                                    delay={idx * 0.1}
                                >
                                    <div className="h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
                                        <div className="mb-5 flex items-center gap-4">
                                            <Icon className="h-8 w-8 text-[#d4af37]" />
                                            <h2 className="text-2xl font-bold text-white">
                                                {getLocalizedText(
                                                    term.title,
                                                    locale,
                                                )}
                                            </h2>
                                        </div>
                                        <ul className="list-inside list-disc space-y-2.5 text-neutral-300">
                                            {getLocalizedList(
                                                term.points,
                                                locale,
                                            ).map((point, pIdx) => (
                                                <li key={pIdx}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </FadeInWhenVisible>
                            );
                        })}
                    </div>

                    <div className="mx-auto mt-12 max-w-5xl">
                        <NeedHelpCTA source="terms" />
                    </div>
                </section>
            </main>

            <Footer />
        </AnimatedPageWrapper>
    );
}
