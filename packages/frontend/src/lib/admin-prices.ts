import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

export type AdminTariffInput = {
    carId: number;
    daysFrom: number;
    daysTo: number;
    pricePerDay: number;
    withDriver: boolean;
    conditions: string | null;
};

type ExistingTariff = {
    id: number;
    days_from: number;
    days_to: number;
};

export function normalizeAdminTariffInput(payload: Record<string, unknown>) {
    const carId = Number(payload.carId);
    const daysFrom = Number(payload.daysFrom);
    const daysTo = Number(payload.daysTo);
    const pricePerDay = Number(payload.pricePerDay);
    const withDriver =
        payload.withDriver === true ||
        payload.withDriver === 'true' ||
        payload.withDriver === 1 ||
        payload.withDriver === '1';
    const conditions = String(payload.conditions ?? '').trim() || null;

    return {
        carId,
        daysFrom,
        daysTo,
        pricePerDay,
        withDriver,
        conditions,
    } satisfies AdminTariffInput;
}

export function validateAdminTariffInput(input: AdminTariffInput) {
    if (!Number.isInteger(input.carId) || input.carId <= 0) {
        return 'Выберите автомобиль.';
    }

    if (!Number.isInteger(input.daysFrom) || input.daysFrom <= 0) {
        return 'Укажите корректное значение "от дней".';
    }

    if (!Number.isInteger(input.daysTo) || input.daysTo < input.daysFrom) {
        return 'Укажите корректное значение "до дней".';
    }

    if (!Number.isFinite(input.pricePerDay) || input.pricePerDay <= 0) {
        return 'Укажите корректную цену за сутки.';
    }

    return null;
}

export async function findOverlappingTariff(
    supabase: SupabaseClient,
    input: AdminTariffInput,
    excludeId?: number,
) {
    const { data, error } = await supabase
        .from('prices')
        .select('id, days_from, days_to')
        .eq('car_id', input.carId)
        .eq('with_driver', input.withDriver)
        .order('days_from', { ascending: true });

    if (error) {
        throw error;
    }

    const overlapping = (data as ExistingTariff[]).find((tariff) => {
        if (excludeId && tariff.id === excludeId) {
            return false;
        }

        return !(
            input.daysTo < tariff.days_from || input.daysFrom > tariff.days_to
        );
    });

    return overlapping ?? null;
}
