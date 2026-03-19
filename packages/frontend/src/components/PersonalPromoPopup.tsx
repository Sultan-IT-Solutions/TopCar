'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, Copy, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/lib/i18n';
import LocalizedLink from '@/components/LocalizedLink';

type PromoCodeItem = {
    id: number;
    is_used: boolean;
    code: string;
    discount_type: string;
    discount_value: number;
    description?: string;
    expiry_date?: string;
};

const STORAGE_KEY = 'topcar-personal-promo-dismissed';

function formatDiscount(code: PromoCodeItem) {
    if (code.discount_type === 'percent') {
        return `${code.discount_value}%`;
    }

    return `${code.discount_value.toLocaleString('ru-RU')} ₸`;
}

export default function PersonalPromoPopup() {
    const { user } = useAuth();
    const { t } = useTranslations();
    const [promoCode, setPromoCode] = useState<PromoCodeItem | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!user) return;

        let isMounted = true;

        const fetchPromoCodes = async () => {
            try {
                const response = await fetch('/api/user/promocodes');
                const data = await response.json();

                if (!response.ok || !Array.isArray(data)) {
                    return;
                }

                const firstAvailablePromo = data
                    .filter((item: PromoCodeItem) => !item.is_used && item.code)
                    .sort((a: PromoCodeItem, b: PromoCodeItem) => {
                        const aDate = a.expiry_date
                            ? new Date(a.expiry_date).getTime()
                            : Number.MAX_SAFE_INTEGER;
                        const bDate = b.expiry_date
                            ? new Date(b.expiry_date).getTime()
                            : Number.MAX_SAFE_INTEGER;

                        return aDate - bDate;
                    })[0];

                if (isMounted && firstAvailablePromo) {
                    setPromoCode(firstAvailablePromo);
                }
            } catch (error) {
                console.error('Promo popup load failed:', error);
            }
        };

        fetchPromoCodes();

        return () => {
            isMounted = false;
        };
    }, [user]);

    const dismissKey = useMemo(() => {
        if (!user || !promoCode) return '';
        return `${STORAGE_KEY}:${user.id}:${promoCode.code}`;
    }, [promoCode, user]);

    useEffect(() => {
        if (!promoCode || !dismissKey) return;

        const alreadyDismissed = localStorage.getItem(dismissKey);
        if (alreadyDismissed) {
            return;
        }

        let timeoutId: number | undefined;

        const showPopup = () => setIsVisible(true);
        const handleScroll = () => {
            if (window.scrollY > 320) {
                showPopup();
                window.removeEventListener('scroll', handleScroll);
                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                }
            }
        };

        timeoutId = window.setTimeout(showPopup, 14000);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [dismissKey, promoCode]);

    if (!user || !promoCode) return null;

    const handleDismiss = () => {
        if (dismissKey) {
            localStorage.setItem(dismissKey, '1');
        }
        setIsVisible(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(promoCode.code);
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 1800);
        } catch (error) {
            console.error('Promo code copy failed:', error);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.aside
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="fixed bottom-4 right-4 z-[70] w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-[#d4af37]/30 bg-neutral-950/95 shadow-2xl backdrop-blur-xl"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.18),_transparent_50%)]" />
                    <div className="relative p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-[#f0dca0]">
                                    <Gift className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0dca0]">
                                        {t('promoPopup.badge')}
                                    </p>
                                    <h3 className="mt-1 text-lg font-bold text-white">
                                        {t('promoPopup.title')}
                                    </h3>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleDismiss}
                                className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-white/5 hover:text-white"
                                aria-label={t('promoPopup.dismiss')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-neutral-300">
                            {promoCode.description ||
                                t('promoPopup.description')}
                        </p>

                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                                {t('promoPopup.codeLabel')}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-2xl font-bold tracking-[0.18em] text-white">
                                    {promoCode.code}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white"
                                >
                                    {isCopied ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    {isCopied
                                        ? t('promoPopup.copied')
                                        : t('promoPopup.copy')}
                                </button>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                                <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 font-semibold text-[#f0dca0]">
                                    {formatDiscount(promoCode)}
                                </span>
                                <span className="text-neutral-500">
                                    {promoCode.expiry_date
                                        ? `${t('promoPopup.expires')} ${new Date(promoCode.expiry_date).toLocaleDateString('ru-RU')}`
                                        : t('promoPopup.noExpiry')}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#c0982c]"
                            >
                                <Copy className="h-4 w-4" />
                                {t('promoPopup.primaryAction')}
                            </button>
                            <LocalizedLink
                                href="/dashboard"
                                onClick={handleDismiss}
                                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-neutral-500 hover:bg-white/5"
                            >
                                {t('promoPopup.secondaryAction')}
                            </LocalizedLink>
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
