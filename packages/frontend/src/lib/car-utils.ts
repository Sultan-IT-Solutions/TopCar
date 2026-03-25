import type { Locale } from '@/lib/i18n';
import { Car, DurationUnit, Price } from '@/types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const CYRILLIC_TO_LATIN: Record<string, string> = {
    а: 'a',
    ә: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    ғ: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'i',
    і: 'i',
    к: 'k',
    қ: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    ң: 'n',
    о: 'o',
    ө: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ұ: 'u',
    ү: 'u',
    ф: 'f',
    х: 'h',
    һ: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
};

function transliterateForSlug(value: string): string {
    return Array.from(value.toLowerCase())
        .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
        .join('');
}

export function slugifyCarValue(value: string): string {
    return transliterateForSlug(value)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

export function ensureCarSlug(
    car: Pick<Car, 'id' | 'slug' | 'name' | 'brand'>,
): string {
    const normalizedExistingSlug = slugifyCarValue(car.slug || '');
    if (normalizedExistingSlug) {
        return normalizedExistingSlug;
    }

    const normalizedNameSlug = slugifyCarValue(
        [car.brand, car.name].filter(Boolean).join('-'),
    );
    if (normalizedNameSlug) {
        return normalizedNameSlug;
    }

    return `car-${car.id}`;
}

function normalizeTierBoundary(
    value: number,
    unit: DurationUnit = 'day',
): number {
    if (unit === 'day' && value >= 24 && value % 24 === 0) {
        return value / 24;
    }
    return value;
}

export function getPriceDurationUnit(
    price: Pick<Price, 'duration_unit'>,
): DurationUnit {
    return price.duration_unit === 'hour' ? 'hour' : 'day';
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

    const parseDateOnly = (value: string): Date | null => {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!match) return null;

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const date = new Date(Date.UTC(year, month - 1, day));

        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        ) {
            return null;
        }

        return date;
    };

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);

    if (!start || !end) {
        return 0;
    }

    const diff = end.getTime() - start.getTime();
    if (diff < 0) return 0;

    return Math.floor(diff / DAY_IN_MS) + 1;
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

export function formatRentalDurationLabel(
    value: number,
    unit: DurationUnit = 'day',
    locale: Locale = 'ru',
): string {
    if (unit === 'hour') {
        if (locale === 'en') {
            return `${value} ${value === 1 ? 'hour' : 'hours'}`;
        }

        if (locale === 'kk') {
            return `${value} сағат`;
        }

        if (value % 10 === 1 && value % 100 !== 11) return `${value} час`;
        if (
            [2, 3, 4].includes(value % 10) &&
            ![12, 13, 14].includes(value % 100)
        ) {
            return `${value} часа`;
        }

        return `${value} часов`;
    }

    return formatRentalDaysLabel(value, locale);
}

export function formatPriceTierLabel(
    price: Price,
    locale: Locale = 'ru',
): string {
    const unit = getPriceDurationUnit(price);
    const from = normalizeTierBoundary(price.days_from, unit);
    const to = normalizeTierBoundary(price.days_to, unit);

    if (from === to) {
        return formatRentalDurationLabel(from, unit, locale);
    }

    return `${formatRentalDurationLabel(from, unit, locale)} - ${formatRentalDurationLabel(
        to,
        unit,
        locale,
    )}`;
}

export function getMatchingPrice(
    prices: Price[] = [],
    durationValue: number,
    withDriver: boolean,
    durationUnit: DurationUnit = 'day',
): Price | null {
    if (!durationValue) return null;

    const relevantPrices = prices
        .filter(
            (price) =>
                price.with_driver === withDriver &&
                getPriceDurationUnit(price) === durationUnit,
        )
        .sort((a, b) => a.days_from - b.days_from || a.days_to - b.days_to);

    const exactMatch = relevantPrices.find((price) => {
        const from = normalizeTierBoundary(price.days_from, durationUnit);
        const to = normalizeTierBoundary(price.days_to, durationUnit);
        return durationValue >= from && durationValue <= to;
    });

    return exactMatch || null;
}

export function calculateRentalTotal(
    price: Price | null,
    durationValue: number,
): number {
    if (!price || !durationValue) return 0;

    if (getPriceDurationUnit(price) === 'hour') {
        return price.price_per_day;
    }

    return price.price_per_day * durationValue;
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
