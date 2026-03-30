'use client';

import { useMemo, useState } from 'react';
import { ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import BookingModal from '@/components/BookingModal';
import FormattedPrice from '@/components/FormattedPrice';
import LocalizedLink from '@/components/LocalizedLink';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { trackClientEvent } from '@/lib/analytics-events-client';
import { useTranslations } from '@/lib/i18n';
import {
    calculateRentalTotal,
    formatPriceTierLabel,
    formatRentalDurationLabel,
    getMatchingPrice,
    getPriceDurationUnit,
    getRentalDays,
} from '@/lib/car-utils';
import { Car, DurationUnit, Price } from '@/types';

type ServiceType = 'withoutDriver' | 'withDriver';

function addHours(date: Date, hours: number) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function combineDateAndTime(dateValue: string, timeValue: string) {
    if (!dateValue || !timeValue) {
        return null;
    }

    const nextDate = new Date(`${dateValue}T${timeValue}:00`);
    if (Number.isNaN(nextDate.getTime())) {
        return null;
    }

    return nextDate;
}

export default function CarQuickBookingCard({ car }: { car: Car }) {
    const { locale } = useTranslations();
    const { profile } = useSiteConfig();
    const [serviceType, setServiceType] = useState<ServiceType>('withoutDriver');
    const [durationUnit, setDurationUnit] = useState<DurationUnit>('day');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [hourlyTariffId, setHourlyTariffId] = useState<number | ''>('');
    const [startTime, setStartTime] = useState('10:00');
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const copy =
        locale === 'en'
            ? {
                  title: 'Rental and request',
                  subtitle:
                      'Select the format, period, and contact channel right away.',
                  withoutDriver: 'Without driver',
                  withDriver: 'With driver',
                  byDays: 'By days',
                  byHours: '3h / 6h / 12h',
                  startDate: 'Start date',
                  endDate: 'Return date',
                  rentalDate: 'Rental date',
                  startTime: 'Start time',
                  duration: 'Tariff',
                  total: 'Total',
                  terms: 'Rental terms',
                  faq: 'FAQ',
                  whatsapp: 'WhatsApp',
                  request: 'Create request',
                  noDailyTariff:
                      'The daily offer for this format is confirmed individually.',
                  noHourlyTariff:
                      'Hourly slots are not configured for this format yet.',
              }
            : locale === 'kk'
              ? {
                    title: 'Жалдау және өтінім',
                    subtitle:
                        'Форматты, мерзімді және байланыс арнасын бірден таңдаңыз.',
                    withoutDriver: 'Жүргізушісіз',
                    withDriver: 'Жүргізушімен',
                    byDays: 'Күнмен',
                    byHours: '3с / 6с / 12с',
                    startDate: 'Басталу күні',
                    endDate: 'Қайтару күні',
                    rentalDate: 'Жалдау күні',
                    startTime: 'Басталу уақыты',
                    duration: 'Тариф',
                    total: 'Қорытынды',
                    terms: 'Жалдау шарттары',
                    faq: 'FAQ',
                    whatsapp: 'WhatsApp',
                    request: 'Өтінім рәсімдеу',
                    noDailyTariff:
                        'Бұл формат бойынша тәуліктік тариф жеке нақтыланады.',
                    noHourlyTariff:
                        'Бұл формат үшін сағаттық слоттар әлі бапталмаған.',
                }
              : {
                    title: 'Тариф и заявка',
                    subtitle:
                        'Сразу выберите формат, период и удобный способ связи.',
                    withoutDriver: 'Без водителя',
                    withDriver: 'С водителем',
                    byDays: 'По дням',
                    byHours: '3ч / 6ч / 12ч',
                    startDate: 'Дата начала',
                    endDate: 'Дата возврата',
                    rentalDate: 'Дата аренды',
                    startTime: 'Время начала',
                    duration: 'Тариф',
                    total: 'Итого',
                    terms: 'Условия аренды',
                    faq: 'FAQ',
                    whatsapp: 'WhatsApp',
                    request: 'Оформить заявку',
                    noDailyTariff:
                        'Для этого формата суточный тариф уточняется индивидуально.',
                    noHourlyTariff:
                        'Для этого формата почасовые слоты пока не настроены.',
                };

    const matchingPrices = useMemo(
        () =>
            (car.prices || []).filter(
                (price) => price.with_driver === (serviceType === 'withDriver'),
            ),
        [car.prices, serviceType],
    );

    const dailyPrices = useMemo(
        () =>
            matchingPrices.filter((price) => getPriceDurationUnit(price) === 'day'),
        [matchingPrices],
    );

    const hourlyPrices = useMemo(
        () =>
            matchingPrices
                .filter((price) => getPriceDurationUnit(price) === 'hour')
                .sort((left, right) => left.days_from - right.days_from),
        [matchingPrices],
    );

    const rentalDays = useMemo(() => getRentalDays(startDate, endDate), [startDate, endDate]);

    const selectedHourlyTariff = useMemo(
        () =>
            hourlyPrices.find((price) => price.id === hourlyTariffId) ??
            hourlyPrices[0] ??
            null,
        [hourlyPrices, hourlyTariffId],
    );

    const selectedPrice: Price | null = useMemo(() => {
        if (durationUnit === 'hour') {
            return selectedHourlyTariff;
        }

        if (!rentalDays) {
            return null;
        }

        const matched = getMatchingPrice(
            car.prices || [],
            rentalDays,
            serviceType === 'withDriver',
            'day',
        );

        if (matched) {
            return matched;
        }

        if (serviceType === 'withoutDriver') {
            const fallback = car.price_per_day || car.price || 0;

            if (fallback > 0) {
                return {
                    id: 0,
                    car_id: car.id,
                    days_from: rentalDays,
                    days_to: rentalDays,
                    price_per_day: fallback,
                    with_driver: false,
                    duration_unit: 'day',
                } as Price;
            }
        }

        return null;
    }, [
        car.id,
        car.price,
        car.price_per_day,
        car.prices,
        durationUnit,
        rentalDays,
        selectedHourlyTariff,
        serviceType,
    ]);

    const selectedDurationValue =
        durationUnit === 'hour'
            ? selectedPrice?.days_from ?? 0
            : rentalDays;
    const totalPrice = calculateRentalTotal(selectedPrice, selectedDurationValue);

    const bookingWindow = useMemo(() => {
        if (durationUnit !== 'hour') {
            return {
                startsAt: null as string | null,
                endsAt: null as string | null,
            };
        }

        const startsAtDate = combineDateAndTime(startDate, startTime);
        if (!startsAtDate || !selectedDurationValue) {
            return { startsAt: null, endsAt: null };
        }

        const endsAtDate = addHours(startsAtDate, selectedDurationValue);
        return {
            startsAt: startsAtDate.toISOString(),
            endsAt: endsAtDate.toISOString(),
        };
    }, [durationUnit, selectedDurationValue, startDate, startTime]);

    const bookingDetails =
        selectedPrice && selectedDurationValue && startDate
            ? {
                  serviceType:
                      serviceType === 'withDriver'
                          ? copy.withDriver
                          : copy.withoutDriver,
                  duration: formatRentalDurationLabel(
                      selectedDurationValue,
                      durationUnit,
                      locale,
                  ),
                  price: totalPrice,
                  carId: car.id,
                  tariffId: selectedPrice.id,
                  startDate,
                  endDate:
                      durationUnit === 'hour'
                          ? startDate
                          : endDate || startDate,
                  dateFrom: startDate,
                  dateTo:
                      durationUnit === 'hour'
                          ? startDate
                          : endDate || startDate,
                  startsAt: bookingWindow.startsAt ?? undefined,
                  endsAt: bookingWindow.endsAt ?? undefined,
                  durationUnit,
                  durationValue: selectedDurationValue,
                  conditions: selectedPrice.conditions,
              }
            : undefined;

    const warningText =
        durationUnit === 'hour'
            ? hourlyPrices.length === 0
                ? copy.noHourlyTariff
                : null
            : startDate && endDate && !selectedPrice
              ? copy.noDailyTariff
              : null;

    return (
        <>
            <div className="rounded-[26px] border border-white/8 bg-black/25 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0dca0]">
                            {copy.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-neutral-400">
                            {copy.subtitle}
                        </p>
                    </div>
                    <ClockIcon className="h-6 w-6 text-[#d4af37]" />
                </div>

                <div className="mt-5 grid gap-3">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.04] p-1">
                        <button
                            type="button"
                            onClick={() => setServiceType('withoutDriver')}
                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                serviceType === 'withoutDriver'
                                    ? 'bg-[#d4af37] text-black'
                                    : 'text-neutral-300'
                            }`}
                        >
                            {copy.withoutDriver}
                        </button>
                        <button
                            type="button"
                            onClick={() => setServiceType('withDriver')}
                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                serviceType === 'withDriver'
                                    ? 'bg-[#d4af37] text-black'
                                    : 'text-neutral-300'
                            }`}
                        >
                            {copy.withDriver}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.04] p-1">
                        <button
                            type="button"
                            onClick={() => setDurationUnit('day')}
                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                durationUnit === 'day'
                                    ? 'bg-white text-black'
                                    : 'text-neutral-300'
                            }`}
                        >
                            {copy.byDays}
                        </button>
                        <button
                            type="button"
                            onClick={() => setDurationUnit('hour')}
                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                durationUnit === 'hour'
                                    ? 'bg-white text-black'
                                    : 'text-neutral-300'
                            }`}
                        >
                            {copy.byHours}
                        </button>
                    </div>

                    {durationUnit === 'day' ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-2 text-sm">
                                <span className="text-neutral-400">{copy.startDate}</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                                />
                            </label>
                            <label className="space-y-2 text-sm">
                                <span className="text-neutral-400">{copy.endDate}</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(event) => setEndDate(event.target.value)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-3">
                            <label className="space-y-2 text-sm sm:col-span-1">
                                <span className="text-neutral-400">{copy.rentalDate}</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                                />
                            </label>
                            <label className="space-y-2 text-sm sm:col-span-1">
                                <span className="text-neutral-400">{copy.startTime}</span>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(event) => setStartTime(event.target.value)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                                />
                            </label>
                            <label className="space-y-2 text-sm sm:col-span-1">
                                <span className="text-neutral-400">{copy.duration}</span>
                                <select
                                    value={String(hourlyTariffId || selectedHourlyTariff?.id || '')}
                                    onChange={(event) =>
                                        setHourlyTariffId(
                                            event.target.value ? Number(event.target.value) : '',
                                        )
                                    }
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
                                >
                                    {hourlyPrices.map((price) => (
                                        <option key={price.id} value={price.id}>
                                            {formatPriceTierLabel(price, locale)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}
                </div>

                {warningText ? (
                    <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {warningText}
                    </div>
                ) : selectedPrice ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                {copy.duration}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white">
                                {formatPriceTierLabel(selectedPrice, locale)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                                {copy.total}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-[#f0dca0]">
                                <FormattedPrice value={totalPrice} /> ₸
                            </p>
                        </div>
                    </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <LocalizedLink
                        href="/terms"
                        className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-[#d4af37]/30 hover:text-white"
                    >
                        {copy.terms}
                    </LocalizedLink>
                    <LocalizedLink
                        href="/#faq"
                        className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-[#d4af37]/30 hover:text-white"
                    >
                        {copy.faq}
                    </LocalizedLink>
                    <a
                        href={profile.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-2 text-sm font-medium text-[#f0dca0] transition hover:bg-[#d4af37]/16"
                        onClick={() => {
                            void trackClientEvent('messenger_click', {
                                messenger: 'whatsapp',
                                source: 'car-detail-card',
                                carId: car.id,
                            });
                        }}
                    >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        {copy.whatsapp}
                    </a>
                    <button
                        type="button"
                        onClick={() => setIsBookingOpen(true)}
                        disabled={!bookingDetails}
                        className="ml-auto inline-flex items-center justify-center rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#c79f2b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {copy.request}
                    </button>
                </div>
            </div>

            <BookingModal
                carName={car.name}
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                bookingDetails={bookingDetails}
            />
        </>
    );
}
