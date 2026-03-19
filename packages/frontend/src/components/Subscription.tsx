// src/components/Subscription.tsx
'use client';

import FadeInWhenVisible from './FadeInWhenVisible';
import LocalizedLink from '@/components/LocalizedLink';
import {
    CheckBadgeIcon,
    CurrencyEuroIcon,
    SparklesIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useTranslations } from '@/lib/i18n';

type Benefit = {
    name: string;
    description?: string;
    Icon: React.ForwardRefExoticComponent<
        Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
            title?: string | undefined;
            titleId?: string | undefined;
        } & React.RefAttributes<SVGSVGElement>
    >;
};

export default function Subscription() {
    const { t } = useTranslations();
    const benefits: Benefit[] = [
        {
            name: t('club.exclusiveRates'),
            description: t('club.exclusiveRatesDesc'),
            Icon: CurrencyEuroIcon,
        },
        {
            name: t('club.priorityBooking'),
            description: t('club.priorityBookingDesc'),
            Icon: SparklesIcon,
        },
        {
            name: t('club.concierge'),
            description: t('club.conciergeDesc'),
            Icon: CheckBadgeIcon,
        },
    ];

    return (
        <section
            id="subscription"
            className="py-24 sm:py-32 bg-neutral-950 text-white"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <FadeInWhenVisible>
                    <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center tracking-tight">
                        {t('club.title')}
                    </h2>
                    <p className="text-lg sm:text-xl text-neutral-400 mb-16 sm:mb-20 text-center max-w-2xl mx-auto">
                        {t('club.desc')}
                    </p>
                </FadeInWhenVisible>

                <div
                    className="bg-gradient-to-br from-neutral-900 to-black border border-[#d4af37]/30 rounded-2xl shadow-2xl 
                     p-8 sm:p-12 md:p-16"
                >
                    <FadeInWhenVisible delay={0.05}>
                        <div className="mb-10 rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8">
                            <div className="flex flex-col gap-3 text-center">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f0dca0]">
                                    {t('club.compareTitle')}
                                </p>
                                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                                    {t('club.compareSubtitle')}
                                </h3>
                            </div>
                            <div className="mt-8 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-6 text-left">
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                        {t('club.withoutSubscription')}
                                    </p>
                                    <p className="mt-4 text-4xl font-black text-white">
                                        {t('club.fullPrice')}
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                                        {t('club.withoutSubscriptionDesc')}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#d4af37]/35 bg-[#d4af37]/10 p-6 text-left shadow-[0_20px_60px_rgba(212,175,55,0.12)]">
                                    <p className="inline-flex rounded-full border border-[#d4af37]/40 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f0dca0]">
                                        {t('club.save25')}
                                    </p>
                                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                                        {t('club.withSubscription')}
                                    </p>
                                    <p className="mt-4 text-4xl font-black text-white">
                                        {t('club.discountPrice')}
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-neutral-200">
                                        {t('club.withSubscriptionDesc')}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-5 text-center text-sm text-neutral-400">
                                {t('club.savingsNote')}
                            </p>
                        </div>
                    </FadeInWhenVisible>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-12 sm:mb-16">
                        {benefits.map((benefit, idx) => (
                            <FadeInWhenVisible key={idx} delay={idx * 0.1}>
                                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                                    <div
                                        className="flex-shrink-0 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full p-3 mb-4
                               group-hover:bg-[#d4af37]/20 transition-colors duration-300"
                                    >
                                        <benefit.Icon className="h-8 w-8 text-[#d4af37]" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-1">
                                        {benefit.name}
                                    </h3>
                                    {benefit.description && (
                                        <p className="text-sm text-neutral-400 leading-relaxed">
                                            {benefit.description}
                                        </p>
                                    )}
                                </div>
                            </FadeInWhenVisible>
                        ))}
                    </div>

                    <FadeInWhenVisible delay={benefits.length * 0.1}>
                        <div className="text-center">
                            {/* CHANGED: Button is now a Link component */}
                            <LocalizedLink
                                href="/contacts" // Or your dedicated subscription page e.g., /join-club
                                className="group relative inline-flex items-center justify-center px-10 py-4 sm:px-12 sm:py-5 
                           bg-[#d4af37] text-black rounded-lg text-base sm:text-lg font-bold
                           hover:bg-[#c0982c] transition-all duration-300 ease-in-out
                           focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 shadow-lg hover:shadow-xl
                           transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <span>{t('club.join')}</span>
                                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </LocalizedLink>
                            <p className="mt-4 text-xs text-neutral-500">
                                {t('club.termsNote')}
                            </p>
                        </div>
                    </FadeInWhenVisible>
                </div>
            </div>
        </section>
    );
}
