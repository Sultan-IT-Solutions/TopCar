import type { Locale } from '@/lib/i18n';
import { Car, Price } from '@/types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function normalizeTierBoundary(value: number): number {
    if (value >= 24 && value % 24 === 0) {
        return value / 24;
    }
    return value;
}

export function normalizeGalleryImages(
    images?: string[] | string | null,
): string[] {
    if (!images) return [];
    if (Array.isArray(images)) {
        return images.filter(Boolean);
    }
    return [images].filter(Boolean);
}

export function isCarAvailable(car: Car): boolean {
    if (typeof car.is_available === 'boolean') {
        return car.is_available;
    }

    if (typeof car.available === 'boolean') {
        return car.available;
    }

    if (
        car.status &&
        typeof car.status === 'object' &&
        'available' in car.status &&
        typeof car.status.available === 'boolean'
    ) {
        return car.status.available;
    }

    if (typeof car.status === 'string') {
        return !['unavailable', 'hidden', 'archived', 'inactive'].includes(
            car.status.toLowerCase(),
        );
    }

    return true;
}

export function getRentalDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 0;
    }

    const diff = end.getTime() - start.getTime();
    if (diff < 0) return 0;

    return Math.max(1, Math.ceil(diff / DAY_IN_MS));
}

export function formatRentalPeriod(
    startDate: string,
    endDate: string,
    locale: Locale = 'ru',
): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return locale === 'en'
            ? 'Dates are not selected'
            : locale === 'kk'
              ? 'Күндер таңдалмаған'
              : 'Даты не выбраны';
    }

    const formatter = new Intl.DateTimeFormat(
        locale === 'en' ? 'en-US' : locale === 'kk' ? 'kk-KZ' : 'ru-RU',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    );

    return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function formatRentalDaysLabel(
    days: number,
    locale: Locale = 'ru',
): string {
    if (locale === 'en') {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
    }

    if (locale === 'kk') {
        return `${days} күн`;
    }

    if (days % 10 === 1 && days % 100 !== 11) return `${days} день`;
    if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
        return `${days} дня`;
    }
    return `${days} дней`;
}

export function formatPriceTierLabel(
    price: Price,
    locale: Locale = 'ru',
): string {
    const from = normalizeTierBoundary(price.days_from);
    const to = normalizeTierBoundary(price.days_to);

    if (from === to) {
        return formatRentalDaysLabel(from, locale);
    }

    return `${formatRentalDaysLabel(from, locale)} - ${formatRentalDaysLabel(
        to,
        locale,
    )}`;
}

export function getMatchingPrice(
    prices: Price[] = [],
    days: number,
    withDriver: boolean,
): Price | null {
    if (!days) return null;

    const relevantPrices = prices
        .filter((price) => price.with_driver === withDriver)
        .sort((a, b) => a.days_from - b.days_from || a.days_to - b.days_to);

    const exactMatch = relevantPrices.find((price) => {
        const from = normalizeTierBoundary(price.days_from);
        const to = normalizeTierBoundary(price.days_to);
        return days >= from && days <= to;
    });

    if (exactMatch) return exactMatch;

    const fallback =
        relevantPrices.find((price) => {
            const from = normalizeTierBoundary(price.days_from);
            return days <= from;
        }) || relevantPrices[relevantPrices.length - 1];

    return fallback || null;
}

export function calculateRentalTotal(
    price: Price | null,
    days: number,
): number {
    if (!price || !days) return 0;
    return price.price_per_day * days;
}

export function getCarCategories(cars: Car[]): string[] {
    return Array.from(
        new Set(cars.map((car) => car.class).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, 'ru'));
}

export function getCarPreviewFacts(car: Car): Array<{
    label: string;
    value: string;
}> {
    return [
        { label: 'Класс', value: car.class || 'Премиум' },
        { label: 'Год', value: car.year ? String(car.year) : 'н/д' },
        { label: 'Мест', value: car.seats ? String(car.seats) : 'н/д' },
        { label: 'Топливо', value: car.fuel_type || 'н/д' },
    ];
}
