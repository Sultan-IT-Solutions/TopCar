// src/components/Footer.tsx
'use client';

import Image from 'next/image';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
} from '@heroicons/react/20/solid';
import { useTranslations } from '@/lib/i18n';
import { trackClientEvent } from '@/lib/analytics-events-client';
import LocalizedLink from '@/components/LocalizedLink';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { getLocalizedText } from '@/lib/site-config';

// --- НОВЫЕ SVG-ИКОНКИ ---

// Иконка для Instagram
const InstagramIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

// Иконка для Telegram
const TelegramIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.4.2-1.75l15.5-5.25c.83-.28 1.5.2 1.28 1.28l-5.25 15.5c-.35.83-1.4.88-1.75.2L9.78 18.65z"></path>
    </svg>
);

// Иконка для WhatsApp
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.2-.5.1-.3-.1-.9-.3-1.8-.9-.6-.5-1.1-1-1.2-1.2-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.3.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2 1 2.3.1.1 1.5 2.3 3.6 3.2.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.5.2-1 0-1.1-.1-.1-.3-.2-.5-.2zM12 2a10 10 0 100 20 10 10 0 000-20z"></path>
    </svg>
);

export default function Footer() {
    const { t, locale } = useTranslations();
    const { profile } = useSiteConfig();
    const currentYear = new Date().getFullYear();
    const localizedAddress = getLocalizedText(profile.address, locale);
    const localizedSupportHours = getLocalizedText(profile.supportHours, locale);
    const content =
        locale === 'en'
            ? {
                  pwaLabel: 'TopCar app',
                  pwaTitle: 'Install the app for quick access',
                  pwaDescription:
                      'Save TopCar to your home screen to open the fleet, calculator, contacts and personal offers in one tap.',
                  pwaButton: 'Open installation page',
                  pwaHint: 'Scan the QR code or open the installation page on your phone.',
                  qrPlaceholder: 'A quick-install QR code will appear in this block.',
              }
            : locale === 'kk'
              ? {
                    pwaLabel: 'TopCar қолданбасы',
                    pwaTitle: 'Жылдам қолжетімділік үшін қолданбаны орнатыңыз',
                    pwaDescription:
                        'Автопарк, калькулятор, байланыс және жеке ұсыныстарға бірден өту үшін TopCar-ды басты экранға қосыңыз.',
                    pwaButton: 'Орнату бетіне өту',
                    pwaHint: 'QR-кодты сканерлеңіз немесе орнату бетін телефоннан ашыңыз.',
                    qrPlaceholder:
                        'Қолданбаны жылдам орнатуға арналған QR-код осы блокта көрсетіледі.',
                }
              : {
                    pwaLabel: 'Приложение TopCar',
                    pwaTitle: 'Установите приложение для быстрого доступа',
                    pwaDescription:
                        'Добавьте TopCar на главный экран, чтобы в один тап открывать автопарк, калькулятор, контакты и персональные предложения.',
                    pwaButton: 'Открыть страницу установки',
                    pwaHint:
                        'Отсканируйте QR-код или откройте страницу установки на телефоне.',
                    qrPlaceholder:
                        'QR-код для быстрой установки приложения появится в этом блоке.',
                };

    // --- ОБНОВЛЕННЫЙ МАССИВ ССЫЛОК ---
    const socialLinks: {
        name: string;
        href: string;
        Icon: React.FC<{ className?: string }>;
    }[] = [
        profile.instagramUrl
            ? {
                  name: 'Instagram',
                  href: profile.instagramUrl,
                  Icon: InstagramIcon,
              }
            : null,
        profile.telegramUrl
            ? {
                  name: 'Telegram',
                  href: profile.telegramUrl,
                  Icon: TelegramIcon,
              }
            : null,
        profile.whatsappUrl
            ? {
                  name: 'WhatsApp',
                  href: profile.whatsappUrl,
                  Icon: WhatsAppIcon,
              }
            : null,
    ].filter(Boolean) as {
        name: string;
        href: string;
        Icon: React.FC<{ className?: string }>;
    }[];

    if (profile.viberUrl) {
        socialLinks.push({
            name: 'Viber',
            href: profile.viberUrl,
            Icon: ({ className }) => (
                <span
                    className={`${className} inline-flex items-center justify-center text-xs font-bold`}
                >
                    V
                </span>
            ),
        });
    }

    if (profile.maxUrl) {
        socialLinks.push({
            name: 'Max',
            href: profile.maxUrl,
            Icon: ({ className }) => (
                <span
                    className={`${className} inline-flex items-center justify-center text-[10px] font-bold uppercase`}
                >
                    Max
                </span>
            ),
        });
    }

    return (
        <footer className="bg-neutral-950 text-white border-t border-neutral-800">
            <div className="border-b border-neutral-800 bg-gradient-to-r from-[#d4af37]/10 via-neutral-950 to-neutral-950">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-[1fr_auto] sm:px-6 lg:px-8">
                    <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-[#d4af37]/30 bg-black/20 p-3">
                            <Image
                                src="/logo.png"
                                alt="TopCar App"
                                width={44}
                                height={44}
                                className="rounded-md"
                            />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0dca0]">
                                {content.pwaLabel}
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-white">
                                {content.pwaTitle}
                            </h3>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-300">
                                {content.pwaDescription}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <LocalizedLink
                                    href={profile.pwaDownloadUrl || '/download'}
                                    className="inline-flex items-center justify-center rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#c0982c]"
                                >
                                    {content.pwaButton}
                                </LocalizedLink>
                                <span className="text-xs text-neutral-500">
                                    {content.pwaHint}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-end">
                        <div className="rounded-3xl border border-white/8 bg-black/20 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
                            {profile.pwaQrImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profile.pwaQrImageUrl}
                                    alt="QR код приложения TopCar"
                                    className="h-32 w-32 rounded-2xl object-cover"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-900 text-center text-xs text-neutral-500">
                                    {content.qrPlaceholder}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 xl:gap-12">
                    <div className="md:col-span-4 xl:col-span-5">
                        <div className="flex items-center gap-3 mb-5">
                            <Image
                                src="/logo.png"
                                alt="TopCar Logo"
                                width={40}
                                height={40}
                                className="rounded-sm"
                            />
                            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f0dca0]">
                                TOPCAR
                            </span>
                        </div>
                        <p className="text-neutral-400 leading-relaxed text-sm sm:text-base max-w-md mb-6">
                            {t('footer.description')}
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-500 hover:text-[#d4af37] group transition-colors duration-200"
                                    aria-label={item.name}
                                >
                                    <item.Icon className="w-6 h-6" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2 xl:col-span-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-5 sm:mb-6">
                            {t('footer.quickLinks')}
                        </h4>
                        <ul className="space-y-3 text-sm sm:text-base">
                            <li>
                                <LocalizedLink
                                    href="/autopark"
                                    className="text-neutral-300 hover:text-[#d4af37] transition-colors"
                                >
                                    {t('nav.autopark')}
                                </LocalizedLink>
                            </li>
                            <li>
                                <LocalizedLink
                                    href="/services"
                                    className="text-neutral-300 hover:text-[#d4af37] transition-colors"
                                >
                                    {t('nav.services')}
                                </LocalizedLink>
                            </li>
                            <li>
                                <LocalizedLink
                                    href="/#faq"
                                    className="text-neutral-300 hover:text-[#d4af37] transition-colors"
                                >
                                    FAQ
                                </LocalizedLink>
                            </li>
                            <li>
                                <LocalizedLink
                                    href="/contacts"
                                    className="text-neutral-300 hover:text-[#d4af37] transition-colors"
                                >
                                    {t('nav.contacts')}
                                </LocalizedLink>
                            </li>
                            <li>
                                <LocalizedLink
                                    href="/terms"
                                    className="text-neutral-300 hover:text-[#d4af37] transition-colors"
                                >
                                    {t('nav.terms')}
                                </LocalizedLink>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-3 xl:col-span-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-5 sm:mb-6">
                            {t('footer.contacts')}
                        </h4>
                        <ul className="space-y-3 text-sm sm:text-base text-neutral-300">
                            <li className="flex items-start">
                                <MapPinIcon className="h-5 w-5 text-[#d4af37] mr-2.5 mt-0.5 flex-shrink-0" />
                                <span>{localizedAddress}</span>
                            </li>
                            <li className="flex items-start">
                                <PhoneIcon className="h-5 w-5 text-[#d4af37] mr-2.5 mt-0.5 flex-shrink-0" />
                                <a
                                    href={`tel:${profile.phoneRaw}`}
                                    className="hover:text-[#d4af37] transition-colors"
                                    onClick={() => {
                                        void trackClientEvent('phone_click', {
                                            source: 'footer',
                                            label: profile.phoneRaw,
                                        });
                                    }}
                                >
                                    {profile.phoneDisplay}
                                </a>
                            </li>
                            <li className="flex items-start">
                                <EnvelopeIcon className="h-5 w-5 text-[#d4af37] mr-2.5 mt-0.5 flex-shrink-0" />
                                <a
                                    href={`mailto:${profile.email}`}
                                    className="hover:text-[#d4af37] transition-colors"
                                    onClick={() => {
                                        void trackClientEvent('messenger_click', {
                                            messenger: 'email',
                                            source: 'footer',
                                            label: profile.email,
                                        });
                                    }}
                                >
                                    {profile.email}
                                </a>
                            </li>
                            <li className="text-xs text-neutral-500 mt-2">
                                {localizedSupportHours}
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-3 xl:col-span-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-5 sm:mb-6">
                            {t('contacts.getInTouch')}
                        </h4>
                        <ul className="space-y-3 text-sm sm:text-base">
                            <li>
                                <a
                                    href={profile.whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-300 hover:text-[#d4af37] transition-colors flex items-center group"
                                    onClick={() => {
                                        void trackClientEvent('messenger_click', {
                                            messenger: 'whatsapp',
                                            source: 'footer',
                                        });
                                    }}
                                >
                                    <WhatsAppIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
                                    WhatsApp
                                </a>
                            </li>
                            <li>
                                <a
                                    href={profile.telegramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-300 hover:text-[#d4af37] transition-colors flex items-center group"
                                    onClick={() => {
                                        void trackClientEvent('messenger_click', {
                                            messenger: 'telegram',
                                            source: 'footer',
                                        });
                                    }}
                                >
                                    <TelegramIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
                                    Telegram
                                </a>
                            </li>
                            {profile.viberUrl && (
                                <li>
                                    <a
                                        href={profile.viberUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-300 hover:text-[#d4af37] transition-colors flex items-center group"
                                        onClick={() => {
                                            void trackClientEvent('messenger_click', {
                                                messenger: 'viber',
                                                source: 'footer',
                                            });
                                        }}
                                    >
                                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-xs font-bold text-[#d4af37]">
                                            V
                                        </span>
                                        Viber
                                    </a>
                                </li>
                            )}
                            {profile.maxUrl && (
                                <li>
                                    <a
                                        href={profile.maxUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-300 hover:text-[#d4af37] transition-colors flex items-center group"
                                        onClick={() => {
                                            void trackClientEvent('messenger_click', {
                                                messenger: 'max',
                                                source: 'footer',
                                            });
                                        }}
                                    >
                                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[10px] font-bold uppercase text-[#d4af37]">
                                            Max
                                        </span>
                                        Max
                                    </a>
                                </li>
                            )}
                            <li>
                                <a
                                    href={`mailto:${profile.email}`}
                                    className="text-neutral-300 hover:text-[#d4af37] transition-colors flex items-center"
                                    onClick={() => {
                                        void trackClientEvent('messenger_click', {
                                            messenger: 'email',
                                            source: 'footer',
                                            label: profile.email,
                                        });
                                    }}
                                >
                                    <EnvelopeIcon className="h-5 w-5 text-[#d4af37] mr-2" />
                                    {t('contacts.email')}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 sm:mt-20 pt-8 border-t border-neutral-800 text-center sm:flex sm:justify-between">
                    <p className="text-xs text-neutral-500 mb-3 sm:mb-0">
                        © {currentYear} TopCar Club. {t('footer.rights')}
                    </p>
                    <div className="flex justify-center space-x-4">
                        <LocalizedLink
                            href="/privacy-policy"
                            className="text-xs text-neutral-500 hover:text-[#d4af37] transition-colors"
                        >
                            {t('footer.privacy')}
                        </LocalizedLink>
                        <LocalizedLink
                            href="/terms"
                            className="text-xs text-neutral-500 hover:text-[#d4af37] transition-colors"
                        >
                            {t('footer.terms')}
                        </LocalizedLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}
