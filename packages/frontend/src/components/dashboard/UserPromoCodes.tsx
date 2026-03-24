'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import {
    TagIcon,
    CheckCircle,
    Loader2,
    Copy,
    TicketPercent,
} from 'lucide-react';

type PromoCodeItem = {
    id: number;
    is_used: boolean;
    code: string;
    discount_type: string;
    discount_value: number;
    description?: string;
    expiry_date?: string;
};

function formatDiscount(code: PromoCodeItem) {
    if (code.discount_type === 'percent') {
        return `${code.discount_value}%`;
    }
    return `${code.discount_value.toLocaleString('ru-RU')} ₸`;
}

export default function UserPromoCodes() {
    const { locale } = useTranslations();
    const { session, isLoading: isLoadingAuth } = useAuth();
    const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedCode, setCopiedCode] = useState('');

    const content =
        locale === 'en'
            ? {
                  loadError: 'Could not load promo codes.',
                  title: 'Promo codes',
                  personal: 'Personal code',
                  used: 'Used',
                  active: 'Active',
                  copied: 'Copied',
                  copy: 'Copy',
                  defaultDescription: 'A personal offer for your next booking.',
                  discount: 'Discount',
                  validUntil: 'Valid until',
                  noExpiry: 'Expiry date to be confirmed',
                  empty: 'No personal promo codes yet.',
                  emptyHint:
                      'As soon as an offer is assigned to your account, it will appear here.',
                  copiedToast: 'Promo code copied:',
              }
            : locale === 'kk'
              ? {
                    loadError: 'Промокодтарды жүктеу мүмкін болмады.',
                    title: 'Промокодтар',
                    personal: 'Жеке код',
                    used: 'Қолданылған',
                    active: 'Белсенді',
                    copied: 'Көшірілді',
                    copy: 'Көшіру',
                    defaultDescription:
                        'Келесі брондауға арналған жеке ұсыныс.',
                    discount: 'Жеңілдік',
                    validUntil: 'Жарамды мерзімі',
                    noExpiry: 'Жарамдылық мерзімі нақтыланады',
                    empty: 'Жеке промокодтар әзірге жоқ.',
                    emptyHint:
                        'Ұсыныс аккаунтыңызға бекітілген бойда, ол осы жерде көрінеді.',
                    copiedToast: 'Промокод көшірілді:',
                }
              : {
                    loadError: 'Не удалось загрузить промокоды.',
                    title: 'Промокоды',
                    personal: 'Персональный код',
                    used: 'Использован',
                    active: 'Активен',
                    copied: 'Скопировано',
                    copy: 'Копировать',
                    defaultDescription:
                        'Индивидуальное предложение для вашего следующего бронирования.',
                    discount: 'Скидка',
                    validUntil: 'Действует до',
                    noExpiry: 'Срок действия уточняется',
                    empty: 'Персональных промокодов пока нет.',
                    emptyHint:
                        'Как только для вашего аккаунта появится предложение, оно сразу отобразится здесь.',
                    copiedToast: 'Промокод скопирован:',
                };

    useEffect(() => {
        if (isLoadingAuth) {
            return;
        }

        const fetchPromoCodes = async () => {
            if (!session?.access_token) {
                setPromoCodes([]);
                setError(content.loadError);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/user/promocodes', {
                    credentials: 'same-origin',
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || content.loadError);
                }

                setPromoCodes(data || []);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : content.loadError,
                );
            } finally {
                setLoading(false);
            }
        };

        void fetchPromoCodes();
    }, [content.loadError, isLoadingAuth, session?.access_token]);

    const handleCopy = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            window.setTimeout(() => setCopiedCode(''), 2000);
        } catch (err) {
            console.error('Clipboard copy failed:', err);
        }
    };

    return (
        <section>
            <div className="mb-6 flex items-center">
                <TagIcon className="mr-3 h-8 w-8 shrink-0 text-[#d4af37]" />
                <h2 className="text-2xl font-bold text-white">
                    {content.title}
                </h2>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-[#d4af37]" />
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                ) : promoCodes.length > 0 ? (
                    <div className="space-y-4">
                        {promoCodes.map((promoCode) => (
                            <div
                                key={promoCode.id}
                                className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f0dca0]">
                                                {content.personal}
                                            </span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    promoCode.is_used
                                                        ? 'bg-neutral-800 text-neutral-400'
                                                        : 'bg-emerald-500/10 text-emerald-300'
                                                }`}
                                            >
                                                {promoCode.is_used
                                                    ? content.used
                                                    : content.active}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center gap-3">
                                            <p className="text-2xl font-bold tracking-[0.18em] text-white">
                                                {promoCode.code}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(promoCode.code)
                                                }
                                                className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white"
                                            >
                                                <Copy className="h-4 w-4" />
                                                {copiedCode === promoCode.code
                                                    ? content.copied
                                                    : content.copy}
                                            </button>
                                        </div>

                                        <p className="mt-3 text-sm text-neutral-400">
                                            {promoCode.description ||
                                                content.defaultDescription}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 sm:min-w-[180px]">
                                        <div className="flex items-center gap-2 text-neutral-400">
                                            <TicketPercent className="h-5 w-5 text-[#d4af37]" />
                                            <span className="text-xs uppercase tracking-[0.16em]">
                                                {content.discount}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-2xl font-bold text-[#d4af37]">
                                            {formatDiscount(promoCode)}
                                        </p>
                                        <p className="mt-2 text-xs text-neutral-500">
                                            {promoCode.expiry_date
                                                ? `${content.validUntil} ${new Date(promoCode.expiry_date).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'kk' ? 'kk-KZ' : 'ru-RU')}`
                                                : content.noExpiry}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-neutral-700 px-6 py-10 text-center">
                        <p className="text-neutral-300">{content.empty}</p>
                        <p className="mt-2 text-sm text-neutral-500">
                            {content.emptyHint}
                        </p>
                    </div>
                )}

                {copiedCode && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-300">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                            {content.copiedToast} {copiedCode}
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
}
