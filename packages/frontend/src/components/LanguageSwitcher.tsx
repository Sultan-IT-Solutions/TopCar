'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { languages } from '@/lib/i18n';
import {
    getLocaleFromPath,
    localizeHref,
    stripLocalePrefix,
} from '@/lib/locale-routing';

// Добавляем тип пропсов
interface LanguageSwitcherProps {
    className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const locale = getLocaleFromPath(pathname);
    const currentLanguage =
        languages.find((lang) => lang.code === locale) || languages[0];

    const getLocalizedPath = (newLocale: 'ru' | 'en' | 'kk') => {
        return localizeHref(stripLocalePrefix(pathname), newLocale);
    };

    return (
        <div className={className ? `relative ${className}` : 'relative'}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-neutral-700/70 bg-neutral-900/80 text-neutral-200 shadow-lg transition-all duration-200 hover:border-[#d4af37]/50 hover:text-white hover:shadow-xl"
                aria-label="Change language"
            >
                <LanguageIcon className="h-5 w-5" />
                <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-neutral-800 bg-[#d4af37] px-1 text-[10px] font-bold uppercase tracking-wide text-black">
                    {locale}
                </span>
                <ChevronDownIcon
                    className={`absolute -top-1 -right-1 h-4 w-4 rounded-full bg-neutral-950 p-0.5 text-neutral-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl z-50">
                        {languages.map((language) => (
                            <Link
                                key={language.code}
                                href={getLocalizedPath(
                                    language.code as 'ru' | 'en' | 'kk',
                                )}
                                onClick={() => setIsOpen(false)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                                    locale === language.code
                                        ? 'bg-neutral-800 text-[#d4af37]'
                                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                }`}
                            >
                                <span className="text-lg">{language.flag}</span>
                                <span className="font-medium">
                                    {language.name}
                                </span>
                                {locale === language.code && (
                                    <div className="ml-auto w-2 h-2 bg-[#d4af37] rounded-full" />
                                )}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
