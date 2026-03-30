'use client';

import { ChatBubbleLeftRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import LocalizedLink from '@/components/LocalizedLink';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useTranslations } from '@/lib/i18n';
import { trackClientEvent } from '@/lib/analytics-events-client';

export default function NeedHelpCTA({
    source = 'website',
    className = '',
}: {
    source?: string;
    className?: string;
}) {
    const { profile } = useSiteConfig();
    const { locale } = useTranslations();
    const pathname = usePathname();

    const copy =
        locale === 'en'
            ? {
                  eyebrow: 'Need quick guidance?',
                  title: 'We will help you choose the right car and rental format.',
                  description:
                      'If you need a quick recommendation, want to confirm availability, or need a corporate quote, our manager will prepare the best option for your trip.',
                  contact: 'Contact manager',
                  whatsapp: 'WhatsApp',
                  faq: 'FAQ',
                  terms: 'Rental terms',
              }
            : locale === 'kk'
              ? {
                    eyebrow: 'Жедел көмек керек пе?',
                    title: 'Көлікті және жалдау форматын бірге таңдаймыз.',
                    description:
                        'Егер сізге жылдам іріктеу, қолжетімділікті нақтылау немесе корпоративтік ұсыныс қажет болса, менеджер сапарыңызға ыңғайлы нұсқаны дайындайды.',
                    contact: 'Менеджермен байланысу',
                    whatsapp: 'WhatsApp',
                    faq: 'FAQ',
                    terms: 'Жалдау шарттары',
                }
              : {
                    eyebrow: 'Нужна помощь с выбором?',
                    title: 'Подберем автомобиль и формат аренды под вашу поездку.',
                    description:
                        'Если нужен быстрый подбор, подтверждение доступности или корпоративный расчет, менеджер подготовит подходящий вариант под ваш запрос.',
                    contact: 'Связаться с менеджером',
                    whatsapp: 'WhatsApp',
                    faq: 'FAQ',
                    terms: 'Условия аренды',
                };

    return (
        <section
            className={`rounded-[30px] border border-white/8 bg-[linear-gradient(135deg,rgba(212,175,55,0.10),rgba(14,14,14,0.98)_35%,rgba(9,9,9,1)_100%)] px-6 py-7 shadow-[0_28px_90px_rgba(0,0,0,0.36)] sm:px-8 sm:py-8 ${className}`}
        >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0dca0]">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        {copy.eyebrow}
                    </div>
                    <h2 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl">
                        {copy.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
                        {copy.description}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                        <LocalizedLink
                            href="/#faq"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-neutral-200 transition hover:border-[#d4af37]/30 hover:text-white"
                        >
                            <QuestionMarkCircleIcon className="h-4 w-4 text-[#d4af37]" />
                            {copy.faq}
                        </LocalizedLink>
                        <LocalizedLink
                            href="/terms"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-neutral-200 transition hover:border-[#d4af37]/30 hover:text-white"
                        >
                            {copy.terms}
                        </LocalizedLink>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <LocalizedLink
                        href="/contacts"
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/30 hover:bg-white/[0.06]"
                    >
                        {copy.contact}
                    </LocalizedLink>
                    <a
                        href={profile.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#c79f2b]"
                        onClick={() => {
                            void trackClientEvent('messenger_click', {
                                messenger: 'whatsapp',
                                source,
                                pagePath: pathname,
                            });
                        }}
                    >
                        {copy.whatsapp}
                    </a>
                </div>
            </div>
        </section>
    );
}
