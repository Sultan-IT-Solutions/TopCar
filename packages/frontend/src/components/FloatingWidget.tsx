'use client';

import { type ComponentType, useMemo, useState } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { trackClientEvent } from '@/lib/analytics-events-client';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useTranslations } from '@/lib/i18n';

const TelegramIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
    >
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.4.2-1.75l15.5-5.25c.83-.28 1.5.2 1.28 1.28l-5.25 15.5c-.35.83-1.4.88-1.75.2L9.78 18.65z" />
    </svg>
);

const ViberIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
    <span className={`${className} inline-flex items-center justify-center text-xs font-bold`}>
        V
    </span>
);

const MaxIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
    <span className={`${className} inline-flex items-center justify-center text-[10px] font-bold uppercase`}>
        Max
    </span>
);

export default function FloatingWidget() {
    const { profile } = useSiteConfig();
    const { locale } = useTranslations();
    const [isExpanded, setIsExpanded] = useState(false);
    const moreLabel =
        locale === 'en'
            ? 'More messengers'
            : locale === 'kk'
              ? 'Қосымша мессенджерлер'
              : 'Другие мессенджеры';

    const secondaryLinks = useMemo(
        () =>
            [
                profile.telegramUrl
                    ? {
                          key: 'telegram',
                          href: profile.telegramUrl,
                          label: 'Telegram',
                          bg: 'bg-[#229ED9]',
                          Icon: TelegramIcon,
                      }
                    : null,
                profile.viberUrl
                    ? {
                          key: 'viber',
                          href: profile.viberUrl,
                          label: 'Viber',
                          bg: 'bg-[#7360F2]',
                          Icon: ViberIcon,
                      }
                    : null,
                profile.maxUrl
                    ? {
                          key: 'max',
                          href: profile.maxUrl,
                          label: 'Max',
                          bg: 'bg-[#111827]',
                          Icon: MaxIcon,
                      }
                    : null,
            ].filter(Boolean),
        [profile.maxUrl, profile.telegramUrl, profile.viberUrl],
    ) as Array<{
        key: string;
        href: string;
        label: string;
        bg: string;
        Icon: ComponentType<{ className?: string }>;
    }>;

    return (
        <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            {secondaryLinks.length > 0 && (
                <button
                    type="button"
                    onClick={() => setIsExpanded((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs font-medium text-neutral-200 shadow-[0_14px_36px_rgba(0,0,0,0.42)] backdrop-blur transition hover:border-[#d4af37]/40 hover:text-white"
                    aria-expanded={isExpanded}
                    aria-label={moreLabel}
                    title={moreLabel}
                >
                    <ChevronUpIcon
                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                    <span className="hidden sm:inline">{moreLabel}</span>
                </button>
            )}

            {isExpanded && secondaryLinks.length > 0 && (
                <div className="flex flex-col items-end gap-2">
                    {secondaryLinks.map((item) => (
                        <a
                            key={item.key}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex h-12 items-center gap-3 rounded-full px-4 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(0,0,0,0.42)] transition hover:-translate-y-0.5 ${item.bg}`}
                            title={item.label}
                            aria-label={item.label}
                            onClick={() => {
                                void trackClientEvent('messenger_click', {
                                    messenger: item.key,
                                    source: 'floating-widget',
                                });
                            }}
                        >
                            <item.Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>
            )}

            <a
                href={profile.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="waplus-bounce flex h-14 w-14 items-center justify-center rounded-full bg-[#16BE45] text-white shadow-[0_18px_45px_rgba(22,190,69,0.35)] transition-all hover:scale-105 hover:bg-[#12a63c] focus:outline-none focus:ring-4 focus:ring-[#16BE45]/40 sm:h-16 sm:w-16"
                aria-label="Написать в WhatsApp"
                title="WhatsApp"
                onClick={() => {
                    void trackClientEvent('messenger_click', {
                        messenger: 'whatsapp',
                        source: 'floating-widget',
                    });
                }}
            >
                <svg
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    aria-hidden="true"
                >
                    <path d="M19.11 17.29c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.62.14-.18.27-.71.88-.87 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.33-.81-.72-1.36-1.6-1.52-1.87-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.46-.62-.47h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29 0 1.35.98 2.65 1.12 2.83.14.18 1.93 2.95 4.68 4.13.65.28 1.16.44 1.56.56.66.21 1.27.18 1.75.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32Z" />
                    <path d="M16.01 3.2C8.93 3.2 3.2 8.88 3.2 15.9c0 2.23.59 4.41 1.72 6.33L3 29l6.95-1.81a12.82 12.82 0 0 0 6.06 1.54H16c7.07 0 12.8-5.69 12.8-12.71 0-7.02-5.73-12.82-12.79-12.82Zm0 23.35h-.01a10.66 10.66 0 0 1-5.43-1.48l-.39-.23-4.12 1.07 1.1-4-.25-.41a10.51 10.51 0 0 1-1.63-5.6c0-5.84 4.8-10.59 10.72-10.59 2.84 0 5.5 1.09 7.52 3.08a10.45 10.45 0 0 1 3.15 7.5c0 5.84-4.81 10.66-10.66 10.66Z" />
                </svg>
            </a>
        </div>
    );
}
