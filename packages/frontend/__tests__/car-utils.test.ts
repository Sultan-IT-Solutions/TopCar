import {
    calculateRentalTotal,
    formatPriceTierLabel,
    getMatchingPrice,
    getRentalDays,
    isCarAvailable,
} from '@/lib/car-utils';
import { Car, Price } from '@/types';

const prices: Price[] = [
    {
        id: 1,
        car_id: 10,
        days_from: 1,
        days_to: 2,
        price_per_day: 50000,
        with_driver: false,
    },
    {
        id: 2,
        car_id: 10,
        days_from: 3,
        days_to: 7,
        price_per_day: 45000,
        with_driver: false,
    },
    {
        id: 3,
        car_id: 10,
        days_from: 1,
        days_to: 3,
        price_per_day: 70000,
        with_driver: true,
    },
];

describe('car-utils', () => {
    describe('getRentalDays', () => {
        it('returns full rental days for selected period', () => {
            expect(getRentalDays('2026-03-20', '2026-03-23')).toBe(3);
        });

        it('returns minimum 1 day for same-day rental', () => {
            expect(getRentalDays('2026-03-20', '2026-03-20')).toBe(1);
        });
    });

    describe('getMatchingPrice', () => {
        it('selects exact tariff by rental length', () => {
            const price = getMatchingPrice(prices, 4, false);
            expect(price?.id).toBe(2);
        });

        it('selects proper service type tariff', () => {
            const price = getMatchingPrice(prices, 2, true);
            expect(price?.id).toBe(3);
        });
    });

    describe('calculateRentalTotal', () => {
        it('multiplies daily price by rental days', () => {
            expect(calculateRentalTotal(prices[1], 4)).toBe(180000);
        });
    });

    describe('formatPriceTierLabel', () => {
        it('renders readable tariff labels', () => {
            expect(formatPriceTierLabel(prices[1])).toBe('3 дня - 7 дней');
        });
    });

    describe('isCarAvailable', () => {
        const baseCar: Car = {
            id: 10,
            name: 'Mercedes S-Class',
            slug: 'mercedes-s-class',
            brand: 'Mercedes',
            class: 'Luxury',
            description: 'Luxury sedan',
            image_url: '/cars/sclass.jpg',
            price_per_day: 50000,
        };

        it('uses boolean availability fields when present', () => {
            expect(isCarAvailable({ ...baseCar, is_available: false })).toBe(
                false,
            );
            expect(isCarAvailable({ ...baseCar, available: true })).toBe(true);
        });

        it('uses status object when available flag is nested', () => {
            expect(
                isCarAvailable({
                    ...baseCar,
                    status: { available: false, isNew: false },
                }),
            ).toBe(false);
        });
    });
});
